// Tipos generados para Supabase Database

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      habitaciones: {
        Row: {
          id: string;
          numero: string;
          tipo: 'individual' | 'doble' | 'triple' | 'familiar';
          capacidad: number;
          precio_base: number;
          amenidades: string[];
          descripcion: string;
          imagen_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          numero: string;
          tipo: 'individual' | 'doble' | 'triple' | 'familiar';
          capacidad: number;
          precio_base: number;
          amenidades?: string[];
          descripcion: string;
          imagen_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          numero?: string;
          tipo?: 'individual' | 'doble' | 'triple' | 'familiar';
          capacidad?: number;
          precio_base?: number;
          amenidades?: string[];
          descripcion?: string;
          imagen_url?: string | null;
          created_at?: string;
        };
      };
      huespedes: {
        Row: {
          id: string;
          nombre_completo: string;
          correo_electronico: string;
          telefono: string;
          fecha_registro: string;
          historial_visitas: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre_completo: string;
          correo_electronico: string;
          telefono: string;
          fecha_registro?: string;
          historial_visitas?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre_completo?: string;
          correo_electronico?: string;
          telefono?: string;
          fecha_registro?: string;
          historial_visitas?: number;
          created_at?: string;
        };
      };
      reservas: {
        Row: {
          id: string;
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
        };
        Insert: {
          id?: string;
          id_huesped: string;
          id_habitacion: string;
          fecha_entrada: string;
          fecha_salida: string;
          num_personas: number;
          precio_total: number;
          estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
          metodo_pago?: 'efectivo' | 'tarjeta' | 'transferencia' | null;
          notas?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          id_huesped?: string;
          id_habitacion?: string;
          fecha_entrada?: string;
          fecha_salida?: string;
          num_personas?: number;
          precio_total?: number;
          estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
          metodo_pago?: 'efectivo' | 'tarjeta' | 'transferencia' | null;
          notas?: string | null;
          created_at?: string;
        };
      };
      usuarios: {
        Row: {
          id: string;
          nombre: string;
          email: string;
          rol: 'admin' | 'recepcion' | 'gerente';
          activo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          email: string;
          rol?: 'admin' | 'recepcion' | 'gerente';
          activo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          email?: string;
          rol?: 'admin' | 'recepcion' | 'gerente';
          activo?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      tipo_habitacion: 'individual' | 'doble' | 'triple' | 'familiar';
      estado_reserva: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
      metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
      rol_usuario: 'admin' | 'recepcion' | 'gerente';
    };
  };
}
