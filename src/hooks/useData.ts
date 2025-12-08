'use client';

import { useState, useEffect, useCallback } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  getHabitacionesSupabase,
  getReservasSupabase,
  getHuespedesSupabase,
  guardarReservaSupabase,
  guardarHuespedSupabase,
  actualizarReservaSupabase,
  verificarDisponibilidadSupabase,
  calcularPrecioTotalSupabase,
  obtenerEstadisticasSupabase,
  suscribirseAReservas,
} from '@/lib/supabase-data';
import {
  getHabitaciones as getHabitacionesLocal,
  getReservas as getReservasLocal,
  getHuespedes as getHuespedesLocal,
  guardarReserva as guardarReservaLocal,
  guardarHuesped as guardarHuespedLocal,
  actualizarReserva as actualizarReservaLocal,
  verificarDisponibilidad as verificarDisponibilidadLocal,
  calcularPrecioTotal as calcularPrecioTotalLocal,
  obtenerEstadisticas as obtenerEstadisticasLocal,
  generarIdReserva,
  generarIdHuesped,
} from '@/lib/data';
import type { Habitacion, Reserva, Huesped } from '@/types';

// Hook para habitaciones
export function useHabitaciones() {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const data = await getHabitacionesSupabase();
        setHabitaciones(data);
      } else {
        setHabitaciones(getHabitacionesLocal());
      }
    } catch (err) {
      console.error('Error cargando habitaciones:', err);
      setError(err as Error);
      // Fallback a localStorage
      setHabitaciones(getHabitacionesLocal());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { habitaciones, loading, error, recargar: cargar };
}

// Hook para reservas con soporte de tiempo real
export function useReservas(enableRealtime = false) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const data = await getReservasSupabase();
        setReservas(data);
      } else {
        setReservas(getReservasLocal());
      }
    } catch (err) {
      console.error('Error cargando reservas:', err);
      setError(err as Error);
      setReservas(getReservasLocal());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Suscripción en tiempo real
  useEffect(() => {
    if (!enableRealtime || !isSupabaseConfigured()) return;

    const unsubscribe = suscribirseAReservas((nuevasReservas) => {
      setReservas(nuevasReservas);
    });

    return () => {
      unsubscribe();
    };
  }, [enableRealtime]);

  return { reservas, loading, error, recargar: cargar };
}

// Hook para huéspedes
export function useHuespedes() {
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const data = await getHuespedesSupabase();
        setHuespedes(data);
      } else {
        setHuespedes(getHuespedesLocal());
      }
    } catch (err) {
      console.error('Error cargando huéspedes:', err);
      setError(err as Error);
      setHuespedes(getHuespedesLocal());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { huespedes, loading, error, recargar: cargar };
}

// Hook para crear reserva
export function useCrearReserva() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const crearReserva = async (
    reservaData: Omit<Reserva, 'id' | 'fechaCreacion'>
  ): Promise<Reserva | null> => {
    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const reserva = await guardarReservaSupabase(reservaData);
        return reserva;
      } else {
        const id = generarIdReserva();
        const reserva: Reserva = {
          ...reservaData,
          id,
          fechaCreacion: new Date().toISOString(),
        };
        guardarReservaLocal(reserva);
        return reserva;
      }
    } catch (err) {
      console.error('Error creando reserva:', err);
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { crearReserva, loading, error };
}

// Hook para crear huésped
export function useCrearHuesped() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const crearHuesped = async (
    huespedData: Omit<Huesped, 'id'>
  ): Promise<Huesped | null> => {
    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const huesped = await guardarHuespedSupabase(huespedData);
        return huesped;
      } else {
        const id = generarIdHuesped();
        const huesped: Huesped = {
          ...huespedData,
          id,
        };
        guardarHuespedLocal(huesped);
        return huesped;
      }
    } catch (err) {
      console.error('Error creando huésped:', err);
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { crearHuesped, loading, error };
}

// Hook para actualizar reserva
export function useActualizarReserva() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const actualizarReserva = async (
    id: string,
    datos: Partial<Reserva>
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        await actualizarReservaSupabase(id, datos);
      } else {
        actualizarReservaLocal(id, datos);
      }
      return true;
    } catch (err) {
      console.error('Error actualizando reserva:', err);
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { actualizarReserva, loading, error };
}

// Hook para verificar disponibilidad
export function useVerificarDisponibilidad() {
  const verificar = async (
    idHabitacion: string,
    fechaEntrada: string,
    fechaSalida: string,
    excluirReservaId?: string
  ): Promise<boolean> => {
    try {
      if (isSupabaseConfigured()) {
        return await verificarDisponibilidadSupabase(
          idHabitacion,
          fechaEntrada,
          fechaSalida,
          excluirReservaId
        );
      } else {
        return verificarDisponibilidadLocal(
          idHabitacion,
          fechaEntrada,
          fechaSalida,
          excluirReservaId
        );
      }
    } catch (err) {
      console.error('Error verificando disponibilidad:', err);
      // En caso de error, usar versión local
      return verificarDisponibilidadLocal(
        idHabitacion,
        fechaEntrada,
        fechaSalida,
        excluirReservaId
      );
    }
  };

  return { verificar };
}

// Hook para calcular precio
export function useCalcularPrecio() {
  const calcular = async (
    idHabitacion: string,
    fechaEntrada: string,
    fechaSalida: string
  ): Promise<number> => {
    try {
      if (isSupabaseConfigured()) {
        return await calcularPrecioTotalSupabase(
          idHabitacion,
          fechaEntrada,
          fechaSalida
        );
      } else {
        return calcularPrecioTotalLocal(idHabitacion, fechaEntrada, fechaSalida);
      }
    } catch (err) {
      console.error('Error calculando precio:', err);
      return calcularPrecioTotalLocal(idHabitacion, fechaEntrada, fechaSalida);
    }
  };

  return { calcular };
}

// Hook para estadísticas
export function useEstadisticas() {
  const [estadisticas, setEstadisticas] = useState<ReturnType<typeof obtenerEstadisticasLocal> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const data = await obtenerEstadisticasSupabase();
        setEstadisticas(data);
      } else {
        setEstadisticas(obtenerEstadisticasLocal());
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      setError(err as Error);
      setEstadisticas(obtenerEstadisticasLocal());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { estadisticas, loading, error, recargar: cargar };
}

// Exportar función helper para verificar si usa Supabase
export const usaSupabase = () => isSupabaseConfigured();
