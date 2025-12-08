'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  Search,
  Calendar,
  Filter,
  Eye,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  User,
  BedDouble,
  Printer,
} from 'lucide-react';
import {
  getReservasSupabase,
  getHabitacionesSupabase,
  getHuespedesSupabase,
  actualizarReservaSupabase,
  incrementarVisitaHuespedSupabase,
} from '@/lib/supabase-data';
import type { Reserva, Habitacion, Huesped } from '@/types';

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [alertaConfig, setAlertaConfig] = useState<{
    tipo: 'confirmar' | 'cancelar' | 'completar';
    reserva: Reserva | null;
  }>({ tipo: 'confirmar', reserva: null });
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [reservasData, habitacionesData, huespedesData] = await Promise.all([
        getReservasSupabase(),
        getHabitacionesSupabase(),
        getHuespedesSupabase(),
      ]);
      setReservas(reservasData);
      setHabitaciones(habitacionesData);
      setHuespedes(huespedesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar datos' });
    } finally {
      setCargando(false);
    }
  };

  const obtenerHabitacion = (id: string) => habitaciones.find((h) => h.id === id);
  const obtenerHuesped = (id: string | null) => id ? huespedes.find((h) => h.id === id) : null;

  // Obtener nombre del huésped
  const obtenerNombreHuesped = (reserva: Reserva) => {
    const huesped = obtenerHuesped(reserva.idHuesped);
    return huesped?.nombreCompleto || 'N/A';
  };

  // Obtener email del huésped
  const obtenerEmailHuesped = (reserva: Reserva) => {
    const huesped = obtenerHuesped(reserva.idHuesped);
    return huesped?.correoElectronico || '';
  };

  // Obtener teléfono del huésped
  const obtenerTelefonoHuesped = (reserva: Reserva) => {
    const huesped = obtenerHuesped(reserva.idHuesped);
    return huesped?.telefono || '';
  };

  const reservasFiltradas = reservas.filter((r) => {
    const nombreHuesped = obtenerNombreHuesped(r);
    const emailHuesped = obtenerEmailHuesped(r);
    const habitacion = obtenerHabitacion(r.idHabitacion);

    const coincideBusqueda =
      r.codigoReserva.toLowerCase().includes(busqueda.toLowerCase()) ||
      nombreHuesped.toLowerCase().includes(busqueda.toLowerCase()) ||
      emailHuesped.toLowerCase().includes(busqueda.toLowerCase()) ||
      habitacion?.numero.includes(busqueda);

    const coincideEstado = filtroEstado === 'todas' || r.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  const abrirDetalles = (reserva: Reserva) => {
    setReservaSeleccionada(reserva);
    setMostrarModal(true);
  };

  const confirmarAccion = (tipo: 'confirmar' | 'cancelar' | 'completar', reserva: Reserva) => {
    setAlertaConfig({ tipo, reserva });
    setMostrarAlerta(true);
  };

  const ejecutarAccion = async () => {
    if (!alertaConfig.reserva) return;

    setProcesando(true);
    try {
      const nuevoEstado =
        alertaConfig.tipo === 'confirmar'
          ? 'confirmada'
          : alertaConfig.tipo === 'cancelar'
          ? 'cancelada'
          : 'completada';

      const reserva = alertaConfig.reserva;
      const huespedId = reserva.idHuesped;

      // Actualizar el estado de la reserva
      await actualizarReservaSupabase(reserva.id, { estado: nuevoEstado });

      // Si se CONFIRMA la reserva, incrementar el historial de visitas del huésped y enviar email
      if (alertaConfig.tipo === 'confirmar' && huespedId) {
        // Incrementar visita del huésped (registrar el ingreso)
        await incrementarVisitaHuespedSupabase(huespedId);

        // Enviar email de confirmación
        const huesped = obtenerHuesped(huespedId);
        const habitacion = obtenerHabitacion(reserva.idHabitacion);
        if (huesped) {
          try {
            const fechaEntradaFormateada = new Date(reserva.fechaEntrada + 'T00:00:00').toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            const fechaSalidaFormateada = new Date(reserva.fechaSalida + 'T00:00:00').toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            await fetch('/api/email/confirmacion', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: huesped.correoElectronico,
                nombre: huesped.nombreCompleto,
                codigoReserva: reserva.codigoReserva,
                habitacion: `${habitacion?.tipo} - Habitación ${habitacion?.numero}`,
                fechaEntrada: fechaEntradaFormateada,
                fechaSalida: fechaSalidaFormateada,
                precioTotal: reserva.precioTotal,
              }),
            });
          } catch (emailError) {
            console.error('Error enviando email de confirmación:', emailError);
          }
        }
      }

      const mensajes = {
        confirmar: 'Reserva confirmada correctamente',
        cancelar: 'Reserva cancelada correctamente',
        completar: 'Reserva marcada como completada',
      };

      setMensaje({ tipo: 'exito', texto: mensajes[alertaConfig.tipo] });
      setMostrarAlerta(false);
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      console.error('Error actualizando reserva:', error);
      setMensaje({ tipo: 'error', texto: 'Error al actualizar reserva' });
    } finally {
      setProcesando(false);
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pendiente':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelada':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'completada':
        return <Check className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      case 'completada':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calcularNoches = (fechaEntrada: string, fechaSalida: string) => {
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    return Math.ceil((salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));
  };

  const imprimirReserva = () => {
    window.print();
  };

  // Estadísticas rápidas
  const estadisticas = {
    pendientes: reservas.filter((r) => r.estado === 'pendiente').length,
    confirmadas: reservas.filter((r) => r.estado === 'confirmada').length,
    completadas: reservas.filter((r) => r.estado === 'completada').length,
    canceladas: reservas.filter((r) => r.estado === 'cancelada').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary-800" />
              Gestión de Reservas
            </h1>
            <p className="text-gray-600 mt-1">{reservas.length} reservas en total</p>
          </div>
        </div>

        {/* Mensaje */}
        {mensaje && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 ${
              mensaje.tipo === 'exito'
                ? 'bg-green-50 border border-green-300 text-green-800'
                : 'bg-red-50 border border-red-300 text-red-800'
            }`}
          >
            {mensaje.tipo === 'exito' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{mensaje.texto}</span>
            <button onClick={() => setMensaje(null)} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-800">{estadisticas.pendientes}</p>
                <p className="text-sm text-yellow-600">Pendientes</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-800">{estadisticas.confirmadas}</p>
                <p className="text-sm text-green-600">Confirmadas</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Check className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-800">{estadisticas.completadas}</p>
                <p className="text-sm text-blue-600">Completadas</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-800">{estadisticas.canceladas}</p>
                <p className="text-sm text-red-600">Canceladas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por código, huésped o habitación..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="todas">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="confirmada">Confirmadas</option>
                <option value="completada">Completadas</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de reservas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {cargando ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando reservas...</p>
            </div>
          ) : reservasFiltradas.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron reservas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Código
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Huésped
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Habitación
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fechas
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reservasFiltradas.map((reserva) => {
                    const habitacion = obtenerHabitacion(reserva.idHabitacion);
                    const noches = calcularNoches(reserva.fechaEntrada, reserva.fechaSalida);
                    const nombreHuesped = obtenerNombreHuesped(reserva);
                    const telefonoHuesped = obtenerTelefonoHuesped(reserva);

                    return (
                      <tr key={reserva.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-medium text-primary-800">
                            {reserva.codigoReserva}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {nombreHuesped}
                            </p>
                            <p className="text-sm text-gray-500">{telefonoHuesped}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <BedDouble className="w-4 h-4 text-gray-400" />
                            <span>
                              #{habitacion?.numero} - {habitacion?.tipo}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <p>
                              {new Date(reserva.fechaEntrada + 'T00:00:00').toLocaleDateString(
                                'es-ES',
                                { day: 'numeric', month: 'short' }
                              )}{' '}
                              -{' '}
                              {new Date(reserva.fechaSalida + 'T00:00:00').toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </p>
                            <p className="text-gray-500">{noches} noche(s)</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-green-600">${reserva.precioTotal}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(
                              reserva.estado
                            )}`}
                          >
                            {getEstadoIcon(reserva.estado)}
                            {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => abrirDetalles(reserva)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {reserva.estado === 'pendiente' && (
                              <>
                                <button
                                  onClick={() => confirmarAccion('confirmar', reserva)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                  title="Confirmar"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => confirmarAccion('cancelar', reserva)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Cancelar"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {reserva.estado === 'confirmada' && (
                              <button
                                onClick={() => confirmarAccion('completar', reserva)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Marcar como completada"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detalles de Reserva */}
      {mostrarModal && reservaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Detalles de Reserva</h3>
                <p className="text-sm text-gray-600 font-mono">{reservaSeleccionada.codigoReserva}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={imprimirReserva}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Imprimir"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Estado */}
              <div
                className={`p-4 rounded-lg ${getEstadoColor(reservaSeleccionada.estado)} flex items-center gap-3`}
              >
                {getEstadoIcon(reservaSeleccionada.estado)}
                <div>
                  <p className="font-bold">
                    Estado:{' '}
                    {reservaSeleccionada.estado.charAt(0).toUpperCase() +
                      reservaSeleccionada.estado.slice(1)}
                  </p>
                </div>
              </div>

              {/* Información del huésped */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Huésped
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium">{obtenerNombreHuesped(reservaSeleccionada)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{obtenerTelefonoHuesped(reservaSeleccionada)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{obtenerEmailHuesped(reservaSeleccionada)}</p>
                  </div>
                </div>
              </div>

              {/* Información de la habitación */}
              {(() => {
                const habitacion = obtenerHabitacion(reservaSeleccionada.idHabitacion);
                const noches = calcularNoches(
                  reservaSeleccionada.fechaEntrada,
                  reservaSeleccionada.fechaSalida
                );
                return habitacion ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <BedDouble className="w-5 h-5" />
                      Información de la Habitación
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Habitación</p>
                        <p className="font-medium">
                          #{habitacion.numero} - {habitacion.tipo}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Personas</p>
                        <p className="font-medium">{reservaSeleccionada.numPersonas}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Entrada</p>
                        <p className="font-medium">
                          {new Date(reservaSeleccionada.fechaEntrada + 'T00:00:00').toLocaleDateString(
                            'es-ES',
                            { weekday: 'long', day: 'numeric', month: 'long' }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Salida</p>
                        <p className="font-medium">
                          {new Date(reservaSeleccionada.fechaSalida + 'T00:00:00').toLocaleDateString(
                            'es-ES',
                            { weekday: 'long', day: 'numeric', month: 'long' }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Noches</p>
                        <p className="font-medium">{noches}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Precio/noche</p>
                        <p className="font-medium">${habitacion.precioBase}</p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Total */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <span className="font-semibold text-gray-700">Total a pagar</span>
                  </div>
                  <span className="text-3xl font-bold text-green-600">
                    ${reservaSeleccionada.precioTotal}
                  </span>
                </div>
              </div>

              {/* Notas */}
              {reservaSeleccionada.notas && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-yellow-800 mb-2">Notas:</p>
                  <p className="text-yellow-700">{reservaSeleccionada.notas}</p>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="sticky bottom-0 bg-white p-4 border-t flex flex-wrap gap-2 justify-end">
              {reservaSeleccionada.estado === 'pendiente' && (
                <>
                  <button
                    onClick={() => confirmarAccion('confirmar', reservaSeleccionada)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Check className="w-5 h-5" />
                    Confirmar
                  </button>
                  <button
                    onClick={() => confirmarAccion('cancelar', reservaSeleccionada)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <X className="w-5 h-5" />
                    Cancelar
                  </button>
                </>
              )}
              {reservaSeleccionada.estado === 'confirmada' && (
                <button
                  onClick={() => confirmarAccion('completar', reservaSeleccionada)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <CheckCircle className="w-5 h-5" />
                  Marcar Completada
                </button>
              )}
              <button
                onClick={() => setMostrarModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {mostrarAlerta && alertaConfig.reserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              {alertaConfig.tipo === 'confirmar' && (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              )}
              {alertaConfig.tipo === 'cancelar' && (
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              )}
              {alertaConfig.tipo === 'completar' && (
                <Check className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              )}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {alertaConfig.tipo === 'confirmar' && '¿Confirmar reserva?'}
                {alertaConfig.tipo === 'cancelar' && '¿Cancelar reserva?'}
                {alertaConfig.tipo === 'completar' && '¿Marcar como completada?'}
              </h3>
              <p className="text-gray-600">
                Reserva: <strong>{alertaConfig.reserva.codigoReserva}</strong>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMostrarAlerta(false)}
                disabled={procesando}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarAccion}
                disabled={procesando}
                className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                  alertaConfig.tipo === 'confirmar'
                    ? 'bg-green-600 hover:bg-green-700'
                    : alertaConfig.tipo === 'cancelar'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {procesando ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
