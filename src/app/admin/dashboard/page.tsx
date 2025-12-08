'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Calendar,
  Users,
  BarChart3,
  RefreshCw,
  Search,
  Eye,
  X,
  Check,
  TrendingUp,
  DollarSign,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  LayoutGrid,
  AlertTriangle,
  FileText,
  Printer,
  Loader2,
  Download,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  getReservasSupabase,
  getHabitacionesSupabase,
  getHuespedesSupabase,
  obtenerEstadisticasSupabase,
  actualizarReservaSupabase,
  incrementarVisitaHuespedSupabase,
} from '@/lib/supabase-data';
import AdminLayout from '@/components/AdminLayout';
import type { Reserva, Habitacion, Huesped } from '@/types';

export default function DashboardPage() {
  const [cargando, setCargando] = useState(true);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'reservas' | 'calendario'>('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [alertaConfig, setAlertaConfig] = useState<{
    tipo: 'confirmar' | 'cancelar';
    reserva: Reserva | null;
  }>({ tipo: 'confirmar', reserva: null });
  const [mostrarFactura, setMostrarFactura] = useState(false);
  const [facturaReserva, setFacturaReserva] = useState<Reserva | null>(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const facturaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [reservasData, habitacionesData, huespedesData, estadisticasData] = await Promise.all([
        getReservasSupabase(),
        getHabitacionesSupabase(),
        getHuespedesSupabase(),
        obtenerEstadisticasSupabase(),
      ]);
      setReservas(reservasData);
      setHabitaciones(habitacionesData);
      setHuespedes(huespedesData);
      setEstadisticas(estadisticasData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const obtenerHabitacion = (idHabitacion: string): Habitacion | undefined => {
    return habitaciones.find(h => h.id === idHabitacion);
  };

  const obtenerHuesped = (idHuesped: string): Huesped | undefined => {
    return huespedes.find(h => h.id === idHuesped);
  };

  const mostrarAlertaConfirmacion = (reserva: Reserva, tipo: 'confirmar' | 'cancelar') => {
    setAlertaConfig({ tipo, reserva });
    setMostrarAlerta(true);
  };

  const confirmarAccion = async () => {
    if (alertaConfig.reserva) {
      const nuevoEstado = alertaConfig.tipo === 'confirmar' ? 'confirmada' : 'cancelada';
      try {
        await actualizarReservaSupabase(alertaConfig.reserva.id, { estado: nuevoEstado });

        // Si se confirma la reserva, incrementar el historial de visitas (registrar el ingreso)
        if (alertaConfig.tipo === 'confirmar' && alertaConfig.reserva.idHuesped) {
          await incrementarVisitaHuespedSupabase(alertaConfig.reserva.idHuesped);
        }

        await cargarDatos();
        setReservaSeleccionada(null);
        setMostrarModal(false);
      } catch (error) {
        console.error('Error actualizando reserva:', error);
      }
    }
    setMostrarAlerta(false);
    setAlertaConfig({ tipo: 'confirmar', reserva: null });
  };

  const cambiarEstadoReserva = async (reserva: Reserva, nuevoEstado: Reserva['estado']) => {
    if (nuevoEstado === 'confirmada') {
      mostrarAlertaConfirmacion(reserva, 'confirmar');
    } else if (nuevoEstado === 'cancelada') {
      mostrarAlertaConfirmacion(reserva, 'cancelar');
    } else {
      try {
        await actualizarReservaSupabase(reserva.id, { estado: nuevoEstado });
        await cargarDatos();
        setReservaSeleccionada(null);
        setMostrarModal(false);
      } catch (error) {
        console.error('Error actualizando reserva:', error);
      }
    }
  };

  const abrirFactura = (reserva: Reserva) => {
    setFacturaReserva(reserva);
    setMostrarFactura(true);
  };

  const generarFacturaPDF = async () => {
    if (!facturaRef.current || !facturaReserva) return;

    setGenerandoPDF(true);
    try {
      const canvas = await html2canvas(facturaRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Factura-${facturaReserva.codigoReserva}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      window.print();
    } finally {
      setGenerandoPDF(false);
    }
  };

  const calcularNoches = (fechaEntrada: string, fechaSalida: string): number => {
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    return Math.ceil((salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));
  };

  const reservasFiltradas = reservas
    .filter(r => {
      if (filtroEstado === 'todas') return true;
      return r.estado === filtroEstado;
    })
    .filter(r => {
      if (!busqueda) return true;
      const huesped = obtenerHuesped(r.idHuesped);
      const habitacion = obtenerHabitacion(r.idHabitacion);
      return (
        r.id.toLowerCase().includes(busqueda.toLowerCase()) ||
        huesped?.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
        habitacion?.numero.includes(busqueda)
      );
    })
    .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());

  const obtenerOcupacionSemanal = () => {
    const hoy = new Date();
    const diasSemana = [];
    
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + i);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      const reservasDelDia = reservas.filter(r => {
        // Solo pendientes y confirmadas ocupan habitación
        if (r.estado !== 'pendiente' && r.estado !== 'confirmada') return false;
        const entrada = new Date(r.fechaEntrada);
        const salida = new Date(r.fechaSalida);
        return fecha >= entrada && fecha < salida;
      });

      diasSemana.push({
        fecha: fechaStr,
        dia: fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        ocupadas: reservasDelDia.length,
        total: habitaciones.length,
        porcentaje: Math.round((reservasDelDia.length / habitaciones.length) * 100),
      });
    }
    
    return diasSemana;
  };

  // Funciones del calendario
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const getReservaForDay = (habitacionId: string, date: Date): Reserva | null => {
    const dateStr = date.toISOString().split('T')[0];
    return reservas.find(r => {
      // Solo pendientes y confirmadas ocupan habitación
      if (r.estado !== 'pendiente' && r.estado !== 'confirmada') return false;
      if (r.idHabitacion !== habitacionId) return false;
      const entryDate = new Date(r.fechaEntrada);
      const exitDate = new Date(r.fechaSalida);
      const checkDate = new Date(dateStr);
      return checkDate >= entryDate && checkDate < exitDate;
    }) || null;
  };

  const isReservaStart = (reserva: Reserva, date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return reserva.fechaEntrada === dateStr;
  };

  const getReservaDuration = (reserva: Reserva): number => {
    const entrada = new Date(reserva.fechaEntrada);
    const salida = new Date(reserva.fechaSalida);
    return Math.ceil((salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmada': return 'bg-green-500';
      case 'pendiente': return 'bg-yellow-500';
      case 'completada': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const today = new Date().toISOString().split('T')[0];
  const daysInMonth = getDaysInMonth();

  return (
    <AdminLayout>
      {cargando ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-800 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Cargando datos...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Navegación interna del dashboard */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* Tabs de navegación */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setVistaActual('dashboard')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  vistaActual === 'dashboard'
                    ? 'bg-primary-800 text-white'
                    : 'bg-white text-primary-800 hover:bg-primary-50 border border-gray-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Resumen</span>
              </button>
              <button
                onClick={() => setVistaActual('reservas')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  vistaActual === 'reservas'
                    ? 'bg-primary-800 text-white'
                    : 'bg-white text-primary-800 hover:bg-primary-50 border border-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Lista Reservas</span>
              </button>
              <button
                onClick={() => setVistaActual('calendario')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  vistaActual === 'calendario'
                    ? 'bg-primary-800 text-white'
                    : 'bg-white text-primary-800 hover:bg-primary-50 border border-gray-200'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Calendario</span>
              </button>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              <button
                onClick={cargarDatos}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>
          </div>

          {/* VISTA DASHBOARD */}
        {vistaActual === 'dashboard' && estadisticas && (
          <div>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base text-gray-600 mb-1">Ocupación Hoy</p>
                    <p className="text-4xl font-bold text-green-700 mb-2">
                      {estadisticas.ocupacionHoy}%
                    </p>
                    <p className="text-base text-gray-600">
                      {estadisticas.habitacionesOcupadas} de {estadisticas.totalHabitaciones} habitaciones
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-600" />
                </div>
              </div>

              <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base text-gray-600 mb-1">Ingresos del Mes</p>
                    <p className="text-4xl font-bold text-blue-700 mb-2">
                      ${estadisticas.ingresosMes}
                    </p>
                    <p className="text-base text-green-600 font-semibold">
                      +23% vs mes anterior
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-blue-600" />
                </div>
              </div>

              <div className="card bg-gradient-to-br from-gold-50 to-gold-100 border-2 border-gold-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base text-gray-600 mb-1">Reservas Futuras</p>
                    <p className="text-4xl font-bold text-gold-700 mb-2">
                      {estadisticas.reservasFuturas}
                    </p>
                    <p className="text-base text-gray-600">
                      Próximos 30 días
                    </p>
                  </div>
                  <Calendar className="w-12 h-12 text-gold-600" />
                </div>
              </div>

              <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base text-gray-600 mb-1">Total Huéspedes</p>
                    <p className="text-4xl font-bold text-purple-700 mb-2">
                      {estadisticas.totalHuespedes}
                    </p>
                    <p className="text-base text-gray-600">
                      Registrados en el sistema
                    </p>
                  </div>
                  <Users className="w-12 h-12 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Ocupación Semanal */}
            <div className="card mb-8">
              <h3 className="text-2xl font-bold mb-6 text-primary-900">
                Vista de Ocupación - Próximos 7 Días
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {obtenerOcupacionSemanal().map((dia) => (
                  <div key={dia.fecha} className="text-center">
                    <div className="bg-primary-100 rounded-t-lg py-2 font-semibold text-primary-900">
                      {dia.dia}
                    </div>
                    <div
                      className={`py-8 rounded-b-lg ${
                        dia.porcentaje >= 75
                          ? 'bg-green-100'
                          : dia.porcentaje >= 50
                          ? 'bg-gold-100'
                          : 'bg-red-100'
                      }`}
                    >
                      <div className="text-3xl font-bold mb-1">
                        {dia.ocupadas}/{dia.total}
                      </div>
                      <div className="text-lg font-semibold">
                        {dia.porcentaje}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reservas Recientes */}
            <div className="card">
              <h3 className="text-2xl font-bold mb-6 text-primary-900">Reservas Recientes</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-primary-100">
                      <th className="px-4 py-3 text-left text-base font-bold">Código</th>
                      <th className="px-4 py-3 text-left text-base font-bold">Huésped</th>
                      <th className="px-4 py-3 text-left text-base font-bold">Hab.</th>
                      <th className="px-4 py-3 text-left text-base font-bold">Entrada</th>
                      <th className="px-4 py-3 text-left text-base font-bold">Salida</th>
                      <th className="px-4 py-3 text-left text-base font-bold">Estado</th>
                      <th className="px-4 py-3 text-left text-base font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservasFiltradas.slice(0, 10).map((reserva) => {
                      const huesped = obtenerHuesped(reserva.idHuesped);
                      const habitacion = obtenerHabitacion(reserva.idHabitacion);

                      return (
                        <tr key={reserva.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-base font-medium">{reserva.codigoReserva}</td>
                          <td className="px-4 py-3 text-base">{huesped?.nombreCompleto}</td>
                          <td className="px-4 py-3 text-base">{habitacion?.numero}</td>
                          <td className="px-4 py-3 text-base">
                            {new Date(reserva.fechaEntrada + 'T00:00:00').toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-4 py-3 text-base">
                            {new Date(reserva.fechaSalida + 'T00:00:00').toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                reserva.estado === 'confirmada'
                                  ? 'bg-green-100 text-green-800'
                                  : reserva.estado === 'pendiente'
                                  ? 'bg-gold-100 text-gold-800'
                                  : reserva.estado === 'cancelada'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {reserva.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-base font-bold">
                            ${reserva.precioTotal}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VISTA RESERVAS */}
        {vistaActual === 'reservas' && (
          <div>
            {/* Filtros y búsqueda */}
            <div className="card mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Buscar por ID, nombre o habitación..."
                      className="w-full pl-12 pr-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {['todas', 'confirmada', 'pendiente', 'cancelada', 'completada'].map((estado) => (
                    <button
                      key={estado}
                      onClick={() => setFiltroEstado(estado)}
                      className={`px-6 py-3 rounded-lg font-semibold capitalize transition-colors min-h-[44px] ${
                        filtroEstado === estado
                          ? 'bg-primary-800 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {estado}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabla de reservas */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-primary-900">
                  Gestión de Reservas ({reservasFiltradas.length})
                </h3>
              </div>

              {reservasFiltradas.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-600">No se encontraron reservas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservasFiltradas.map((reserva) => {
                    const huesped = obtenerHuesped(reserva.idHuesped);
                    const habitacion = obtenerHabitacion(reserva.idHabitacion);

                    return (
                      <div
                        key={reserva.id}
                        className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary-400 transition-colors"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Código de Reserva</p>
                            <p className="text-lg font-bold text-primary-900">{reserva.codigoReserva}</p>
                            <p className="text-base text-gray-700 mt-2">{huesped?.nombreCompleto}</p>
                            <p className="text-sm text-gray-600">{huesped?.correoElectronico}</p>
                            <p className="text-sm text-gray-600">{huesped?.telefono}</p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">Habitación</p>
                            <p className="text-lg font-bold capitalize">{habitacion?.tipo}</p>
                            <p className="text-base text-gray-700">#{habitacion?.numero}</p>
                            <p className="text-sm text-gray-600 mt-2">
                              {reserva.numPersonas} {reserva.numPersonas === 1 ? 'persona' : 'personas'}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">Fechas</p>
                            <p className="text-base text-gray-700">
                              <strong>Entrada:</strong>{' '}
                              {new Date(reserva.fechaEntrada + 'T00:00:00').toLocaleDateString('es-ES')}
                            </p>
                            <p className="text-base text-gray-700">
                              <strong>Salida:</strong>{' '}
                              {new Date(reserva.fechaSalida + 'T00:00:00').toLocaleDateString('es-ES')}
                            </p>
                            <p className="text-base text-gray-700 mt-2">
                              <strong>Total:</strong>{' '}
                              <span className="text-xl font-bold text-green-600">
                                ${reserva.precioTotal}
                              </span>
                            </p>
                          </div>

                          <div className="flex flex-col space-y-2">
                            <span
                              className={`px-4 py-2 rounded-lg text-base font-semibold text-center ${
                                reserva.estado === 'confirmada'
                                  ? 'bg-green-100 text-green-800'
                                  : reserva.estado === 'pendiente'
                                  ? 'bg-gold-100 text-gold-800'
                                  : reserva.estado === 'cancelada'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {reserva.estado.toUpperCase()}
                            </span>

                            <button
                              onClick={() => {
                                setReservaSeleccionada(reserva);
                                setMostrarModal(true);
                              }}
                              className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-800 hover:bg-primary-700 text-white rounded-lg transition-colors min-h-[44px]"
                            >
                              <Eye className="w-5 h-5" />
                              <span>Ver Detalles</span>
                            </button>

                            {reserva.estado === 'pendiente' && (
                              <button
                                onClick={() => cambiarEstadoReserva(reserva, 'confirmada')}
                                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors min-h-[44px]"
                              >
                                <Check className="w-5 h-5" />
                                <span>Confirmar</span>
                              </button>
                            )}

                            {(reserva.estado === 'confirmada' || reserva.estado === 'pendiente') && (
                              <button
                                onClick={() => cambiarEstadoReserva(reserva, 'cancelada')}
                                className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors min-h-[44px]"
                              >
                                <X className="w-5 h-5" />
                                <span>Cancelar</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {reserva.notas && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Notas adicionales:</p>
                            <p className="text-base text-gray-700">{reserva.notas}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VISTA CALENDARIO */}
        {vistaActual === 'calendario' && (
          <div>
            {/* Controles del calendario */}
            <div className="card mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-primary-900" />
                  </button>
                  <h2 className="text-2xl font-bold text-primary-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-primary-900" />
                  </button>
                </div>

                {/* Selector de vista */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      viewMode === 'timeline'
                        ? 'bg-primary-800 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Timeline</span>
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      viewMode === 'calendar'
                        ? 'bg-primary-800 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>Calendario</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Leyenda */}
            <div className="card mb-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Confirmada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Pendiente</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Completada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                  <span className="text-sm">Disponible</span>
                </div>
              </div>
            </div>

            {/* Vista Timeline */}
            {viewMode === 'timeline' && (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Header con dias */}
                    <div className="flex border-b border-gray-200">
                      <div className="w-32 flex-shrink-0 p-3 bg-primary-900 text-white font-semibold border-r border-primary-800">
                        Habitacion
                      </div>
                      <div className="flex flex-1">
                        {daysInMonth.map((day, idx) => {
                          const dateStr = day.toISOString().split('T')[0];
                          const isToday = dateStr === today;
                          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                          return (
                            <div
                              key={idx}
                              className={`flex-1 min-w-[40px] p-2 text-center border-r border-gray-200 last:border-r-0 ${
                                isToday ? 'bg-primary-100' : isWeekend ? 'bg-gray-50' : 'bg-white'
                              }`}
                            >
                              <div className="text-xs text-gray-500">
                                {dayNames[day.getDay()].substring(0, 1)}
                              </div>
                              <div className={`text-sm font-semibold ${isToday ? 'text-primary-700' : 'text-gray-700'}`}>
                                {day.getDate()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Filas por habitacion */}
                    {habitaciones.map(hab => (
                      <div key={hab.id} className="flex border-b border-gray-200 last:border-b-0">
                        <div className="w-32 flex-shrink-0 p-3 bg-gray-50 border-r border-gray-200">
                          <div className="font-semibold text-gray-900">{hab.numero}</div>
                          <div className="text-xs text-gray-500 capitalize">{hab.tipo}</div>
                        </div>
                        <div className="flex flex-1 relative">
                          {daysInMonth.map((day, idx) => {
                            const reserva = getReservaForDay(hab.id, day);
                            const dateStr = day.toISOString().split('T')[0];
                            const isToday = dateStr === today;
                            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                            const isStart = reserva && isReservaStart(reserva, day);

                            return (
                              <div
                                key={idx}
                                className={`flex-1 min-w-[40px] min-h-[50px] border-r border-gray-200 last:border-r-0 relative ${
                                  isToday ? 'bg-primary-50' : isWeekend ? 'bg-gray-50' : ''
                                }`}
                              >
                                {reserva && isStart && (
                                  <button
                                    onClick={() => {
                                      setReservaSeleccionada(reserva);
                                      setMostrarModal(true);
                                    }}
                                    className={`absolute top-1 left-0 h-[calc(100%-8px)] z-10 rounded-md text-xs text-white font-medium px-2 flex items-center truncate hover:opacity-90 transition-opacity ${getEstadoColor(reserva.estado)}`}
                                    style={{
                                      width: `calc(${getReservaDuration(reserva) * 100}% - 4px)`,
                                      maxWidth: `calc(${(daysInMonth.length - idx) * 100}% - 4px)`
                                    }}
                                    title={`${obtenerHuesped(reserva.idHuesped)?.nombreCompleto || 'Huesped'}`}
                                  >
                                    <span className="truncate">
                                      {obtenerHuesped(reserva.idHuesped)?.nombreCompleto?.split(' ')[0] || 'Reserva'}
                                    </span>
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Vista Calendario Mensual */}
            {viewMode === 'calendar' && (
              <div className="card overflow-hidden">
                <div className="grid grid-cols-7 bg-primary-900 text-white">
                  {dayNames.map(day => (
                    <div key={day} className="p-3 text-center font-semibold border-r border-primary-800 last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {/* Dias vacios al inicio */}
                  {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="min-h-24 border-r border-b border-gray-200 bg-gray-50"></div>
                  ))}

                  {/* Dias del mes */}
                  {daysInMonth.map((day, index) => {
                    const dateStr = day.toISOString().split('T')[0];
                    const isToday = dateStr === today;
                    const reservasDelDia = reservas.filter(r => {
                      // Solo pendientes y confirmadas ocupan habitación
                      if (r.estado !== 'pendiente' && r.estado !== 'confirmada') return false;
                      return r.fechaEntrada <= dateStr && r.fechaSalida > dateStr;
                    });
                    const disponibles = habitaciones.length - reservasDelDia.length;

                    return (
                      <div
                        key={index}
                        className={`min-h-24 border-r border-b border-gray-200 p-2 ${
                          isToday ? 'bg-primary-50 ring-2 ring-primary-500 ring-inset' : ''
                        }`}
                      >
                        <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-primary-700' : 'text-gray-700'}`}>
                          {day.getDate()}
                        </div>
                        <div className={`text-xs font-medium flex items-center gap-1 ${
                          disponibles === habitaciones.length ? 'text-green-700' :
                          disponibles > 0 ? 'text-yellow-700' : 'text-red-700'
                        }`}>
                          <BedDouble className="w-3 h-3" />
                          <span>{disponibles}/{habitaciones.length}</span>
                        </div>
                        {reservasDelDia.slice(0, 2).map((res, i) => (
                          <button
                            key={res.id}
                            onClick={() => {
                              setReservaSeleccionada(res);
                              setMostrarModal(true);
                            }}
                            className={`w-full text-left text-xs mt-1 px-1 py-0.5 rounded truncate text-white ${getEstadoColor(res.estado)}`}
                          >
                            {obtenerHuesped(res.idHuesped)?.nombreCompleto?.split(' ')[0]}
                          </button>
                        ))}
                        {reservasDelDia.length > 2 && (
                          <p className="text-xs text-gray-500 mt-1">+{reservasDelDia.length - 2} mas</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

          {/* Modal de detalles */}
      {mostrarModal && reservaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-primary-900">Detalles de la Reserva</h3>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-lg">
                  <div>
                    <p className="text-gray-600 mb-1">Código de Reserva</p>
                    <p className="font-bold">{reservaSeleccionada.codigoReserva}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Estado</p>
                    <span
                      className={`inline-block px-4 py-1 rounded-full font-semibold ${
                        reservaSeleccionada.estado === 'confirmada'
                          ? 'bg-green-100 text-green-800'
                          : reservaSeleccionada.estado === 'pendiente'
                          ? 'bg-gold-100 text-gold-800'
                          : reservaSeleccionada.estado === 'cancelada'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {reservaSeleccionada.estado}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-xl font-bold mb-3">Información del Huésped</h4>
                  {(() => {
                    const huesped = obtenerHuesped(reservaSeleccionada.idHuesped);
                    return (
                      <div className="space-y-2 text-lg">
                        <p><strong>Nombre:</strong> {huesped?.nombreCompleto}</p>
                        <p><strong>Email:</strong> {huesped?.correoElectronico}</p>
                        <p><strong>Teléfono:</strong> {huesped?.telefono}</p>
                      </div>
                    );
                  })()}
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-xl font-bold mb-3">Detalles de la Reserva</h4>
                  {(() => {
                    const habitacion = obtenerHabitacion(reservaSeleccionada.idHabitacion);
                    return (
                      <div className="space-y-2 text-lg">
                        <p><strong>Habitación:</strong> {habitacion?.tipo} - #{habitacion?.numero}</p>
                        <p><strong>Capacidad:</strong> {habitacion?.capacidad} personas</p>
                        <p><strong>Personas:</strong> {reservaSeleccionada.numPersonas}</p>
                        <p>
                          <strong>Entrada:</strong>{' '}
                          {new Date(reservaSeleccionada.fechaEntrada + 'T00:00:00').toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p>
                          <strong>Salida:</strong>{' '}
                          {new Date(reservaSeleccionada.fechaSalida + 'T00:00:00').toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p><strong>Precio por noche:</strong> ${habitacion?.precioBase}</p>
                        <p className="text-2xl">
                          <strong>Total:</strong>{' '}
                          <span className="text-green-600 font-bold">
                            ${reservaSeleccionada.precioTotal}
                          </span>
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {reservaSeleccionada.notas && (
                  <div className="border-t pt-4">
                    <h4 className="text-xl font-bold mb-3">Notas Adicionales</h4>
                    <p className="text-lg text-gray-700">{reservaSeleccionada.notas}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <p className="text-base text-gray-600">
                    <strong>Fecha de creación:</strong>{' '}
                    {new Date(reservaSeleccionada.fechaCreacion).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                {reservaSeleccionada.estado === 'pendiente' && (
                  <button
                    onClick={() => cambiarEstadoReserva(reservaSeleccionada, 'confirmada')}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                  >
                    <Check className="w-5 h-5" />
                    <span>Confirmar Reserva</span>
                  </button>
                )}
                {(reservaSeleccionada.estado === 'confirmada' || reservaSeleccionada.estado === 'pendiente') && (
                  <button
                    onClick={() => cambiarEstadoReserva(reservaSeleccionada, 'cancelada')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-lg min-h-[48px] flex items-center justify-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancelar Reserva</span>
                  </button>
                )}
                {reservaSeleccionada.estado !== 'cancelada' && (
                  <button
                    onClick={() => abrirFactura(reservaSeleccionada)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-lg min-h-[48px] flex items-center justify-center space-x-2"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Generar Factura</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de alerta */}
      {mostrarAlerta && alertaConfig.reserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className={`p-3 rounded-full ${alertaConfig.tipo === 'confirmar' ? 'bg-green-100' : 'bg-red-100'}`}>
                <AlertTriangle className={`w-8 h-8 ${alertaConfig.tipo === 'confirmar' ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">
              {alertaConfig.tipo === 'confirmar' ? '¿Confirmar Reserva?' : '¿Cancelar Reserva?'}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {alertaConfig.tipo === 'confirmar'
                ? `¿Está seguro de confirmar la reserva ${alertaConfig.reserva.codigoReserva}? Se notificará al huésped.`
                : `¿Está seguro de cancelar la reserva ${alertaConfig.reserva.codigoReserva}? Esta acción no se puede deshacer.`}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setMostrarAlerta(false);
                  setAlertaConfig({ tipo: 'confirmar', reserva: null });
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccion}
                className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors text-white ${
                  alertaConfig.tipo === 'confirmar'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {alertaConfig.tipo === 'confirmar' ? 'Sí, Confirmar' : 'Sí, Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Factura */}
      {mostrarFactura && facturaReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Contenido de la factura para PDF */}
            <div ref={facturaRef} className="bg-white p-6">
              {/* Header de la factura */}
              <div className="flex items-start justify-between border-b-2 border-primary-900 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo-tito.png"
                    alt="Hostal Don Tito"
                    width={60}
                    height={60}
                    className="rounded-lg"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-primary-900">HOSTAL DON TITO</h1>
                    <p className="text-xs text-gray-600">2 Avenida Norte y 9 Calle Oriente #46</p>
                    <p className="text-xs text-gray-600">Izalco, Sonsonate, El Salvador</p>
                    <p className="text-xs text-gray-600">Tel: +503 7096-9464</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-primary-900">FACTURA</h2>
                  <p className="text-base font-semibold text-gray-700">{facturaReserva.codigoReserva}</p>
                  <p className="text-xs text-gray-600">
                    Fecha: {new Date().toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Datos del cliente */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-primary-900 mb-2">DATOS DEL CLIENTE</h3>
                {(() => {
                  const huesped = obtenerHuesped(facturaReserva.idHuesped);
                  return (
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p><strong>Nombre:</strong> {huesped?.nombreCompleto}</p>
                      <p><strong>Email:</strong> {huesped?.correoElectronico}</p>
                      <p><strong>Teléfono:</strong> {huesped?.telefono}</p>
                    </div>
                  );
                })()}
              </div>

              {/* Detalles de la reserva */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-primary-900 mb-2">DETALLES DE LA RESERVA</h3>
                {(() => {
                  const habitacion = obtenerHabitacion(facturaReserva.idHabitacion);
                  const noches = calcularNoches(facturaReserva.fechaEntrada, facturaReserva.fechaSalida);
                  return (
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-primary-900 text-white">
                          <th className="px-3 py-2 text-left">Descripción</th>
                          <th className="px-3 py-2 text-center">Noches</th>
                          <th className="px-3 py-2 text-right">Precio/Noche</th>
                          <th className="px-3 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="px-3 py-3">
                            <p className="font-semibold">Habitación {habitacion?.tipo} #{habitacion?.numero}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(facturaReserva.fechaEntrada + 'T00:00:00').toLocaleDateString('es-ES')} - {new Date(facturaReserva.fechaSalida + 'T00:00:00').toLocaleDateString('es-ES')}
                            </p>
                            <p className="text-xs text-gray-600">{facturaReserva.numPersonas} persona(s)</p>
                          </td>
                          <td className="px-3 py-3 text-center">{noches}</td>
                          <td className="px-3 py-3 text-right">${habitacion?.precioBase.toFixed(2)}</td>
                          <td className="px-3 py-3 text-right font-semibold">${facturaReserva.precioTotal.toFixed(2)}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50">
                          <td colSpan={3} className="px-3 py-2 text-right font-bold">SUBTOTAL:</td>
                          <td className="px-3 py-2 text-right font-bold">${facturaReserva.precioTotal.toFixed(2)}</td>
                        </tr>
                        <tr className="bg-primary-100">
                          <td colSpan={3} className="px-3 py-3 text-right font-bold text-lg text-primary-900">TOTAL A PAGAR:</td>
                          <td className="px-3 py-3 text-right font-bold text-lg text-primary-900">${facturaReserva.precioTotal.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  );
                })()}
              </div>

              {/* Información de pago */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-primary-900 mb-2">INFORMACIÓN DE PAGO</h3>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p><strong>Método de pago:</strong> {facturaReserva.metodoPago || 'Por definir'}</p>
                  <p><strong>Estado:</strong> {facturaReserva.estado === 'confirmada' ? 'Pagado' : 'Pendiente de pago'}</p>
                </div>
              </div>

              {/* Notas */}
              <div className="mb-3 text-xs text-gray-600 border-t pt-3">
                <p><strong>Horarios:</strong> Check-in: 14:00 - 22:00 | Check-out: 07:00 - 12:00</p>
                <p className="mt-1">Gracias por su preferencia. Esperamos que disfrute su estadía en Hostal Don Tito.</p>
              </div>

              {/* Pie de factura */}
              <div className="text-center text-xs text-gray-500 border-t pt-3">
                <p>Esta factura fue generada electrónicamente y es válida sin firma.</p>
                <p>Hostal Don Tito - Izalco, Sonsonate, El Salvador</p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="border-t p-4 flex gap-4">
              <button
                onClick={() => setMostrarFactura(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={generarFacturaPDF}
                disabled={generandoPDF}
                className="flex-1 bg-primary-800 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generandoPDF ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Descargar PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </AdminLayout>
  );
}
