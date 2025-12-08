'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  BedDouble,
  Users,
  DollarSign,
  Wifi,
  Wind,
  Tv,
  Coffee,
  X,
  Save,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  getHabitacionesSupabase,
  crearHabitacionSupabase,
  actualizarHabitacionSupabase,
  eliminarHabitacionSupabase,
} from '@/lib/supabase-data';
import type { Habitacion } from '@/types';

type TipoHabitacion = 'individual' | 'doble' | 'triple' | 'familiar';

interface FormularioHabitacion {
  numero: string;
  tipo: TipoHabitacion;
  capacidad: number;
  precioBase: number;
  amenidades: string[];
  descripcion: string;
}

const amenidadesDisponibles = [
  { id: 'WiFi', nombre: 'WiFi', icon: Wifi },
  { id: 'Aire acondicionado', nombre: 'Aire acondicionado', icon: Wind },
  { id: 'TV', nombre: 'TV', icon: Tv },
  { id: 'Baño privado', nombre: 'Baño privado', icon: Coffee },
  { id: 'Mini refrigerador', nombre: 'Mini refrigerador', icon: Coffee },
  { id: 'Escritorio', nombre: 'Escritorio', icon: Coffee },
  { id: 'Sala de estar', nombre: 'Sala de estar', icon: Coffee },
  { id: 'Balcón', nombre: 'Balcón', icon: Coffee },
];

