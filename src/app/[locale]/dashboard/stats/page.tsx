"use client";
import { useState, useEffect } from 'react';
import { BarChart2, Calendar, DollarSign, Users, PieChart, Clock, TrendingUp, UserCheck, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';

type RevenueDatum = { name: string; value: number };
type HourlyDatum = { hour: string; value: number };
type EvolutionDatum = { sem: string; value: number } | { mes: string; value: number };
type ClientesPieDatum = { name: string; value: number };

function getColor(idx: number) {
  const colors = [
    'bg-indigo-500', 'bg-pink-500', 'bg-green-500', 'bg-yellow-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-lime-500', 'bg-teal-500', 'bg-violet-500', 'bg-amber-500'
  ];
  return colors[idx % colors.length];
}

export default function Stats() {
  const t = useTranslations('stats');
  const tc = useTranslations('common');
  const [userId, setUserId] = useState<number | null>(null);
  const [overview, setOverview] = useState<any>(null);
  const [cancellations, setCancellations] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [revenueByService, setRevenueByService] = useState<Record<string, number> | null>(null);
  const [clientes, setClientes] = useState<any>(null);
  const [hourly, setHourly] = useState<Record<string, number> | null>(null);
  const [leadTime, setLeadTime] = useState<any>(null);
  const [evolution, setEvolution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setUserLoading(true);
      try {
        const res = await fetch('/api/dashboard', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUserId(data.id);
        } else {
          setUserId(null);
        }
      } catch {
        setUserId(null);
      } finally {
        setUserLoading(false);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;
    async function fetchAll() {
      setLoading(true);
      const [o, c, a, r, cl, h, l, e] = await Promise.all([
        fetch(`/api/stats`).then(r => r.json()),
        fetch(`/api/stats/cancellations`).then(r => r.json()),
        fetch(`/api/stats/attendance`).then(r => r.json()),
        fetch(`/api/stats/revenue-by-service`).then(r => r.json()),
        fetch(`/api/stats/clientes`).then(r => r.json()),
        fetch(`/api/stats/hourly-distribution`).then(r => r.json()),
        fetch(`/api/stats/lead-time`).then(r => r.json()),
        fetch(`/api/stats/evolution`).then(r => r.json()),
      ]);
      setOverview(o);
      setCancellations(c);
      setAttendance(a);
      setRevenueByService(r);
      setClientes(cl);
      setHourly(h);
      setLeadTime(l);
      setEvolution(e);
      setLoading(false);
    }
    fetchAll();
  }, [userId]);

  if (userLoading) return <div className="flex justify-center p-8">{t('loading_user')}</div>;
  if (!userId) return <div className="text-center text-red-500 p-8">{t('error_user')}</div>;
  if (loading) return <div className="flex justify-center p-8">{t('loading_stats')}</div>;
  if (!overview) return <div>{t('error_loading')}</div>;

  // Preparar datos para gráficos
  const revenueData: RevenueDatum[] = revenueByService ? Object.entries(revenueByService).map(([name, value]) => ({ name, value: Number(value) })) : [];
  const hourlyData: HourlyDatum[] = hourly ? Object.entries(hourly)
    .map(([hour, value]) => ({ 
      hour: `${hour.padStart(2, '0')}:00`, 
      value: Number(value) 
    }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour)) // Ordenar por hora
    : [];
  const clientesPie: ClientesPieDatum[] = clientes ? [
    { name: t('clients.new'), value: Number(clientes.nuevos) },
    { name: t('clients.recurring'), value: Number(clientes.recurrentes) }
  ] : [];
  const evolutionSem: EvolutionDatum[] = evolution ? Object.entries(evolution.porSemana).map(([sem, value]) => ({ sem, value: Number(value) })) : [];
  const evolutionMes: EvolutionDatum[] = evolution ? Object.entries(evolution.porMes).map(([mes, value]) => ({ mes, value: Number(value) })) : [];

  // helpers para gráficos
  const maxRevenue = Math.max(...revenueData.map((d) => d.value), 1);
  const maxHourly = Math.max(...hourlyData.map((d) => d.value), 1);
  const maxEvolutionSem = Math.max(...evolutionSem.map((d) => 'value' in d ? d.value : 0), 1);
  const maxEvolutionMes = Math.max(...evolutionMes.map((d) => 'value' in d ? d.value : 0), 1);
  const totalClientes = (clientesPie[0]?.value || 0) + (clientesPie[1]?.value || 0);

  return (
    <div className="space-y-8 px-2 py-10 sm:px-4 md:px-0">
      <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
      {/* Cards principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-blue-100 to-blue-300 rounded-xl shadow p-6 flex flex-col items-center">
          <Calendar className="w-10 h-10 text-blue-600 mb-2" />
          <span className="text-4xl font-bold text-blue-900">{overview.totalAppointments}</span>
          <span className="text-sm text-blue-800 mt-1">{t('cards.total_appointments')}</span>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-300 rounded-xl shadow p-6 flex flex-col items-center">
          <BarChart2 className="w-10 h-10 text-green-600 mb-2" />
          <span className="text-4xl font-bold text-green-900">{overview.confirmedAppointments}</span>
          <span className="text-sm text-green-800 mt-1">{t('cards.confirmed')}</span>
        </div>
        <div className="bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-xl shadow p-6 flex flex-col items-center">
          <DollarSign className="w-10 h-10 text-yellow-600 mb-2" />
          <span className="text-4xl font-bold text-yellow-900">${overview.estimatedRevenue}</span>
          <span className="text-sm text-yellow-800 mt-1">{t('cards.estimated_revenue')}</span>
        </div>
        <div className="bg-gradient-to-br from-purple-100 to-purple-300 rounded-xl shadow p-6 flex flex-col items-center">
          <Users className="w-10 h-10 text-purple-600 mb-2" />
          <span className="text-4xl font-bold text-purple-900">{overview.pendingAppointments}</span>
          <span className="text-sm text-purple-800 mt-1">{t('cards.pending')}</span>
        </div>
      </div>
      {/* Métricas avanzadas */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Cancelaciones */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-6 h-6 text-rose-500" />
            <span className="font-semibold text-lg">{t('cancellations.title')}</span>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-bold text-rose-600">{cancellations.cancelled}</span>
            <span className="text-gray-600">({cancellations.porcentaje}% {t('cancellations.of_total')})</span>
          </div>
        </div>
        {/* Tasa de asistencia */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-6 h-6 text-green-600" />
            <span className="font-semibold text-lg">{t('attendance.title')}</span>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-bold text-green-600">{attendance.tasa}%</span>
            <span className="text-gray-600">({attendance.completados} {t('attendance.of_confirmed')} {attendance.totalConfirmados} {t('attendance.confirmed_label')})</span>
          </div>
        </div>
        {/* Ingresos por servicio (barras horizontales) */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-6 h-6 text-yellow-500" />
            <span className="font-semibold text-lg">{t('revenue_by_service')}</span>
          </div>
          {revenueData.length > 0 ? (
            <div className="space-y-2 mt-2">
              {revenueData.map((d, idx) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-32 truncate text-sm text-gray-700">{d.name}</span>
                  <div className="flex-1 h-5 rounded bg-gradient-to-r from-indigo-400 to-indigo-600 relative">
                    <div className={`absolute left-0 top-0 h-5 rounded ${getColor(idx)}`} style={{ width: `${(d.value / maxRevenue) * 100}%`, minWidth: 8 }}></div>
                  </div>
                  <span className="ml-2 font-bold text-indigo-900">${d.value}</span>
                </div>
              ))}
            </div>
          ) : <div className="text-gray-400 text-center py-8">{t('no_data')}</div>}
        </div>
        {/* Clientes nuevos vs recurrentes (torta simple) */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-6 h-6 text-blue-500" />
            <span className="font-semibold text-lg">{t('clients.title')}</span>
          </div>
          {totalClientes > 0 ? (
            <div className="flex items-center gap-6 justify-center mt-2">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <circle cx="18" cy="18" r="16" fill="#f3f4f6" />
                  <circle
                    cx="18" cy="18" r="16"
                    fill="transparent"
                    stroke="#6366f1"
                    strokeWidth="4"
                    strokeDasharray={`${(clientesPie[0].value / totalClientes) * 100} ${100 - (clientesPie[0].value / totalClientes) * 100}`}
                    strokeDashoffset="25"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-blue-700">{clientesPie[0].value}</span>
                  <span className="text-xs text-gray-500">{t('clients.new')}</span>
                </div>
              </div>
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <circle cx="18" cy="18" r="16" fill="#f3f4f6" />
                  <circle
                    cx="18" cy="18" r="16"
                    fill="transparent"
                    stroke="#f59e42"
                    strokeWidth="4"
                    strokeDasharray={`${(clientesPie[1].value / totalClientes) * 100} ${100 - (clientesPie[1].value / totalClientes) * 100}`}
                    strokeDashoffset="25"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-yellow-700">{clientesPie[1].value}</span>
                  <span className="text-xs text-gray-500">{t('clients.recurring')}</span>
                </div>
              </div>
            </div>
          ) : <div className="text-gray-400 text-center py-8">{t('no_data')}</div>}
        </div>
        {/* Distribución horaria (barras verticales con gradiente de intensidad) */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col gap-2 col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-6 h-6 text-indigo-500" />
            <span className="font-semibold text-lg">{t('hourly.title')}</span>
          </div>
          
          {hourlyData.length > 0 ? (
            <div className="space-y-4">
              {/* Leyenda de intensidad */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span>{t('hourly.less_appointments')}</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-3 bg-indigo-100 rounded"></div>
                  <div className="w-4 h-3 bg-indigo-300 rounded"></div>
                  <div className="w-4 h-3 bg-indigo-500 rounded"></div>
                  <div className="w-4 h-3 bg-indigo-700 rounded"></div>
                </div>
                <span>{t('hourly.more_appointments')}</span>
              </div>
              
              {/* Gráfico de barras */}
              <div className="overflow-x-auto pt-8 -mt-2">
                <div className="flex items-end gap-1 h-32 border-b border-gray-200" style={{ minWidth: '600px' }}>
                  {hourlyData.map((d) => {
                    // Calcular intensidad del color basado en el valor
                    const intensity = d.value / maxHourly;
                    let colorClass = 'bg-gray-100'; // Por defecto muy claro para valores 0
                    
                    if (d.value > 0) {
                      if (intensity > 0.75) colorClass = 'bg-indigo-700'; // Muy alto
                      else if (intensity > 0.5) colorClass = 'bg-indigo-500'; // Alto
                      else if (intensity > 0.25) colorClass = 'bg-indigo-300'; // Medio
                      else colorClass = 'bg-indigo-200'; // Bajo pero visible
                    }
                    
                    // Altura mínima más visible para valores > 0
                    const barHeight = d.value > 0 
                      ? Math.max((d.value / maxHourly) * 80, 12) // Mínimo 12px para valores > 0
                      : 2; // 2px para valores 0
                    
                    // Calcular si el tooltip debe ir arriba o abajo según la altura de la barra
                    const isHighBar = barHeight > 60;
                    
                    return (
                      <div key={d.hour} className="flex flex-col items-center group relative" style={{ minWidth: '20px', flex: '1 0 20px' }}>
                        <div 
                          className={`w-full max-w-6 mx-auto rounded-t transition-all duration-200 hover:opacity-80 ${colorClass} border border-gray-200`} 
                          style={{ height: `${barHeight}px` }}
                        ></div>
                        {d.value > 0 && (
                          <span className="text-xs text-gray-700 font-bold">{d.value}</span>
                        )}

                        <span className="text-xs text-gray-500 mt-1 font-medium truncate w-full text-center">
                          {d.hour.replace(':00','')}
                        </span>
                        
                        {/* Tooltip adaptativo - arriba para barras altas, abajo para barras bajas */}
                        <div className={`absolute ${isHighBar ? 'top-0 mt-2' : 'bottom-full mb-2'} left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-[999]`}>
                          {d.hour}: {d.value} {t('hourly.appointments')}
                          {/* Flecha del tooltip */}
                          <div className={`absolute left-1/2 transform -translate-x-1/2 w-0 h-0 ${isHighBar ? 'top-full border-l-2 border-r-2 border-t-4 border-transparent border-t-gray-800' : 'bottom-full border-l-2 border-r-2 border-b-4 border-transparent border-b-gray-800'}`}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Indicador de scroll en mobile */}
              <div className="text-xs text-gray-400 text-center mt-2 sm:hidden">
                {t('hourly.scroll_hint')}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">Sin datos para mostrar</div>
              <div className="text-xs text-gray-500">
                {hourly ? 'Datos recibidos pero vacíos' : 'No se recibieron datos del API'}
              </div>
            </div>
          )}
        </div>
        {/* Evolución semanal (línea simple) */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-pink-500" />
            <span className="font-semibold text-lg">{t('evolution.weekly')}</span>
          </div>
          {evolutionSem.length > 1 ? (
            <svg viewBox="0 0 200 80" className="w-full h-24">
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3"
                points={evolutionSem.map((d, i) => `${(i / (evolutionSem.length - 1)) * 200},${80 - (('value' in d ? d.value : 0) / maxEvolutionSem) * 70}`).join(' ')}
              />
              {evolutionSem.map((d, i) => (
                <circle
                  key={i}
                  cx={(i / (evolutionSem.length - 1)) * 200}
                  cy={80 - (('value' in d ? d.value : 0) / maxEvolutionSem) * 70}
                  r="3"
                  fill="#f43f5e"
                />
              ))}
            </svg>
          ) : <div className="text-gray-400 text-center py-8">{t('no_data')}</div>}
        </div>
        {/* Evolución mensual (línea simple) */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <span className="font-semibold text-lg">{t('evolution.monthly')}</span>
          </div>
          {evolutionMes.length > 1 ? (
            <svg viewBox="0 0 200 80" className="w-full h-24">
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                points={evolutionMes.map((d, i) => `${(i / (evolutionMes.length - 1)) * 200},${80 - (('value' in d ? d.value : 0) / maxEvolutionMes) * 70}`).join(' ')}
              />
              {evolutionMes.map((d, i) => (
                <circle
                  key={i}
                  cx={(i / (evolutionMes.length - 1)) * 200}
                  cy={80 - (('value' in d ? d.value : 0) / maxEvolutionMes) * 70}
                  r="3"
                  fill="#6366f1"
                />
              ))}
            </svg>
          ) : <div className="text-gray-400 text-center py-8">{t('no_data')}</div>}
        </div>
        {/* Anticipación promedio */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-6 h-6 text-orange-500" />
            <span className="font-semibold text-lg">{t('lead_time.title')}</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-3xl font-bold text-orange-600">{leadTime.promedioDias} {t('lead_time.days')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}