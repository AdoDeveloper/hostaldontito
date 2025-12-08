// Tipos para el sistema de reservas Hostal Don Tito

export interface Habitacion {
  id: string;
  numero: string;
  tipo: 'individual' | 'doble' | 'triple' | 'familiar';
  capacidad: number;
  precioBase: number;
  amenidades: string[];
  descripcion: string;
  imagenUrl?: string;
}

export interface Reserva {
  id: string;
  codigoReserva: string; // Código legible como "HDT-2024-0001"
  idHuesped: string;
  idHabitacion: string;
  fechaEntrada: string; // ISO date string
  fechaSalida: string; // ISO date string
  numPersonas: number;
  precioTotal: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  fechaCreacion: string;
  metodoPago?: 'efectivo' | 'tarjeta' | 'transferencia';
  notas?: string;
}

export interface Huesped {
  id: string;
  nombreCompleto: string;
  correoElectronico: string;
  telefono: string;
  fechaRegistro: string;
  historialVisitas: number;
}

export interface DisponibilidadDia {
  fecha: string; // YYYY-MM-DD
  idHabitacion: string;
  disponible: boolean;
  precioEspecial?: number;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'recepcion' | 'gerente';
  activo: boolean;
}

export interface EstadisticasOcupacion {
  fecha: string;
  ocupacion: number; // 0-100
  habitacionesOcupadas: number;
  totalHabitaciones: number;
  ingresos: number;
}

export interface DatosReserva {
  habitacionId: string;
  fechaEntrada: string;
  fechaSalida: string;
  numPersonas: number;
  nombreCompleto: string;
  correoElectronico: string;
  telefono: string;
  notas?: string;
}