export default function HabitacionesPage() {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [habitacionEditando, setHabitacionEditando] = useState<Habitacion | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [formulario, setFormulario] = useState<FormularioHabitacion>({
    numero: '',
    tipo: 'individual',
    capacidad: 1,
    precioBase: 18,
    amenidades: ['WiFi', 'Aire acondicionado', 'TV', 'Baño privado'],
    descripcion: '',
  });

  useEffect(() => {
    cargarHabitaciones();
  }, []);

  const cargarHabitaciones = async () => {
    try {
      setCargando(true);
      const data = await getHabitacionesSupabase();
      setHabitaciones(data);
    } catch (error) {
      console.error('Error cargando habitaciones:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar habitaciones' });
    } finally {
      setCargando(false);
    }
  };

  const habitacionesFiltradas = habitaciones.filter((h) => {
    const coincideBusqueda =
      h.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideTipo = filtroTipo === 'todos' || h.tipo === filtroTipo;
    return coincideBusqueda && coincideTipo;
  });

  const abrirModalCrear = () => {
    setHabitacionEditando(null);
    setFormulario({
      numero: '',
      tipo: 'individual',
      capacidad: 1,
      precioBase: 18,
      amenidades: ['WiFi', 'Aire acondicionado', 'TV', 'Baño privado'],
      descripcion: '',
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (habitacion: Habitacion) => {
    setHabitacionEditando(habitacion);
    setFormulario({
      numero: habitacion.numero,
      tipo: habitacion.tipo,
      capacidad: habitacion.capacidad,
      precioBase: habitacion.precioBase,
      amenidades: habitacion.amenidades,
      descripcion: habitacion.descripcion,
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setHabitacionEditando(null);
  };

  const toggleAmenidad = (amenidad: string) => {
    setFormulario((prev) => ({
      ...prev,
      amenidades: prev.amenidades.includes(amenidad)
        ? prev.amenidades.filter((a) => a !== amenidad)
        : [...prev.amenidades, amenidad],
    }));
  };

  const guardarHabitacion = async () => {
    if (!formulario.numero.trim() || !formulario.descripcion.trim()) {
      setMensaje({ tipo: 'error', texto: 'Número y descripción son requeridos' });
      return;
    }

    if (formulario.precioBase <= 0) {
      setMensaje({ tipo: 'error', texto: 'El precio debe ser mayor a 0' });
      return;
    }

    setGuardando(true);
    try {
      if (habitacionEditando) {
        await actualizarHabitacionSupabase(habitacionEditando.id, {
          numero: formulario.numero,
          tipo: formulario.tipo,
          capacidad: formulario.capacidad,
          precioBase: formulario.precioBase,
          amenidades: formulario.amenidades,
          descripcion: formulario.descripcion,
        });
        setMensaje({ tipo: 'exito', texto: 'Habitación actualizada correctamente' });
      } else {
        await crearHabitacionSupabase({
          numero: formulario.numero,
          tipo: formulario.tipo,
          capacidad: formulario.capacidad,
          precioBase: formulario.precioBase,
          amenidades: formulario.amenidades,
          descripcion: formulario.descripcion,
        });
        setMensaje({ tipo: 'exito', texto: 'Habitación creada correctamente' });
      }
      cerrarModal();
      cargarHabitaciones();
    } catch (error: unknown) {
      console.error('Error guardando habitación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMensaje({ tipo: 'error', texto: `Error al guardar habitación: ${errorMessage}` });
    } finally {
      setGuardando(false);
    }
  };

  const eliminarHabitacion = async (habitacion: Habitacion) => {
    if (!confirm(`¿Estás seguro de eliminar la habitación #${habitacion.numero}?`)) return;

    try {
      await eliminarHabitacionSupabase(habitacion.id);
      setMensaje({ tipo: 'exito', texto: 'Habitación eliminada correctamente' });
      cargarHabitaciones();
    } catch (error: unknown) {
      console.error('Error eliminando habitación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMensaje({ tipo: 'error', texto: errorMessage });
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'individual':
        return 'bg-blue-100 text-blue-800';
      case 'doble':
        return 'bg-green-100 text-green-800';
      case 'triple':
        return 'bg-yellow-100 text-yellow-800';
      case 'familiar':
        return 'bg-purple-100 text-purple-800';
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
              <BedDouble className="w-8 h-8 text-primary-800" />
              Gestión de Habitaciones
            </h1>
            <p className="text-gray-600 mt-1">Administra las habitaciones del hostal</p>
          </div>
          <button
            onClick={abrirModalCrear}
            className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Habitación
          </button>
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

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="todos">Todos los tipos</option>
              <option value="individual">Individual</option>
              <option value="doble">Doble</option>
              <option value="triple">Triple</option>
              <option value="familiar">Familiar</option>
            </select>
          </div>
        </div>

        {/* Grid de habitaciones */}
        {cargando ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando habitaciones...</p>
          </div>
        ) : habitacionesFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <BedDouble className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron habitaciones</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habitacionesFiltradas.map((habitacion) => (
              <div
                key={habitacion.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="bg-primary-800 text-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">#{habitacion.numero}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getTipoColor(
                        habitacion.tipo
                      )}`}
                    >
                      {habitacion.tipo.charAt(0).toUpperCase() + habitacion.tipo.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <p className="text-gray-600 text-sm line-clamp-2">{habitacion.descripcion}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-5 h-5" />
                      <span>{habitacion.capacidad} persona(s)</span>
                    </div>
                    <div className="flex items-center gap-1 text-2xl font-bold text-green-600">
                      <DollarSign className="w-6 h-6" />
                      {habitacion.precioBase}
                      <span className="text-sm text-gray-500 font-normal">/noche</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {habitacion.amenidades.slice(0, 4).map((amenidad) => (
                      <span
                        key={amenidad}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {amenidad}
                      </span>
                    ))}
                    {habitacion.amenidades.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{habitacion.amenidades.length - 4} más
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <button
                      onClick={() => abrirModalEditar(habitacion)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarHabitacion(habitacion)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Crear/Editar Habitación */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {habitacionEditando ? 'Editar Habitación' : 'Nueva Habitación'}
              </h3>
              <button
                onClick={cerrarModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de habitación
                  </label>
                  <input
                    type="text"
                    value={formulario.numero}
                    onChange={(e) => setFormulario({ ...formulario, numero: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: 101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={formulario.tipo}
                    onChange={(e) => {
                      const tipo = e.target.value as TipoHabitacion;
                      const capacidades: Record<TipoHabitacion, number> = {
                        individual: 1,
                        doble: 2,
                        triple: 3,
                        familiar: 4,
                      };
                      setFormulario({
                        ...formulario,
                        tipo,
                        capacidad: capacidades[tipo],
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="individual">Individual</option>
                    <option value="doble">Doble</option>
                    <option value="triple">Triple</option>
                    <option value="familiar">Familiar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formulario.capacidad}
                    onChange={(e) =>
                      setFormulario({ ...formulario, capacidad: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio por noche ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={formulario.precioBase}
                    onChange={(e) =>
                      setFormulario({ ...formulario, precioBase: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formulario.descripcion}
                  onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Describe la habitación..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenidades</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {amenidadesDisponibles.map((amenidad) => (
                    <button
                      key={amenidad.id}
                      type="button"
                      onClick={() => toggleAmenidad(amenidad.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        formulario.amenidades.includes(amenidad.id)
                          ? 'bg-primary-100 border-primary-500 text-primary-800'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <amenidad.icon className="w-4 h-4" />
                      <span className="text-sm">{amenidad.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white flex items-center justify-end gap-3 p-4 border-t">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarHabitacion}
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
    </AdminLayout>
  );
}
