// Funciones de datos usando Supabase
// Este archivo reemplaza las funciones de localStorage cuando Supabase está configurado

import { supabase, isSupabaseConfigured } from './supabase';
import type { Habitacion, Reserva, Huesped, Usuario } from '@/types';

// =====================================================
// MAPEO DE DATOS (DB -> App)
// =====================================================

interface HabitacionDB {
  id: string;
  numero: string;
  tipo: 'individual' | 'doble' | 'triple' | 'familiar';
  capacidad: number;
  precio_base: number;
  amenidades: string[];
  descripcion: string;
  imagen_url: string | null;
  created_at: string;
}

interface HuespedDB {
  id: string;
  nombre_completo: string;
  correo_electronico: string;
  telefono: string;
  fecha_registro: string;
  historial_visitas: number;
  created_at: string;
}

interface ReservaDB {
  id: string;
  codigo_reserva: string;
  id_huesped: string;
  id_habitacion: string;
  fecha_entrada: string;
  fecha_salida: string;
  num_personas: number;
  precio_total: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | null;
  notas: string | null;
  created_at: string;
}

interface UsuarioDB {
  id: string;
  nombre: string;
  email: string;
  password_hash: string | null;
  rol: 'admin' | 'recepcion' | 'gerente';
  activo: boolean;
  created_at: string;
  updated_at: string;
}

interface SesionDB {
  id: string;
  usuario_id: string;
  token: string;
  expira_en: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Interfaz para sesión en la app
export interface Sesion {
  id: string;
  usuarioId: string;
  token: string;
  expiraEn: string;
  ipAddress?: string;
  userAgent?: string;
}

const mapHabitacion = (hab: HabitacionDB): Habitacion => ({
  id: hab.id,
  numero: hab.numero,
  tipo: hab.tipo,
  capacidad: hab.capacidad,
  precioBase: hab.precio_base,
  amenidades: hab.amenidades || [],
  descripcion: hab.descripcion,
  imagenUrl: hab.imagen_url || undefined,
});

const mapHuesped = (hue: HuespedDB): Huesped => ({
  id: hue.id,
  nombreCompleto: hue.nombre_completo,
  correoElectronico: hue.correo_electronico,
  telefono: hue.telefono,
  fechaRegistro: hue.fecha_registro,
  historialVisitas: hue.historial_visitas,
});

const mapReserva = (res: ReservaDB): Reserva => ({
  id: res.id,
  codigoReserva: res.codigo_reserva,
  idHuesped: res.id_huesped,
  idHabitacion: res.id_habitacion,
  fechaEntrada: res.fecha_entrada,
  fechaSalida: res.fecha_salida,
  numPersonas: res.num_personas,
  precioTotal: res.precio_total,
  estado: res.estado,
  fechaCreacion: res.created_at,
  metodoPago: res.metodo_pago || undefined,
  notas: res.notas || undefined,
});

const mapUsuario = (usr: UsuarioDB): Usuario => ({
  id: usr.id,
  nombre: usr.nombre,
  email: usr.email,
  rol: usr.rol,
  activo: usr.activo,
});

// =====================================================
// FUNCIONES DE LECTURA
// =====================================================

export const getHabitacionesSupabase = async (): Promise<Habitacion[]> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const { data, error } = await supabase
    .from('habitaciones')
    .select('*')
    .order('numero');

  if (error) {
    console.error('Error fetching habitaciones:', error);
    throw error;
  }

  return (data || []).map(mapHabitacion);
};

export const getReservasSupabase = async (): Promise<Reserva[]> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reservas:', error);
    throw error;
  }

  return (data || []).map(mapReserva);
};

export const getHuespedesSupabase = async (): Promise<Huesped[]> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const { data, error } = await supabase
    .from('huespedes')
    .select('*')
    .order('nombre_completo');

  if (error) {
    console.error('Error fetching huespedes:', error);
    throw error;
  }

  return (data || []).map(mapHuesped);
};

