// Sistema de datos mockeados para Hostal Don Tito
// Utiliza localStorage para persistencia entre sesiones
// NOTA: Este archivo solo se usa para autenticación de admin
// Los datos principales ahora vienen de Supabase (supabase-data.ts)

import { Habitacion, Reserva, Huesped, Usuario } from '@/types';

// Versión de datos - cambiar para forzar reinicio de localStorage
const DATA_VERSION = '2.1.0';

// =====================================================
// DATOS INICIALES (solo para fallback)
// =====================================================

const habitacionesIniciales: Habitacion[] = [
  {
    id: '1',
    numero: '101',
    tipo: 'individual',
    capacidad: 1,
    precioBase: 18,
    amenidades: ['WiFi', 'Aire acondicionado', 'TV', 'Baño privado'],
    descripcion: 'Habitación individual cómoda y acogedora.',
  },
  {
    id: '2',
    numero: '102',
    tipo: 'doble',
    capacidad: 2,
    precioBase: 28,
    amenidades: ['WiFi', 'Aire acondicionado', 'TV', 'Baño privado', 'Mini refrigerador'],
    descripcion: 'Habitación doble espaciosa perfecta para parejas.',
  },
  {
    id: '3',
    numero: '103',
    tipo: 'triple',
    capacidad: 3,
    precioBase: 38,
    amenidades: ['WiFi', 'Aire acondicionado', 'TV', 'Baño privado', 'Escritorio'],
    descripcion: 'Habitación triple ideal para pequeñas familias.',
  },
  {
    id: '4',
    numero: '104',
    tipo: 'familiar',
    capacidad: 4,
    precioBase: 45,
    amenidades: ['WiFi', 'Aire acondicionado', 'TV', 'Baño privado', 'Mini refrigerador', 'Sala de estar'],
    descripcion: 'Habitación familiar amplia con espacio adicional.',
  },
];

const reservasIniciales: Reserva[] = [];

const huespedesIniciales: Huesped[] = [];

const usuariosIniciales: Usuario[] = [
  {
    id: '1',
    nombre: 'Administrador',
    email: 'admin@hostaldontico.com',
    rol: 'admin',
    activo: true,
  },
];

// Funciones para manejar localStorage

// Verificar y limpiar datos antiguos si la version cambio
const verificarVersion = (): void => {
  if (typeof window === 'undefined') return;
  const storedVersion = localStorage.getItem('data_version');
  if (storedVersion !== DATA_VERSION) {
    // Limpiar todos los datos antiguos
    localStorage.removeItem('habitaciones');
    localStorage.removeItem('reservas');
    localStorage.removeItem('huespedes');
    localStorage.removeItem('usuarios');
    localStorage.setItem('data_version', DATA_VERSION);
  }
};

export const getHabitaciones = (): Habitacion[] => {
  if (typeof window === 'undefined') return habitacionesIniciales;
  verificarVersion();
  const stored = localStorage.getItem('habitaciones');
  if (!stored) {
    localStorage.setItem('habitaciones', JSON.stringify(habitacionesIniciales));
    return habitacionesIniciales;
  }
  return JSON.parse(stored);
};

export const getReservas = (): Reserva[] => {
  if (typeof window === 'undefined') return reservasIniciales;
  verificarVersion();
  const stored = localStorage.getItem('reservas');
  if (!stored) {
    localStorage.setItem('reservas', JSON.stringify(reservasIniciales));
    return reservasIniciales;
  }
  return JSON.parse(stored);
};

export const getHuespedes = (): Huesped[] => {
  if (typeof window === 'undefined') return huespedesIniciales;
  verificarVersion();
  const stored = localStorage.getItem('huespedes');
  if (!stored) {
    localStorage.setItem('huespedes', JSON.stringify(huespedesIniciales));
    return huespedesIniciales;
  }
  return JSON.parse(stored);
};

export const getUsuarios = (): Usuario[] => {
  if (typeof window === 'undefined') return usuariosIniciales;
  verificarVersion();
  const stored = localStorage.getItem('usuarios');
  if (!stored) {
    localStorage.setItem('usuarios', JSON.stringify(usuariosIniciales));
    return usuariosIniciales;
  }
  return JSON.parse(stored);
};

export const guardarReserva = (reserva: Reserva): void => {
  const reservas = getReservas();
  reservas.push(reserva);
  localStorage.setItem('reservas', JSON.stringify(reservas));
};

