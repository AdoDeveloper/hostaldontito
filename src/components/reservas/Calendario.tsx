'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarioProps {
  fechaInicio: string | null;
  fechaFin: string | null;
  onSeleccionFecha: (fecha: string) => void;
  fechasOcupadas?: string[];
}

export default function Calendario({
  fechaInicio,
  fechaFin,
  onSeleccionFecha,
  fechasOcupadas = [],
}: CalendarioProps) {
  const [mesActual, setMesActual] = useState(new Date());

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const obtenerDiasDelMes = (fecha: Date) => {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const dias: (Date | null)[] = [];

    // Días vacíos al inicio
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }

    // Días del mes
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(new Date(año, mes, i));
    }

    return dias;
  };

  const cambiarMes = (direccion: number) => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + direccion, 1));
  };

  const esFechaSeleccionada = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return fechaStr === fechaInicio || fechaStr === fechaFin;
  };

  const esFechaEnRango = (fecha: Date) => {
    if (!fechaInicio || !fechaFin) return false;
    const fechaStr = fecha.toISOString().split('T')[0];
    return fechaStr > fechaInicio && fechaStr < fechaFin;
  };

  const esFechaOcupada = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return fechasOcupadas.includes(fechaStr);
  };

  const esFechaPasada = (fecha: Date) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fecha < hoy;
  };

  const manejarClickDia = (fecha: Date) => {
    if (esFechaPasada(fecha) || esFechaOcupada(fecha)) return;
    const fechaStr = fecha.toISOString().split('T')[0];
    onSeleccionFecha(fechaStr);
  };

  const dias = obtenerDiasDelMes(mesActual);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => cambiarMes(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h3 className="text-xl md:text-2xl font-bold text-primary-900">
          {nombresMeses[mesActual.getMonth()]} {mesActual.getFullYear()}
        </h3>
        <button
          onClick={() => cambiarMes(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Nombres de los días */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {nombresDias.map((dia) => (
          <div
            key={dia}
            className="text-center font-bold text-gray-600 text-base md:text-lg py-2"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {dias.map((fecha, index) => {
          if (!fecha) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const esSeleccionada = esFechaSeleccionada(fecha);
          const esEnRango = esFechaEnRango(fecha);
          const esPasada = esFechaPasada(fecha);
          const esOcupada = esFechaOcupada(fecha);

          let claseBase = 'aspect-square flex items-center justify-center rounded-lg text-lg font-semibold transition-all cursor-pointer min-h-[44px]';

          if (esPasada || esOcupada) {
            claseBase += ' bg-gray-200 text-gray-400 cursor-not-allowed';
          } else if (esSeleccionada) {
            claseBase += ' bg-primary-800 text-white hover:bg-primary-700';
          } else if (esEnRango) {
            claseBase += ' bg-primary-100 text-primary-900 hover:bg-primary-200';
          } else {
            claseBase += ' bg-white hover:bg-green-50 text-gray-900 border-2 border-green-500';
          }

          return (
            <button
              key={index}
              onClick={() => manejarClickDia(fecha)}
              disabled={esPasada || esOcupada}
              className={claseBase}
              aria-label={`Seleccionar ${fecha.toLocaleDateString()}`}
            >
              {fecha.getDate()}
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-base">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-green-500 border-2 border-green-500 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <span>Ocupado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary-800 rounded"></div>
          <span>Seleccionado</span>
        </div>
      </div>
    </div>
  );
}