export const getUsuariosSupabase = async (): Promise<Usuario[]> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('activo', true);

  if (error) {
    console.error('Error fetching usuarios:', error);
    throw error;
  }

  return (data || []).map(mapUsuario);
};

// =====================================================
// FUNCIONES DE ESCRITURA
// =====================================================

// Generar código de reserva legible: HDT-YYYYMM-XXXX
const generarCodigoReserva = async (): Promise<string> => {
  const ahora = new Date();
  const año = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const prefijo = `HDT-${año}${mes}`;

  // Obtener el último número de reserva del mes actual
  const { data: ultimaReserva } = await supabase
    .from('reservas')
    .select('codigo_reserva')
    .like('codigo_reserva', `${prefijo}-%`)
    .order('codigo_reserva', { ascending: false })
    .limit(1);

  let siguiente = 1;
  if (ultimaReserva && ultimaReserva.length > 0) {
    const ultimoCodigo = (ultimaReserva[0] as { codigo_reserva: string }).codigo_reserva;
    const ultimoNumero = parseInt(ultimoCodigo.split('-')[2], 10);
    siguiente = ultimoNumero + 1;
  }

  return `${prefijo}-${String(siguiente).padStart(4, '0')}`;
};

export const guardarReservaSupabase = async (reserva: Omit<Reserva, 'id' | 'fechaCreacion' | 'codigoReserva'>): Promise<Reserva> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  // Generar código de reserva legible
  const codigoReserva = await generarCodigoReserva();

  const insertData = {
    codigo_reserva: codigoReserva,
    id_huesped: reserva.idHuesped,
    id_habitacion: reserva.idHabitacion,
    fecha_entrada: reserva.fechaEntrada,
    fecha_salida: reserva.fechaSalida,
    num_personas: reserva.numPersonas,
    precio_total: reserva.precioTotal,
    estado: reserva.estado,
    metodo_pago: reserva.metodoPago || null,
    notas: reserva.notas || null,
  };

  const { data, error } = await supabase
    .from('reservas')
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    console.error('Error saving reserva:', error);
    throw error;
  }

  return mapReserva(data as ReservaDB);
};

export const actualizarReservaSupabase = async (
  id: string,
  datosActualizados: Partial<Reserva>
): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const updateData: Record<string, unknown> = {};

  if (datosActualizados.idHuesped) updateData.id_huesped = datosActualizados.idHuesped;
  if (datosActualizados.idHabitacion) updateData.id_habitacion = datosActualizados.idHabitacion;
  if (datosActualizados.fechaEntrada) updateData.fecha_entrada = datosActualizados.fechaEntrada;
  if (datosActualizados.fechaSalida) updateData.fecha_salida = datosActualizados.fechaSalida;
  if (datosActualizados.numPersonas) updateData.num_personas = datosActualizados.numPersonas;
  if (datosActualizados.precioTotal) updateData.precio_total = datosActualizados.precioTotal;
  if (datosActualizados.estado) updateData.estado = datosActualizados.estado;
  if (datosActualizados.metodoPago !== undefined) updateData.metodo_pago = datosActualizados.metodoPago;
  if (datosActualizados.notas !== undefined) updateData.notas = datosActualizados.notas;

  const { error } = await supabase
    .from('reservas')
    .update(updateData as never)
    .eq('id', id);

  if (error) {
    console.error('Error updating reserva:', error);
    throw error;
  }
};

export const guardarHuespedSupabase = async (huesped: Omit<Huesped, 'id'>): Promise<Huesped> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const insertData = {
    nombre_completo: huesped.nombreCompleto,
    correo_electronico: huesped.correoElectronico,
    telefono: huesped.telefono,
    historial_visitas: huesped.historialVisitas || 1,
  };

  const { data, error } = await supabase
    .from('huespedes')
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    console.error('Error saving huesped:', error);
    throw error;
  }

  return mapHuesped(data as HuespedDB);
};

// =====================================================
// FUNCIONES DE VERIFICACIÓN
// =====================================================

