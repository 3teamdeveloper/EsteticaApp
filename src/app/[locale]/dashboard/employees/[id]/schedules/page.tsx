"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import EmployeeScheduleManager from '@/components/dashboard/EmployeeScheduleManager';
import { useTranslations, useLocale } from 'next-intl';

interface Employee {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
}

export default function EmployeeSchedulesPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('employees.schedules');
  const locale = useLocale();
  const router = useRouter();
  const { id } = use(params);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
      } else {
        router.push(`/${locale}/dashboard/employees`);
      }
    } catch (error) {
      console.error(t('error_load'), error);
      router.push(`/${locale}/dashboard/employees`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          {t('not_found')}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/${locale}/dashboard/employees`)}
          className="mb-4 text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2 text-gray-800" />
          {t('back_button')}
        </Button>
        
        <h1 className="text-2xl font-bold text-gray-900">
          {t('title')} {employee.name}
        </h1>
        <p className="text-gray-800 mt-2">
          {t('subtitle')}
        </p>
      </div>

      <EmployeeScheduleManager 
        employeeId={employee.id} 
        employeeName={employee.name}
      />
    </div>
  );
} 