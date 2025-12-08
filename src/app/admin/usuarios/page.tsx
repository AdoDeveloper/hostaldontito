'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  UserCog,
  Shield,
  ShieldCheck,
  ShieldAlert,
  X,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  getUsuariosSupabase,
  crearUsuarioSupabase,
  actualizarUsuarioSupabase,
  cambiarPasswordUsuarioSupabase,
  desactivarUsuarioSupabase,
} from '@/lib/supabase-data';
import type { Usuario } from '@/types';

type RolUsuario = 'admin' | 'recepcion' | 'gerente';

interface FormularioUsuario {
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalPassword, setMostrarModalPassword] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [usuarioPassword, setUsuarioPassword] = useState<Usuario | null>(null);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [formulario, setFormulario] = useState<FormularioUsuario>({
    nombre: '',
    email: '',
    password: '',
    rol: 'recepcion',
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const data = await getUsuariosSupabase();
      setUsuarios(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar usuarios' });
    } finally {
      setCargando(false);
    }
  };

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirModalCrear = () => {
    setUsuarioEditando(null);
    setFormulario({
      nombre: '',
      email: '',
      password: '',
      rol: 'recepcion',
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setFormulario({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol as RolUsuario,
    });
    setMostrarModal(true);
  };

  const abrirModalPassword = (usuario: Usuario) => {
    setUsuarioPassword(usuario);
    setNuevaPassword('');
    setConfirmarPassword('');
    setMostrarModalPassword(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setUsuarioEditando(null);
  };

  const guardarUsuario = async () => {
    if (!formulario.nombre.trim() || !formulario.email.trim()) {
      setMensaje({ tipo: 'error', texto: 'Nombre y email son requeridos' });
      return;
    }

    if (!usuarioEditando && !formulario.password) {
      setMensaje({ tipo: 'error', texto: 'La contraseña es requerida para nuevos usuarios' });
      return;
    }

    setGuardando(true);
    try {
      if (usuarioEditando) {
        await actualizarUsuarioSupabase(usuarioEditando.id, {
          nombre: formulario.nombre,
          email: formulario.email,
          rol: formulario.rol,
        });
        setMensaje({ tipo: 'exito', texto: 'Usuario actualizado correctamente' });
      } else {
        await crearUsuarioSupabase({
          nombre: formulario.nombre,
          email: formulario.email,
          password: formulario.password,
          rol: formulario.rol,
          activo: true,
        });
        setMensaje({ tipo: 'exito', texto: 'Usuario creado correctamente' });
      }
      cerrarModal();
      cargarUsuarios();
    } catch (error: unknown) {
      console.error('Error guardando usuario:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMensaje({ tipo: 'error', texto: `Error al guardar usuario: ${errorMessage}` });
    } finally {
      setGuardando(false);
    }
  };

  const cambiarPassword = async () => {
    if (!usuarioPassword) return;

    if (nuevaPassword.length < 6) {
      setMensaje({ tipo: 'error', texto: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setMensaje({ tipo: 'error', texto: 'Las contraseñas no coinciden' });
      return;
    }

    setGuardando(true);
    try {
      await cambiarPasswordUsuarioSupabase(usuarioPassword.id, nuevaPassword);
      setMensaje({ tipo: 'exito', texto: 'Contraseña cambiada correctamente' });
      setMostrarModalPassword(false);
      setUsuarioPassword(null);
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cambiar contraseña' });
    } finally {
      setGuardando(false);
    }
  };

  const desactivarUsuario = async (usuario: Usuario) => {
    if (!confirm(`¿Estás seguro de desactivar a "${usuario.nombre}"?`)) return;

    try {
      await desactivarUsuarioSupabase(usuario.id);
      setMensaje({ tipo: 'exito', texto: 'Usuario desactivado correctamente' });
      cargarUsuarios();
    } catch (error) {
      console.error('Error desactivando usuario:', error);
      setMensaje({ tipo: 'error', texto: 'Error al desactivar usuario' });
    }
  };

  const getRolIcon = (rol: string) => {
    switch (rol) {
      case 'admin':
        return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'gerente':
        return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      default:
        return <Shield className="w-5 h-5 text-green-600" />;
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'gerente':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UserCog className="w-8 h-8 text-primary-800" />
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
          </div>
          <button
            onClick={abrirModalCrear}
            className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Usuario
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

        {/* Búsqueda */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {cargando ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando usuarios...</p>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="p-8 text-center">
              <UserCog className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-800 font-semibold">
                              {usuario.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{usuario.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {usuario.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRolColor(
                            usuario.rol
                          )}`}
                        >
                          {getRolIcon(usuario.rol)}
                          <span className="capitalize">{usuario.rol}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            usuario.activo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => abrirModalEditar(usuario)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => abrirModalPassword(usuario)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Cambiar contraseña"
                          >
                            <Shield className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => desactivarUsuario(usuario)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Desactivar"
                            disabled={!usuario.activo}
                          >
                            <Trash2 className="w-5 h-5" />
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

      {/* Modal Crear/Editar Usuario */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
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
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={formulario.email}
                  onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              {!usuarioEditando && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarPassword ? 'text' : 'password'}
                      value={formulario.password}
                      onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={formulario.rol}
                  onChange={(e) => setFormulario({ ...formulario, rol: e.target.value as RolUsuario })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="recepcion">Recepción</option>
                  <option value="gerente">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
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
                onClick={guardarUsuario}
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

      {/* Modal Cambiar Contraseña */}
      {mostrarModalPassword && usuarioPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">Cambiar Contraseña</h3>
              <button
                onClick={() => setMostrarModalPassword(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-gray-600">
                Cambiar contraseña para: <strong>{usuarioPassword.nombre}</strong>
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setMostrarModalPassword(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={cambiarPassword}
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
                    Cambiar
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