export const verificarDisponibilidadSupabase = async (
  idHabitacion: string,
  fechaEntrada: string,
  fechaSalida: string,
  excluirReservaId?: string
): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  // Verificar manualmente consultando reservas existentes
  // Solo considerar reservas pendientes o confirmadas (no canceladas ni completadas)
  const { data: reservas, error } = await supabase
    .from('reservas')
    .select('*')
    .eq('id_habitacion', idHabitacion)
    .in('estado', ['pendiente', 'confirmada']);

  if (error) {
    console.error('Error verificando disponibilidad:', error);
    return true; // Asumir disponible en caso de error
  }

  if (!reservas || reservas.length === 0) return true;

  // Usar comparación de strings para fechas YYYY-MM-DD (evita problemas de timezone)
  const conflictos = (reservas as ReservaDB[]).filter(r => {
    if (excluirReservaId && r.id === excluirReservaId) return false;
    // Comparación correcta: hay conflicto si la nueva entrada es antes de la salida existente
    // Y la nueva salida es después de la entrada existente
    return fechaEntrada < r.fecha_salida && fechaSalida > r.fecha_entrada;
  });

  return conflictos.length === 0;
};

export const calcularPrecioTotalSupabase = async (
  idHabitacion: string,
  fechaEntrada: string,
  fechaSalida: string
): Promise<number> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  // Calcular manualmente consultando el precio de la habitacion
  const { data: habitacion } = await supabase
    .from('habitaciones')
    .select('precio_base')
    .eq('id', idHabitacion)
    .single();

  if (!habitacion) return 0;

  const entrada = new Date(fechaEntrada);
  const salida = new Date(fechaSalida);
  const noches = Math.ceil((salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));

  return (habitacion as HabitacionDB).precio_base * noches;
};

// =====================================================
// ESTADÍSTICAS
// =====================================================

export const obtenerEstadisticasSupabase = async () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const [reservasRes, habitacionesRes, huespedesRes] = await Promise.all([
    supabase.from('reservas').select('*'),
    supabase.from('habitaciones').select('*'),
    supabase.from('huespedes').select('*'),
  ]);

  const reservas = (reservasRes.data || []) as ReservaDB[];
  const habitaciones = (habitacionesRes.data || []) as HabitacionDB[];
  const huespedes = (huespedesRes.data || []) as HuespedDB[];

  const hoy = new Date().toISOString().split('T')[0];

  // Reservas activas hoy (solo pendientes y confirmadas ocupan habitación)
  const reservasHoy = reservas.filter(r => {
    if (r.estado !== 'pendiente' && r.estado !== 'confirmada') return false;
    return r.fecha_entrada <= hoy && r.fecha_salida > hoy;
  });

  // Ocupacion
  const ocupacionHoy = habitaciones.length > 0
    ? Math.round((reservasHoy.length / habitaciones.length) * 100)
    : 0;

  // Ingresos del mes (solo reservas confirmadas o completadas)
  const primerDiaMes = new Date();
  primerDiaMes.setDate(1);

  const reservasMes = reservas.filter(r => {
    const creacion = new Date(r.created_at);
    // Solo contar como ingreso si la reserva está confirmada o completada
    return creacion >= primerDiaMes && (r.estado === 'confirmada' || r.estado === 'completada');
  });
  const ingresosMes = reservasMes.reduce((sum, r) => sum + Number(r.precio_total), 0);

  // Reservas futuras (solo pendientes y confirmadas)
  const reservasFuturas = reservas.filter(r => {
    return r.fecha_entrada > hoy && (r.estado === 'pendiente' || r.estado === 'confirmada');
  });

  return {
    ocupacionHoy,
    habitacionesOcupadas: reservasHoy.length,
    totalHabitaciones: habitaciones.length,
    ingresosMes,
    reservasFuturas: reservasFuturas.length,
    totalReservas: reservas.filter(r => r.estado === 'pendiente' || r.estado === 'confirmada').length,
    totalHuespedes: huespedes.length,
  };
};

// =====================================================
// AUTENTICACIÓN
// =====================================================

