'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, BedDouble, X, Check, AlertCircle } from 'lucide-react';
import { getHabitacionesSupabase, getReservasSupabase } from '@/lib/supabase-data';
import type { Habitacion, Reserva } from '@/types';

interface DayAvailability {
  available: number;
  total: number;
  rooms: { habitacion: Habitacion; isAvailable: boolean }[];
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  availability: DayAvailability;
}

export default function CalendarioPage() {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [habs, res] = await Promise.all([
          getHabitacionesSupabase(),
          getReservasSupabase()
        ]);
        setHabitaciones(habs);
        setReservas(res);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  // Obtener disponibilidad para un dia especifico
  const getAvailabilityForDay = (date: Date): DayAvailability => {
    const dateStr = date.toISOString().split('T')[0];
    const rooms: { habitacion: Habitacion; isAvailable: boolean }[] = [];

    habitaciones.forEach(hab => {
      const hasReservation = reservas.some(r => {
        // Solo pendientes y confirmadas ocupan habitación
        if (r.estado !== 'pendiente' && r.estado !== 'confirmada') return false;
        if (r.idHabitacion !== hab.id) return false;

        const entryDate = new Date(r.fechaEntrada);
        const exitDate = new Date(r.fechaSalida);
        const checkDate = new Date(dateStr);

        return checkDate >= entryDate && checkDate < exitDate;
      });

      rooms.push({ habitacion: hab, isAvailable: !hasReservation });
    });

    const available = rooms.filter(r => r.isAvailable).length;
    return {
      available,
      total: habitaciones.length,
      rooms,
    };
  };

  // Generar dias del calendario
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];

    // Dias del mes anterior
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        availability: getAvailabilityForDay(date),
      });
    }

    // Dias del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        availability: getAvailabilityForDay(date),
      });
    }

    // Dias del mes siguiente para completar
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        availability: getAvailabilityForDay(date),
      });
    }

    return days;
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

  const getAvailabilityColor = (available: number, total: number) => {
    if (total === 0) return 'bg-gray-100';
    const percentage = (available / total) * 100;
    if (percentage === 100) return 'bg-green-100 hover:bg-green-200';
    if (percentage >= 50) return 'bg-yellow-100 hover:bg-yellow-200';
    if (percentage > 0) return 'bg-orange-100 hover:bg-orange-200';
    return 'bg-red-100 hover:bg-red-200';
  };

  const getAvailabilityTextColor = (available: number, total: number) => {
    if (total === 0) return 'text-gray-500';
    const percentage = (available / total) * 100;
    if (percentage === 100) return 'text-green-700';
    if (percentage >= 50) return 'text-yellow-700';
    if (percentage > 0) return 'text-orange-700';
    return 'text-red-700';
  };

  const today = new Date().toISOString().split('T')[0];

  // Calcular estadisticas del mes actual
  const currentMonthDays = calendarDays.filter(d => d.isCurrentMonth);
  const totalAvailableRoomNights = currentMonthDays.reduce((sum, d) => sum + d.availability.available, 0);
  const totalRoomNights = currentMonthDays.length * habitaciones.length;
  const occupancyRate = totalRoomNights > 0 ? Math.round(((totalRoomNights - totalAvailableRoomNights) / totalRoomNights) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {cargando ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando calendario...</p>
            </div>
          </div>
        ) : (
        <>
        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-2">
                Calendario de Disponibilidad
              </h1>
              <p className="text-lg text-gray-600">
                Consulta la disponibilidad de habitaciones
              </p>
            </div>
          </div>

          {/* Controles del calendario */}
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-primary-900" />
            </button>

            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-6 h-6 text-primary-900" />
              <h2 className="text-2xl font-bold text-primary-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>

            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-primary-900" />
            </button>
          </div>
        </div>

        {/* Leyenda */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="font-semibold text-lg mb-3 text-primary-900">Leyenda de Disponibilidad</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-sm">Todas disponibles</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-sm">Mas de 50% disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-400 rounded"></div>
              <span className="text-sm">Menos de 50% disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span className="text-sm">Sin disponibilidad</span>
            </div>
          </div>
        </div>

        {/* Calendario */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Encabezados de dias */}
          <div className="grid grid-cols-7 bg-primary-900 text-white">
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center font-semibold border-r border-primary-800 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Dias del calendario */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dateStr = day.date.toISOString().split('T')[0];
              const isToday = dateStr === today;
              const isPast = new Date(dateStr) < new Date(today);

              return (
                <button
                  key={index}
                  onClick={() => !isPast && setSelectedDay(day)}
                  disabled={isPast && !day.isCurrentMonth}
                  className={`min-h-24 border-r border-b border-gray-200 last:border-r-0 p-2 text-left transition-colors ${
                    !day.isCurrentMonth ? 'bg-gray-50 opacity-50' : getAvailabilityColor(day.availability.available, day.availability.total)
                  } ${isToday ? 'ring-2 ring-primary-500 ring-inset' : ''} ${
                    isPast ? 'cursor-default opacity-60' : 'cursor-pointer'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${
                    !day.isCurrentMonth ? 'text-gray-400' : isToday ? 'text-primary-700' : 'text-gray-700'
                  }`}>
                    {day.date.getDate()}
                  </div>

                  {day.isCurrentMonth && (
                    <div className={`text-xs font-medium ${getAvailabilityTextColor(day.availability.available, day.availability.total)}`}>
                      <div className="flex items-center gap-1">
                        <BedDouble className="w-3 h-3" />
                        <span>{day.availability.available}/{day.availability.total}</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resumen de ocupacion */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Habitaciones</h3>
            <p className="text-3xl font-bold text-primary-900">
              {habitaciones.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ocupacion del Mes</h3>
            <p className="text-3xl font-bold text-primary-900">
              {occupancyRate}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Noches Disponibles</h3>
            <p className="text-3xl font-bold text-green-600">
              {totalAvailableRoomNights}
            </p>
          </div>
        </div>
        </>
        )}
      </main>

      {/* Modal de disponibilidad del dia */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-primary-900">
                Disponibilidad - {selectedDay.date.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Habitaciones disponibles:</span>
                <span className={`font-bold text-lg ${getAvailabilityTextColor(selectedDay.availability.available, selectedDay.availability.total)}`}>
                  {selectedDay.availability.available} de {selectedDay.availability.total}
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedDay.availability.rooms.map(({ habitacion, isAvailable }) => (
                <div
                  key={habitacion.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isAvailable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BedDouble className={`w-5 h-5 ${isAvailable ? 'text-green-600' : 'text-red-600'}`} />
                    <div>
                      <p className="font-medium text-gray-900">Habitacion {habitacion.numero}</p>
                      <p className="text-sm text-gray-500 capitalize">{habitacion.tipo} - {habitacion.capacidad} personas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAvailable ? (
                      <>
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Disponible</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-700">Ocupada</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedDay.availability.available > 0 && (
              <a
                href="/reservar"
                className="block w-full mt-4 btn-primary text-center"
              >
                Hacer Reserva
              </a>
            )}

            <button
              onClick={() => setSelectedDay(null)}
              className="w-full mt-2 btn-secondary"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
