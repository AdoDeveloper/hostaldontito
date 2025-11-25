'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut,
  Home,
  Calendar,
  Users,
  BarChart3,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Edit,
  X,
  Check,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import {
  verificarSesion,
  cerrarSesion,
  getReservas,
  getHabitaciones,
  getHuespedes,
  obtenerEstadisticas,
  actualizarReserva,
} from '@/lib/data';
import type { Reserva, Habitacion, Huesped } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'reservas' | 'calendario'>('dashboard');
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const user = verificarSesion();
    if (!user) {
      router.push('/admin/login');
      return;
    }
    setUsuario(user);
    cargarDatos();
    setCargando(false);
  }, [router]);

  const cargarDatos = () => {
    setReservas(getReservas());
    setHabitaciones(getHabitaciones());
    setHuespedes(getHuespedes());
    setEstadisticas(obtenerEstadisticas());
  };

  const manejarCerrarSesion = () => {
    cerrarSesion();
    router.push('/admin/login');
  };

  const obtenerHabitacion = (idHabitacion: string): Habitacion | undefined => {
    return habitaciones.find(h => h.id === idHabitacion);
  };

  const obtenerHuesped = (idHuesped: string): Huesped | undefined => {
    return huespedes.find(h => h.id === idHuesped);
  };

  const cambiarEstadoReserva = (reserva: Reserva, nuevoEstado: Reserva['estado']) => {
    actualizarReserva(reserva.id, { estado: nuevoEstado });
    cargarDatos();
    setReservaSeleccionada(null);
    setMostrarModal(false);
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
        if (r.estado === 'cancelada') return false;
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

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-800 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Cargando panel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Dashboard */}
      <header className="bg-primary-950 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gold-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold">DT</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Panel Administrativo</h1>
                <p className="text-sm text-gold-300">Hostal Don Tito</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-lg hidden md:inline">
                👤 {usuario?.nombre}
              </span>
              <button
                onClick={manejarCerrarSesion}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-800 hover:bg-primary-700 rounded-lg transition-colors min-h-[44px]"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navegación */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setVistaActual('dashboard')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors min-h-[44px] ${
              vistaActual === 'dashboard'
                ? 'bg-primary-800 text-white'
                : 'bg-white text-primary-800 hover:bg-primary-50'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setVistaActual('reservas')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors min-h-[44px] ${
              vistaActual === 'reservas'
                ? 'bg-primary-800 text-white'
                : 'bg-white text-primary-800 hover:bg-primary-50'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Reservas</span>
          </button>
          <button
            onClick={() => setVistaActual('calendario')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors min-h-[44px] ${
              vistaActual === 'calendario'
                ? 'bg-primary-800 text-white'
                : 'bg-white text-primary-800 hover:bg-primary-50'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Calendario</span>
          </button>
          <button
            onClick={cargarDatos}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors ml-auto min-h-[44px]"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="hidden md:inline">Actualizar</span>
          </button>
          <Link
            href="/"
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors min-h-[44px]"
          >
            <Home className="w-5 h-5" />
            <span className="hidden md:inline">Ver Sitio</span>
          </Link>
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
                      <th className="px-4 py-3 text-left text-base font-bold">ID</th>
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
                          <td className="px-4 py-3 text-base">{reserva.id}</td>
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
                            <p className="text-sm text-gray-600 mb-1">ID de Reserva</p>
                            <p className="text-lg font-bold text-primary-900">{reserva.id}</p>
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
            <div className="card">
              <h3 className="text-2xl font-bold mb-6 text-primary-900">Vista de Calendario</h3>
              <div className="text-center py-12">
                <Calendar className="w-24 h-24 text-primary-300 mx-auto mb-6" />
                <h4 className="text-2xl font-bold text-gray-700 mb-4">
                  Vista de Calendario Completo
                </h4>
                <p className="text-lg text-gray-600 max-w-md mx-auto mb-6">
                  Esta vista mostraría un calendario interactivo completo con todas las reservas
                  visualizadas por fecha y habitación.
                </p>
                <p className="text-base text-gray-500">
                  Funcionalidad disponible en la versión completa con base de datos
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

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
                    <p className="text-gray-600 mb-1">ID de Reserva</p>
                    <p className="font-bold">{reservaSeleccionada.id}</p>
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

              <div className="mt-6 flex gap-4">
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
