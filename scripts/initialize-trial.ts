import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeTrialForExistingUsers() {
  try {
    console.log('🔍 Buscando usuarios sin trial configurado...');
    
    // Buscar usuarios que no tienen trial configurado
    const usersWithoutTrial = await prisma.user.findMany({
      where: {
        OR: [
          { trialStartDate: null },
          { trialEndDate: null }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    console.log(`📊 Encontrados ${usersWithoutTrial.length} usuarios sin trial configurado`);

    if (usersWithoutTrial.length === 0) {
      console.log('✅ Todos los usuarios ya tienen trial configurado');
      return;
    }

    // Inicializar trial para cada usuario
    for (const user of usersWithoutTrial) {
      const now = new Date();
      const trialEndDate = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 días

      await prisma.user.update({
        where: { id: user.id },
        data: {
          trialStartDate: now,
          trialEndDate: trialEndDate,
          isTrialActive: true,
          trialExpirationNotified: false
        }
      });

      console.log(`✅ Trial inicializado para ${user.name} (${user.email})`);
    }

    console.log('🎉 Proceso completado exitosamente');
  } catch (error) {
    console.error('❌ Error inicializando trials:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
initializeTrialForExistingUsers();
