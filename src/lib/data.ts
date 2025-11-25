// Sistema de datos mockeados para Hostal Don Tito
// Utiliza localStorage para persistencia entre sesiones

import { Habitacion, Reserva, Huesped, Usuario } from '@/types';

// Datos iniciales de habitaciones
export const habitacionesIniciales: Habitacion[] = [
  {
    id: 'hab-001',
    numero: '101',
    tipo: 'individual',
    capacidad: 1,
    precioBase: 18,
    amenidades: ['WiFi', 'Aire acondicionado', 'TV', 'Baño privado'],
    descripcion: 'Habitación individual cómoda y acogedora con todas las comodidades básicas.',
  },
  {
    id: 'hab-002',
    numero: '102',
    tipo: 'doble',
    capacidad: 2,
    precioBase: 28,
    amenidades: ['WiFi', 'Aire acondicionado', 'TV', 'Baño privado', 'Mini refrigerador'],
    descripcion: 'Habitación doble espaciosa perfecta para parejas, con vista al jardín.',
  },
  {
    id: 'hab-003',
    numero: '103',
    tipo: 'triple',
    capacidad: 3,
    precioBase: 38,
    amenidades: ['WiFi', 'Aire acondicionado', 'TV', 'Baño privado', 'Escritorio'],
    descripcion: 'Habitación triple ideal para pequeñas familias o grupos de amigos.',
  },
  {
    id: 'hab-004',
    numero: '104',
    tipo: 'familiar',
    capacidad: 4,
    precioBase: 45,
    amenidades: ['WiFi', 'Aire acondicionado', 'TV', 'Baño privado', 'Mini refrigerador', 'Sala de estar'],
    descripcion: 'Habitación familiar amplia con espacio adicional para el confort de toda la familia.',
  },
];

// Reservas de ejemplo
export const reservasIniciales: Reserva[] = [
  {
    id: 'res-001',
    idHuesped: 'hue-001',
    idHabitacion: 'hab-002',
    fechaEntrada: '2024-11-25',
    fechaSalida: '2024-11-27',
    numPersonas: 2,
    precioTotal: 56,
    estado: 'confirmada',
    fechaCreacion: '2024-11-20T10:30:00Z',
    metodoPago: 'tarjeta',
  },
  {
    id: 'res-002',
    idHuesped: 'hue-002',
    idHabitacion: 'hab-001',
    fechaEntrada: '2024-11-26',
    fechaSalida: '2024-11-28',
    numPersonas: 1,
    precioTotal: 36,
    estado: 'confirmada',
    fechaCreacion: '2024-11-21T14:15:00Z',
    metodoPago: 'efectivo',
  },
];

// Huéspedes de ejemplo
export const huespedesIniciales: Huesped[] = [
  {
    id: 'hue-001',
    nombreCompleto: 'María González',
    correoElectronico: 'maria.gonzalez@email.com',
    telefono: '+503 7123-4567',
    fechaRegistro: '2024-11-20T10:30:00Z',
    historialVisitas: 1,
  },
  {
    id: 'hue-002',
    nombreCompleto: 'Juan Pérez',
    correoElectronico: 'juan.perez@email.com',
    telefono: '+503 7234-5678',
    fechaRegistro: '2024-11-21T14:15:00Z',
    historialVisitas: 1,
  },
];

// Usuario admin de ejemplo
export const usuariosIniciales: Usuario[] = [
  {
    id: 'usr-001',
    nombre: 'Administrador',
    email: 'admin@hostaldontico.com',
    rol: 'admin',
    activo: true,
  },
];

// Funciones para manejar localStorage

export const getHabitaciones = (): Habitacion[] => {
  if (typeof window === 'undefined') return habitacionesIniciales;
  const stored = localStorage.getItem('habitaciones');
  if (!stored) {
    localStorage.setItem('habitaciones', JSON.stringify(habitacionesIniciales));
    return habitacionesIniciales;
  }
  return JSON.parse(stored);
};

export const getReservas = (): Reserva[] => {
  if (typeof window === 'undefined') return reservasIniciales;
  const stored = localStorage.getItem('reservas');
  if (!stored) {
    localStorage.setItem('reservas', JSON.stringify(reservasIniciales));
    return reservasIniciales;
  }
  return JSON.parse(stored);
};

export const getHuespedes = (): Huesped[] => {
  if (typeof window === 'undefined') return huespedesIniciales;
  const stored = localStorage.getItem('huespedes');
  if (!stored) {
    localStorage.setItem('huespedes', JSON.stringify(huespedesIniciales));
    return huespedesIniciales;
  }
  return JSON.parse(stored);
};

export const getUsuarios = (): Usuario[] => {
  if (typeof window === 'undefined') return usuariosIniciales;
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
    if (r.estado === 'cancelada') return false;

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
  
  // Reservas activas hoy
  const reservasHoy = reservas.filter(r => {
    if (r.estado === 'cancelada') return false;
    const entrada = new Date(r.fechaEntrada);
    const salida = new Date(r.fechaSalida);
    const hoyDate = new Date(hoy);
    return hoyDate >= entrada && hoyDate < salida;
  });

  // Ocupación
  const ocupacionHoy = Math.round((reservasHoy.length / habitaciones.length) * 100);

  // Ingresos del mes
  const primerDiaMes = new Date();
  primerDiaMes.setDate(1);
  const reservasMes = reservas.filter(r => {
    const creacion = new Date(r.fechaCreacion);
    return creacion >= primerDiaMes && r.estado !== 'cancelada';
  });
  const ingresosMes = reservasMes.reduce((sum, r) => sum + r.precioTotal, 0);

  // Reservas futuras
  const reservasFuturas = reservas.filter(r => {
    const entrada = new Date(r.fechaEntrada);
    const hoyDate = new Date(hoy);
    return entrada > hoyDate && r.estado !== 'cancelada';
  });

  return {
    ocupacionHoy,
    habitacionesOcupadas: reservasHoy.length,
    totalHabitaciones: habitaciones.length,
    ingresosMes,
    reservasFuturas: reservasFuturas.length,
    totalReservas: reservas.filter(r => r.estado !== 'cancelada').length,
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