export const autenticarUsuarioSupabase = async (
  email: string,
  password: string
): Promise<Usuario | null> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  // Autenticación con Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    console.error('Error authenticating:', authError);
    return null;
  }

  // Obtener datos del usuario de la tabla usuarios
  const { data: userData, error: userError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .eq('activo', true)
    .single();

  if (userError || !userData) {
    console.error('Error fetching user data:', userError);
    return null;
  }

  return mapUsuario(userData);
};

export const verificarSesionSupabase = async (): Promise<Usuario | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    return null;
  }

  const { data: userData, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', session.user.email)
    .eq('activo', true)
    .single();

  if (error || !userData) {
    return null;
  }

  return mapUsuario(userData);
};

export const cerrarSesionSupabase = async (): Promise<void> => {
  if (!isSupabaseConfigured()) {
    return;
  }

  await supabase.auth.signOut();
};

// =====================================================
// GESTIÓN DE USUARIOS
// =====================================================

export const crearUsuarioSupabase = async (
  usuario: Omit<Usuario, 'id'> & { password: string }
): Promise<Usuario> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  // Usar la función de base de datos para crear usuario con hash de password
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('crear_usuario', {
    p_nombre: usuario.nombre,
    p_email: usuario.email,
    p_password: usuario.password,
    p_rol: usuario.rol,
  });

  if (error) {
    console.error('Error creando usuario:', error);
    throw error;
  }

  // Obtener el usuario recién creado
  const { data: nuevoUsuario, error: fetchError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', data)
    .single();

  if (fetchError || !nuevoUsuario) {
    throw new Error('Error obteniendo usuario creado');
  }

  return mapUsuario(nuevoUsuario as UsuarioDB);
};

export const actualizarUsuarioSupabase = async (
  id: string,
  datosActualizados: Partial<Omit<Usuario, 'id'>>
): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const updateData: Record<string, unknown> = {};

  if (datosActualizados.nombre) updateData.nombre = datosActualizados.nombre;
  if (datosActualizados.email) updateData.email = datosActualizados.email;
  if (datosActualizados.rol) updateData.rol = datosActualizados.rol;
  if (datosActualizados.activo !== undefined) updateData.activo = datosActualizados.activo;

  const { error } = await supabase
    .from('usuarios')
    .update(updateData as never)
    .eq('id', id);

  if (error) {
    console.error('Error actualizando usuario:', error);
    throw error;
  }
};

export const cambiarPasswordUsuarioSupabase = async (
  id: string,
  nuevaPassword: string
): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.rpc as any)('cambiar_password_usuario', {
    p_usuario_id: id,
    p_nueva_password: nuevaPassword,
  });

  if (error) {
    console.error('Error cambiando password:', error);
    throw error;
  }
};

export const desactivarUsuarioSupabase = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const { error } = await supabase
    .from('usuarios')
    .update({ activo: false } as never)
    .eq('id', id);

  if (error) {
    console.error('Error desactivando usuario:', error);
    throw error;
  }
};

// =====================================================
// GESTIÓN DE SESIONES (Autenticación custom)
// =====================================================

export const autenticarConPasswordSupabase = async (
  email: string,
  password: string
): Promise<{ usuario: Usuario; token: string } | null> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  // Usar función de base de datos para autenticar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: usuarioId, error: authError } = await (supabase.rpc as any)('autenticar_usuario', {
    p_email: email,
    p_password: password,
  });

  if (authError || !usuarioId) {
    console.error('Error autenticando:', authError);
    return null;
  }

  // Obtener datos del usuario
  const { data: userData, error: userError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', usuarioId)
    .single();

  if (userError || !userData) {
    return null;
  }

  // Crear sesión
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: token, error: sesionError } = await (supabase.rpc as any)('crear_sesion', {
    p_usuario_id: usuarioId,
  });

  if (sesionError || !token) {
    console.error('Error creando sesión:', sesionError);
    return null;
  }

  return {
    usuario: mapUsuario(userData as UsuarioDB),
    token: token as string,
  };
};

