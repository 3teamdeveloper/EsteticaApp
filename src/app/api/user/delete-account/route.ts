import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * DELETE /api/user/delete-account
 * 
 * Elimina permanentemente la cuenta del usuario y todos sus datos asociados.
 * CUMPLE CON LEY 25.326 (Protección de Datos Personales - Argentina)
 * 
 * SE ELIMINA:
 * - Datos personales y de negocio
 * - Servicios, empleados, horarios, schedules
 * - Perfil público y configuraciones
 * - Turnos/citas creadas
 * - Tickets de soporte
 * 
 * SE CONSERVA (obligación legal):
 * - Registros de pagos (Ley 25.326 Art. 26)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = (await cookies()).get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token) as { id: number; email: string };
    const userId = decoded.id;

    console.log('🗑️ Iniciando eliminación de cuenta para usuario:', userId);

    // ====================================
    // ELIMINACIÓN EN TRANSACCIÓN ATÓMICA
    // ====================================
    await prisma.$transaction(async (tx) => {
      // 1. Registrar el usuario en el historial de usuarios eliminados
      const currentUser = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true, businessType: true }
      });

      if (currentUser) {
        await tx.deletedUser.create({
          data: {
            userId: currentUser.id,
            email: currentUser.email,
            role: currentUser.role,
            businessType: currentUser.businessType,
            reason: 'user_requested',
          }
        });
      }

      // 2. Obtener IDs de entidades relacionadas SOLO si es necesario
      const [employees, services] = await Promise.all([
        tx.employee.findMany({
          where: { userId },
          select: { id: true }
        }),
        tx.service.findMany({
          where: { userId },
          select: { id: true }
        })
      ]);
      
      const employeeIds = employees.map(e => e.id);
      const serviceIds = services.map(s => s.id);

      console.log(`📊 Encontrados: ${employeeIds.length} empleados, ${serviceIds.length} servicios`);

      // 3. Eliminar en paralelo todas las entidades que no dependen entre sí
      const deletionPromises = [];

      // RoundRobinTracking (relacionado a servicios)
      if (serviceIds.length > 0) {
        deletionPromises.push(
          tx.roundRobinTracking.deleteMany({
            where: { serviceId: { in: serviceIds } }
          })
        );
      }

      // Appointments como PRESTADOR
      deletionPromises.push(
        tx.appointment.deleteMany({ where: { userId } })
      );

      // Schedules
      deletionPromises.push(
        tx.schedule.deleteMany({ where: { userId } })
      );

      // EmployeeService (relación many-to-many)
      if (employeeIds.length > 0) {
        deletionPromises.push(
          tx.employeeService.deleteMany({
            where: { employeeId: { in: employeeIds } }
          })
        );
      }

      // BusinessHours
      deletionPromises.push(
        tx.businessHours.deleteMany({ where: { userId } })
      );

      // SupportTickets
      deletionPromises.push(
        tx.supportTicket.deleteMany({ where: { userId } })
      );

      // PublicProfile
      deletionPromises.push(
        tx.publicProfile.deleteMany({ where: { userId } })
      );

      // Ejecutar todas las eliminaciones en paralelo
      const results = await Promise.all(deletionPromises);
      console.log(`✅ Eliminados registros relacionados`);

      // 3. Eliminar Employees (después de EmployeeService)
      if (employeeIds.length > 0) {
        await tx.employee.deleteMany({ where: { userId } });
        console.log(`✅ Eliminados ${employeeIds.length} employees`);
      }

      // 4. Eliminar Services (después de RoundRobinTracking y EmployeeService)
      if (serviceIds.length > 0) {
        await tx.service.deleteMany({ where: { userId } });
        console.log(`✅ Eliminados ${serviceIds.length} services`);
      }

      // 5. NO eliminamos Payments (obligación legal - Ley 25.326 Art. 26)
      const paymentsCount = await tx.payment.count({ where: { userId } });
      if (paymentsCount > 0) {
        console.log(`📋 Conservados ${paymentsCount} registros de pagos (obligación legal)`);
      }

      // 6. Finalmente, eliminar el User
      await tx.user.delete({ where: { id: userId } });
      console.log(`✅ Usuario ${userId} eliminado exitosamente`);
    }, {
      maxWait: 10000, // Máximo tiempo de espera para adquirir la transacción: 10s
      timeout: 20000,  // Máximo tiempo de ejecución de la transacción: 20s
    });

    console.log('🎉 Cuenta eliminada completamente');

    // Eliminar cookie de sesión
    (await cookies()).delete('token');

    return NextResponse.json(
      { 
        success: true, 
        message: 'Cuenta eliminada exitosamente',
        note: 'Los registros de pagos se conservan por obligación legal (Ley 25.326)'
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error al eliminar cuenta:', error);
    
    // Errores específicos
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'No se puede eliminar la cuenta: existen referencias en la base de datos' },
        { status: 400 }
      );
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Error al eliminar la cuenta. Por favor, contacta a soporte.' },
      { status: 500 }
    );
  }
}
