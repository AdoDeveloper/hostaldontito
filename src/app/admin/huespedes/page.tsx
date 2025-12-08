'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  Edit2,
  Search,
  Users,
  Mail,
  Phone,
  Calendar,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  History,
} from 'lucide-react';
import {
  getHuespedesSupabase,
  actualizarHuespedSupabase,
  getReservasHuespedSupabase,
} from '@/lib/supabase-data';
import type { Huesped, Reserva } from '@/types';

interface FormularioHuesped {
  nombreCompleto: string;
  correoElectronico: string;
  telefono: string;
}

export default function HuespedesPage() {
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalHistorial, setMostrarModalHistorial] = useState(false);
  const [huespedEditando, setHuespedEditando] = useState<Huesped | null>(null);
  const [huespedHistorial, setHuespedHistorial] = useState<Huesped | null>(null);
  const [reservasHuesped, setReservasHuesped] = useState<Reserva[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [formulario, setFormulario] = useState<FormularioHuesped>({
    nombreCompleto: '',
    correoElectronico: '',
    telefono: '',
  });

  useEffect(() => {
    cargarHuespedes();
  }, []);

  const cargarHuespedes = async () => {
    try {
      setCargando(true);
      const data = await getHuespedesSupabase();
      setHuespedes(data);
    } catch (error) {
      console.error('Error cargando huéspedes:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar huéspedes' });
    } finally {
      setCargando(false);
    }
  };

  const huespedesFiltrados = huespedes.filter(
    (h) =>
      h.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.correoElectronico.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.telefono.includes(busqueda)
  );

  const abrirModalEditar = (huesped: Huesped) => {
    setHuespedEditando(huesped);
    setFormulario({
      nombreCompleto: huesped.nombreCompleto,
      correoElectronico: huesped.correoElectronico,
      telefono: huesped.telefono,
    });
    setMostrarModal(true);
  };

  const abrirModalHistorial = async (huesped: Huesped) => {
    setHuespedHistorial(huesped);
    setMostrarModalHistorial(true);
    setCargandoHistorial(true);
    try {
      const reservas = await getReservasHuespedSupabase(huesped.id);
      setReservasHuesped(reservas);
    } catch (error) {
      console.error('Error cargando historial:', error);
      setReservasHuesped([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setHuespedEditando(null);
  };

  const guardarHuesped = async () => {
    if (!huespedEditando) return;

    if (!formulario.nombreCompleto.trim() || !formulario.correoElectronico.trim()) {
      setMensaje({ tipo: 'error', texto: 'Nombre y correo son requeridos' });
      return;
    }

    setGuardando(true);
    try {
      await actualizarHuespedSupabase(huespedEditando.id, {
        nombreCompleto: formulario.nombreCompleto,
        correoElectronico: formulario.correoElectronico,
        telefono: formulario.telefono,
      });
      setMensaje({ tipo: 'exito', texto: 'Huésped actualizado correctamente' });
      cerrarModal();
      cargarHuespedes();
    } catch (error: unknown) {
      console.error('Error guardando huésped:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMensaje({ tipo: 'error', texto: `Error al guardar: ${errorMessage}` });
    } finally {
      setGuardando(false);
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary-800" />
              Gestión de Huéspedes
            </h1>
            <p className="text-gray-600 mt-1">
              {huespedes.length} huéspedes registrados
            </p>
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

        {/* Búsqueda */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Lista de huéspedes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {cargando ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando huéspedes...</p>
            </div>
          ) : huespedesFiltrados.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron huéspedes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Huésped
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visitas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {huespedesFiltrados.map((huesped) => (
                    <tr key={huesped.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-800 font-semibold">
                              {huesped.nombreCompleto.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{huesped.nombreCompleto}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Mail className="w-4 h-4" />
                            {huesped.correoElectronico}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Phone className="w-4 h-4" />
                            {huesped.telefono}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar className="w-4 h-4" />
                          {new Date(huesped.fechaRegistro).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          <History className="w-4 h-4" />
                          {huesped.historialVisitas} visita(s)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => abrirModalHistorial(huesped)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Ver historial"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => abrirModalEditar(huesped)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Editar Huésped */}
      {mostrarModal && huespedEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">Editar Huésped</h3>
              <button
                onClick={cerrarModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={formulario.nombreCompleto}
                  onChange={(e) => setFormulario({ ...formulario, nombreCompleto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={formulario.correoElectronico}
                  onChange={(e) =>
                    setFormulario({ ...formulario, correoElectronico: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formulario.telefono}
                  onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarHuesped}
                disabled={guardando}
                className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors disabled:opacity-50"
              >
                {guardando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Historial de Reservas */}
      {mostrarModalHistorial && huespedHistorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Historial de Reservas</h3>
                <p className="text-gray-600 text-sm">{huespedHistorial.nombreCompleto}</p>
              </div>
              <button
                onClick={() => setMostrarModalHistorial(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {cargandoHistorial ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando historial...</p>
                </div>
              ) : reservasHuesped.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No hay reservas registradas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservasHuesped.map((reserva) => (
                    <div
                      key={reserva.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm text-gray-600">
                          {reserva.codigoReserva}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(
                            reserva.estado
                          )}`}
                        >
                          {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Entrada:</span>{' '}
                          <span className="font-medium">
                            {new Date(reserva.fechaEntrada + 'T00:00:00').toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Salida:</span>{' '}
                          <span className="font-medium">
                            {new Date(reserva.fechaSalida + 'T00:00:00').toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Personas:</span>{' '}
                          <span className="font-medium">{reserva.numPersonas}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Total:</span>{' '}
                          <span className="font-medium text-green-600">${reserva.precioTotal}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => setMostrarModalHistorial(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