export const verificarTokenSupabase = async (
  token: string
): Promise<Usuario | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  // Verificar sesión con la función de base de datos
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: usuarioId, error } = await (supabase.rpc as any)('verificar_sesion', {
    p_token: token,
  });

  if (error || !usuarioId) {
    return null;
  }

  // Obtener datos del usuario
  const { data: userData, error: userError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', usuarioId)
    .eq('activo', true)
    .single();

  if (userError || !userData) {
    return null;
  }

  return mapUsuario(userData as UsuarioDB);
};

export const cerrarSesionTokenSupabase = async (token: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.rpc as any)('cerrar_sesion', { p_token: token });
};

export const obtenerSesionesUsuarioSupabase = async (
  usuarioId: string
): Promise<Sesion[]> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const { data, error } = await supabase
    .from('sesiones')
    .select('*')
    .eq('usuario_id', usuarioId)
    .gt('expira_en', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo sesiones:', error);
    return [];
  }

  return (data || []).map((s: SesionDB) => ({
    id: s.id,
    usuarioId: s.usuario_id,
    token: s.token,
    expiraEn: s.expira_en,
    ipAddress: s.ip_address || undefined,
    userAgent: s.user_agent || undefined,
  }));
};

// =====================================================
// GESTIÓN DE HABITACIONES
// =====================================================

export const crearHabitacionSupabase = async (
  habitacion: Omit<Habitacion, 'id'>
): Promise<Habitacion> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const insertData = {
    numero: habitacion.numero,
    tipo: habitacion.tipo,
    capacidad: habitacion.capacidad,
    precio_base: habitacion.precioBase,
    amenidades: habitacion.amenidades,
    descripcion: habitacion.descripcion,
    imagen_url: habitacion.imagenUrl || null,
  };

  const { data, error } = await supabase
    .from('habitaciones')
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    console.error('Error creando habitación:', error);
    throw error;
  }

  return mapHabitacion(data as HabitacionDB);
};

export const actualizarHabitacionSupabase = async (
  id: string,
  datosActualizados: Partial<Omit<Habitacion, 'id'>>
): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const updateData: Record<string, unknown> = {};

  if (datosActualizados.numero) updateData.numero = datosActualizados.numero;
  if (datosActualizados.tipo) updateData.tipo = datosActualizados.tipo;
  if (datosActualizados.capacidad) updateData.capacidad = datosActualizados.capacidad;
  if (datosActualizados.precioBase) updateData.precio_base = datosActualizados.precioBase;
  if (datosActualizados.amenidades) updateData.amenidades = datosActualizados.amenidades;
  if (datosActualizados.descripcion) updateData.descripcion = datosActualizados.descripcion;
  if (datosActualizados.imagenUrl !== undefined) updateData.imagen_url = datosActualizados.imagenUrl;

  const { error } = await supabase
    .from('habitaciones')
    .update(updateData as never)
    .eq('id', id);

  if (error) {
    console.error('Error actualizando habitación:', error);
    throw error;
  }
};

export const eliminarHabitacionSupabase = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  // Verificar que no hay reservas activas
  const { data: reservas } = await supabase
    .from('reservas')
    .select('id')
    .eq('id_habitacion', id)
    .in('estado', ['pendiente', 'confirmada'])
    .limit(1);

  if (reservas && reservas.length > 0) {
    throw new Error('No se puede eliminar: hay reservas activas para esta habitación');
  }

  const { error } = await supabase
    .from('habitaciones')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando habitación:', error);
    throw error;
  }
};

// =====================================================
// GESTIÓN DE HUÉSPEDES
// =====================================================

export const actualizarHuespedSupabase = async (
  id: string,
  datosActualizados: Partial<Omit<Huesped, 'id'>>
): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const updateData: Record<string, unknown> = {};

  if (datosActualizados.nombreCompleto) updateData.nombre_completo = datosActualizados.nombreCompleto;
  if (datosActualizados.correoElectronico) updateData.correo_electronico = datosActualizados.correoElectronico;
  if (datosActualizados.telefono) updateData.telefono = datosActualizados.telefono;
  if (datosActualizados.historialVisitas !== undefined) updateData.historial_visitas = datosActualizados.historialVisitas;

  const { error } = await supabase
    .from('huespedes')
    .update(updateData as never)
    .eq('id', id);

  if (error) {
    console.error('Error actualizando huésped:', error);
    throw error;
  }
};

