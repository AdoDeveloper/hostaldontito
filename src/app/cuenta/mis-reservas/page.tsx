'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  LogOut,
  User,
  BedDouble,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Plus,
  Home,
} from 'lucide-react';
import { verificarSesionHuespedSupabase, cerrarSesionHuespedSupabase, obtenerReservasHuespedConDetalleSupabase } from '@/lib/supabase-data';
import type { CuentaHuesped } from '@/lib/supabase-data';
import type { Reserva } from '@/types';

interface ReservaConDetalle extends Reserva {
  habitacionNumero: string;
  habitacionTipo: string;
}

export default function MisReservasPage() {
  const router = useRouter();
  const [cuenta, setCuenta] = useState<CuentaHuesped | null>(null);
  const [reservas, setReservas] = useState<ReservaConDetalle[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem('huesped_token');

      if (!token) {
        router.push('/cuenta/login');
        return;
      }

      try {
        const cuentaData = await verificarSesionHuespedSupabase(token);

        if (!cuentaData) {
          localStorage.removeItem('huesped_token');
          localStorage.removeItem('huesped_cuenta');
          router.push('/cuenta/login');
          return;
        }

        setCuenta(cuentaData);

        // Cargar reservas
        const reservasData = await obtenerReservasHuespedConDetalleSupabase(cuentaData.huespedId);
        setReservas(reservasData);
      } catch (error) {
        console.error('Error verificando sesión:', error);
        router.push('/cuenta/login');
      } finally {
        setCargando(false);
      }
    };

    verificarSesion();
  }, [router]);

  const cerrarSesion = async () => {
    const token = localStorage.getItem('huesped_token');
    if (token) {
      await cerrarSesionHuespedSupabase(token);
    }
    localStorage.removeItem('huesped_token');
    localStorage.removeItem('huesped_cuenta');
    router.push('/');
  };

  const getEstadoBadge = (estado: string) => {
    const estilos = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmada: 'bg-green-100 text-green-800 border-green-200',
      cancelada: 'bg-red-100 text-red-800 border-red-200',
      completada: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    const iconos = {
      pendiente: <Clock className="w-3.5 h-3.5" />,
      confirmada: <CheckCircle className="w-3.5 h-3.5" />,
      cancelada: <XCircle className="w-3.5 h-3.5" />,
      completada: <CheckCircle className="w-3.5 h-3.5" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${estilos[estado as keyof typeof estilos]}`}>
        {iconos[estado as keyof typeof iconos]}
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-PE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const calcularNoches = (entrada: string, salida: string) => {
    const fechaEntrada = new Date(entrada);
    const fechaSalida = new Date(salida);
    return Math.ceil((fechaSalida.getTime() - fechaEntrada.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando tus reservas...</p>
        </div>
      </div>
    );
  }

  if (!cuenta) {
    return null;
  }

  const reservasActivas = reservas.filter(r => r.estado !== 'cancelada' && r.estado !== 'completada');
  const reservasPasadas = reservas.filter(r => r.estado === 'cancelada' || r.estado === 'completada');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-950 to-primary-900 text-white shadow-xl sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Image
                  src="/logo-tito.png"
                  alt="Hostal Don Tito"
                  width={32}
                  height={32}
                  className="object-contain rounded-md"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold tracking-tight">Hostal Don Tito</h1>
                <p className="text-xs text-gold-400 font-medium">Mi Cuenta</p>
              </div>
            </Link>

            {/* Usuario y acciones */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-primary-800/50 rounded-lg transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Inicio</span>
              </Link>

              <div className="flex items-center gap-3 pl-3 border-l border-primary-700">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold">{cuenta.nombre}</p>
                  <p className="text-xs text-gray-400">{cuenta.email}</p>
                </div>
                <div className="w-9 h-9 bg-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
                  {cuenta.nombre.charAt(0).toUpperCase()}
                </div>
              </div>

              <button
                onClick={cerrarSesion}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors text-sm font-medium shadow-sm"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="container mx-auto px-4 py-8">
        {/* Título y botón nueva reserva */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Reservas</h1>
            <p className="text-gray-600">Gestiona tus reservas en Hostal Don Tito</p>
          </div>
          <Link
            href="/reservar"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-primary-900 font-semibold rounded-lg shadow transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva reserva
          </Link>
        </div>

        {/* Info del usuario */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{cuenta.nombre}</h2>
              <p className="text-gray-600">{cuenta.email}</p>
              <p className="text-sm text-gray-500">{cuenta.telefono}</p>
            </div>
          </div>
        </div>

        {/* Reservas activas */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            Reservas Activas ({reservasActivas.length})
          </h2>

          {reservasActivas.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes reservas activas</h3>
              <p className="text-gray-600 mb-4">¡Haz tu primera reserva ahora!</p>
              <Link
                href="/reservar"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nueva reserva
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {reservasActivas.map((reserva) => (
                <div
                  key={reserva.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-bold text-primary-600">{reserva.codigoReserva}</span>
                        {getEstadoBadge(reserva.estado)}
                      </div>

                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <BedDouble className="w-4 h-4" />
                        <span>Habitación {reserva.habitacionNumero} - {reserva.habitacionTipo}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>
                          <strong>Entrada:</strong> {formatearFecha(reserva.fechaEntrada)}
                        </span>
                        <span>
                          <strong>Salida:</strong> {formatearFecha(reserva.fechaSalida)}
                        </span>
                        <span>
                          <strong>Noches:</strong> {calcularNoches(reserva.fechaEntrada, reserva.fechaSalida)}
                        </span>
                        <span>
                          <strong>Personas:</strong> {reserva.numPersonas}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-gold-600">S/ {reserva.precioTotal.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Historial de reservas */}
        {reservasPasadas.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Historial ({reservasPasadas.length})
            </h2>

            <div className="grid gap-4">
              {reservasPasadas.map((reserva) => (
                <div
                  key={reserva.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 opacity-75"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-bold text-gray-500">{reserva.codigoReserva}</span>
                        {getEstadoBadge(reserva.estado)}
                      </div>

                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <BedDouble className="w-4 h-4" />
                        <span>Habitación {reserva.habitacionNumero} - {reserva.habitacionTipo}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>{formatearFecha(reserva.fechaEntrada)} - {formatearFecha(reserva.fechaSalida)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-500">S/ {reserva.precioTotal.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Información adicional */}
        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">¿Necesitas ayuda?</h3>
              <p className="text-blue-700 text-sm">
                Si necesitas modificar o cancelar una reserva, contáctanos directamente al teléfono{' '}
                <a href="tel:+51982123456" className="font-semibold hover:underline">+51 982 123 456</a>
                {' '}o escríbenos a{' '}
                <a href="mailto:reservas@hostaldontico.com" className="font-semibold hover:underline">reservas@hostaldontico.com</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