export const actualizarReserva = (id: string, datosActualizados: Partial<Reserva>): void => {
  const reservas = getReservas();
  const index = reservas.findIndex(r => r.id === id);
  if (index !== -1) {
    reservas[index] = { ...reservas[index], ...datosActualizados };
    localStorage.setItem('reservas', JSON.stringify(reservas));
  }
};

export const guardarHuesped = (huesped: Huesped): void => {
  const huespedes = getHuespedes();
  huespedes.push(huesped);
  localStorage.setItem('huespedes', JSON.stringify(huespedes));
};

export const generarIdReserva = (): string => {
  const reservas = getReservas();
  const numero = reservas.length + 1;
  return `RES-${String(numero).padStart(4, '0')}`;
};

export const generarIdHuesped = (): string => {
  const huespedes = getHuespedes();
  const numero = huespedes.length + 1;
  return `HUE-${String(numero).padStart(4, '0')}`;
};

// Verificar disponibilidad de habitación
export const verificarDisponibilidad = (
  idHabitacion: string,
  fechaEntrada: string,
  fechaSalida: string,
  excluirReservaId?: string
): boolean => {
  const reservas = getReservas();
  const entrada = new Date(fechaEntrada);
  const salida = new Date(fechaSalida);

  const conflictos = reservas.filter(r => {
    if (r.id === excluirReservaId) return false;
    if (r.idHabitacion !== idHabitacion) return false;
    // Solo pendientes y confirmadas ocupan habitación
    if (r.estado !== 'pendiente' && r.estado !== 'confirmada') return false;

    const rEntrada = new Date(r.fechaEntrada);
    const rSalida = new Date(r.fechaSalida);

    // Verificar solapamiento de fechas
    return (entrada < rSalida && salida > rEntrada);
  });

  return conflictos.length === 0;
};

// Calcular precio total de reserva
export const calcularPrecioTotal = (
  idHabitacion: string,
  fechaEntrada: string,
  fechaSalida: string
): number => {
  const habitaciones = getHabitaciones();
  const habitacion = habitaciones.find(h => h.id === idHabitacion);
  if (!habitacion) return 0;

  const entrada = new Date(fechaEntrada);
  const salida = new Date(fechaSalida);
  const noches = Math.ceil((salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));

  return habitacion.precioBase * noches;
};

// Obtener estadísticas
export const obtenerEstadisticas = () => {
  const reservas = getReservas();
  const habitaciones = getHabitaciones();
  const huespedes = getHuespedes();

  const hoy = new Date().toISOString().split('T')[0];
  
  // Reservas activas hoy (solo pendientes y confirmadas ocupan habitación)
  const reservasHoy = reservas.filter(r => {
    if (r.estado !== 'pendiente' && r.estado !== 'confirmada') return false;
    const entrada = new Date(r.fechaEntrada);
    const salida = new Date(r.fechaSalida);
    const hoyDate = new Date(hoy);
    return hoyDate >= entrada && hoyDate < salida;
  });

  // Ocupación
  const ocupacionHoy = Math.round((reservasHoy.length / habitaciones.length) * 100);

  // Ingresos del mes (solo reservas confirmadas o completadas)
  const primerDiaMes = new Date();
  primerDiaMes.setDate(1);
  const reservasMes = reservas.filter(r => {
    const creacion = new Date(r.fechaCreacion);
    return creacion >= primerDiaMes && (r.estado === 'confirmada' || r.estado === 'completada');
  });
  const ingresosMes = reservasMes.reduce((sum, r) => sum + r.precioTotal, 0);

  // Reservas futuras (solo pendientes y confirmadas)
  const reservasFuturas = reservas.filter(r => {
    const entrada = new Date(r.fechaEntrada);
    const hoyDate = new Date(hoy);
    return entrada > hoyDate && (r.estado === 'pendiente' || r.estado === 'confirmada');
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

// Autenticación simple (para demo)
export const autenticarUsuario = (email: string, password: string): Usuario | null => {
  // En producción esto debería ser con hash y backend seguro
  // Para demo: admin@hostaldontico.com / admin123
  if (email === 'admin@hostaldontico.com' && password === 'admin123') {
    return usuariosIniciales[0];
  }
  return null;
};

export const verificarSesion = (): Usuario | null => {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem('usuario');
  if (!stored) return null;
  return JSON.parse(stored);
};

export const iniciarSesion = (usuario: Usuario): void => {
  sessionStorage.setItem('usuario', JSON.stringify(usuario));
};

export const cerrarSesion = (): void => {
  sessionStorage.removeItem('usuario');
};