// Incrementar el historial de visitas de un huésped
export const incrementarVisitaHuespedSupabase = async (huespedId: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  // Primero obtener el valor actual
  const { data: huesped, error: fetchError } = await supabase
    .from('huespedes')
    .select('historial_visitas')
    .eq('id', huespedId)
    .single();

  if (fetchError) {
    console.error('Error obteniendo huésped:', fetchError);
    throw fetchError;
  }

  const huespedData = huesped as { historial_visitas: number } | null;

  // Incrementar en 1
  const { error: updateError } = await supabase
    .from('huespedes')
    .update({ historial_visitas: (huespedData?.historial_visitas || 0) + 1 } as never)
    .eq('id', huespedId);

  if (updateError) {
    console.error('Error incrementando visitas:', updateError);
    throw updateError;
  }
};

export const buscarHuespedPorEmailSupabase = async (
  email: string
): Promise<Huesped | null> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const { data, error } = await supabase
    .from('huespedes')
    .select('*')
    .eq('correo_electronico', email)
    .single();

  if (error || !data) {
    return null;
  }

  return mapHuesped(data as HuespedDB);
};

export const incrementarVisitasHuespedSupabase = async (
  id: string
): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.rpc as any)('incrementar_visitas_huesped', {
    p_huesped_id: id,
  });

  if (error) {
    console.error('Error incrementando visitas:', error);
    throw error;
  }
};

// =====================================================
// GESTIÓN DE RESERVAS (funciones adicionales)
// =====================================================

export const eliminarReservaSupabase = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const { error } = await supabase
    .from('reservas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando reserva:', error);
    throw error;
  }
};

export const getReservaPorCodigoSupabase = async (
  codigo: string
): Promise<Reserva | null> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .ilike('codigo_reserva', codigo)
    .single();

  if (error || !data) {
    return null;
  }

  return mapReserva(data as ReservaDB);
};

export const getReservasHuespedSupabase = async (
  huespedId: string
): Promise<Reserva[]> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .eq('id_huesped', huespedId)
    .order('fecha_entrada', { ascending: false });

  if (error) {
    console.error('Error obteniendo reservas del huésped:', error);
    return [];
  }

  return (data || []).map(mapReserva);
};

// =====================================================
// SUSCRIPCIONES EN TIEMPO REAL
// =====================================================

export const suscribirseAReservas = (
  callback: (reservas: Reserva[]) => void
) => {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  const channel = supabase
    .channel('reservas-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reservas',
      },
      async () => {
        // Cuando hay cambios, recargar todas las reservas
        const reservas = await getReservasSupabase();
        callback(reservas);
      }
    )
    .subscribe();

  // Retornar función para cancelar suscripción
  return () => {
    supabase.removeChannel(channel);
  };
};

export const suscribirseAHabitaciones = (
  callback: (habitaciones: Habitacion[]) => void
) => {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  const channel = supabase
    .channel('habitaciones-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'habitaciones',
      },
      async () => {
        const habitaciones = await getHabitacionesSupabase();
        callback(habitaciones);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// =====================================================
// AUTENTICACIÓN DE HUÉSPEDES (Cuentas de cliente)
// =====================================================

export interface CuentaHuesped {
  cuentaId: string;
  huespedId: string;
  nombre: string;
  email: string;
  telefono: string;
  documentoIdentidad?: string;
  nacionalidad?: string;
}

export const registrarCuentaHuespedSupabase = async (
  nombre: string,
  email: string,
  telefono: string,
  password: string
): Promise<{ cuentaId: string; huespedId: string } | null> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('registrar_cuenta_huesped', {
    p_nombre: nombre,
    p_email: email,
    p_telefono: telefono,
    p_password: password,
  });

  if (error) {
    console.error('Error registrando cuenta:', error);
    if (error.message?.includes('Ya existe')) {
      throw new Error('Ya existe una cuenta con este correo electrónico');
    }
    throw error;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return {
    cuentaId: data[0].cuenta_id,
    huespedId: data[0].huesped_id,
  };
};

export const autenticarHuespedSupabase = async (
  email: string,
  password: string
): Promise<{ cuenta: CuentaHuesped; token: string } | null> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  // Autenticar huésped
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: authData, error: authError } = await (supabase.rpc as any)('autenticar_huesped', {
    p_email: email,
    p_password: password,
  });

  if (authError || !authData || authData.length === 0) {
    console.error('Error autenticando huésped:', authError);
    return null;
  }

  const cuenta = authData[0];

  // Crear sesión
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: token, error: sesionError } = await (supabase.rpc as any)('crear_sesion_huesped', {
    p_id_cuenta: cuenta.cuenta_id,
  });

  if (sesionError || !token) {
    console.error('Error creando sesión de huésped:', sesionError);
    return null;
  }

  return {
    cuenta: {
      cuentaId: cuenta.cuenta_id,
      huespedId: cuenta.huesped_id,
      nombre: cuenta.nombre,
      email: cuenta.email,
      telefono: cuenta.telefono,
    },
    token: token as string,
  };
};

export const verificarSesionHuespedSupabase = async (
  token: string
): Promise<CuentaHuesped | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('verificar_sesion_huesped', {
    p_token: token,
  });

  if (error || !data || data.length === 0) {
    return null;
  }

  const cuenta = data[0];
  return {
    cuentaId: cuenta.cuenta_id,
    huespedId: cuenta.huesped_id,
    nombre: cuenta.nombre,
    email: cuenta.email,
    telefono: cuenta.telefono,
    documentoIdentidad: cuenta.documento_identidad || undefined,
    nacionalidad: cuenta.nacionalidad || undefined,
  };
};

export const cerrarSesionHuespedSupabase = async (token: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.rpc as any)('cerrar_sesion_huesped', { p_token: token });
};

export const crearTokenRecuperacionSupabase = async (
  email: string
): Promise<string | null> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('crear_token_recuperacion', {
    p_email: email,
  });

  if (error) {
    console.error('Error creando token de recuperación:', error);
    return null;
  }

  return data as string | null;
};

export const verificarTokenRecuperacionSupabase = async (
  token: string
): Promise<string | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('verificar_token_recuperacion', {
    p_token: token,
  });

  if (error || !data) {
    return null;
  }

  return data as string;
};

export const restablecerPasswordHuespedSupabase = async (
  token: string,
  nuevaPassword: string
): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('restablecer_password_huesped', {
    p_token: token,
    p_nueva_password: nuevaPassword,
  });

  if (error) {
    console.error('Error restableciendo contraseña:', error);
    return false;
  }

  return data as boolean;
};

export const obtenerReservasHuespedConDetalleSupabase = async (
  huespedId: string
): Promise<Array<Reserva & { habitacionNumero: string; habitacionTipo: string }>> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('obtener_reservas_huesped', {
    p_huesped_id: huespedId,
  });

  if (error) {
    console.error('Error obteniendo reservas del huésped:', error);
    return [];
  }

  return (data || []).map((r: {
    id: string;
    codigo_reserva: string;
    fecha_entrada: string;
    fecha_salida: string;
    num_personas: number;
    precio_total: number;
    estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
    habitacion_numero: string;
    habitacion_tipo: string;
    created_at: string;
  }) => ({
    id: r.id,
    codigoReserva: r.codigo_reserva,
    idHuesped: huespedId,
    idHabitacion: '',
    fechaEntrada: r.fecha_entrada,
    fechaSalida: r.fecha_salida,
    numPersonas: r.num_personas,
    precioTotal: r.precio_total,
    estado: r.estado,
    fechaCreacion: r.created_at,
    habitacionNumero: r.habitacion_numero,
    habitacionTipo: r.habitacion_tipo,
  }));
};
