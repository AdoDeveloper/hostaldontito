'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, Calendar, User, BedDouble, Phone, Mail, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { getReservasSupabase, getHuespedesSupabase, getHabitacionesSupabase } from '@/lib/supabase-data';
import type { Reserva, Huesped, Habitacion } from '@/types';

export default function ConsultarReservaPage() {
  const [busqueda, setBusqueda] = useState('');
  const [tipoBusqueda, setTipoBusqueda] = useState<'codigo' | 'email' | 'telefono'>('codigo');
  const [reservaEncontrada, setReservaEncontrada] = useState<Reserva | null>(null);
  const [huespedEncontrado, setHuespedEncontrado] = useState<Huesped | null>(null);
  const [habitacionEncontrada, setHabitacionEncontrada] = useState<Habitacion | null>(null);
  const [error, setError] = useState('');
  const [buscando, setBuscando] = useState(false);

  const buscarReserva = async () => {
    if (!busqueda.trim()) {
      setError('Por favor ingresa un valor para buscar');
      return;
    }

    setBuscando(true);
    setError('');
    setReservaEncontrada(null);
    setHuespedEncontrado(null);
    setHabitacionEncontrada(null);

    try {
      const [reservas, huespedes, habitaciones] = await Promise.all([
        getReservasSupabase(),
        getHuespedesSupabase(),
        getHabitacionesSupabase()
      ]);

      let reserva: Reserva | undefined;

      if (tipoBusqueda === 'codigo') {
        // Buscar por código de reserva (HDT-YYYYMM-XXXX)
        reserva = reservas.find(r => r.codigoReserva.toLowerCase() === busqueda.toLowerCase());
      } else if (tipoBusqueda === 'email') {
        const huesped = huespedes.find(h => h.correoElectronico.toLowerCase() === busqueda.toLowerCase());
        if (huesped) {
          // Buscar la reserva más reciente del huésped
          const reservasHuesped = reservas
            .filter(r => r.idHuesped === huesped.id)
            .sort((a, b) => new Date(b.fechaEntrada).getTime() - new Date(a.fechaEntrada).getTime());
          reserva = reservasHuesped[0];
        }
      } else if (tipoBusqueda === 'telefono') {
        const huesped = huespedes.find(h => h.telefono.replace(/\D/g, '').includes(busqueda.replace(/\D/g, '')));
        if (huesped) {
          // Buscar la reserva más reciente del huésped
          const reservasHuesped = reservas
            .filter(r => r.idHuesped === huesped.id)
            .sort((a, b) => new Date(b.fechaEntrada).getTime() - new Date(a.fechaEntrada).getTime());
          reserva = reservasHuesped[0];
        }
      }

      if (reserva) {
        const huesped = huespedes.find(h => h.id === reserva!.idHuesped);
        const habitacion = habitaciones.find(h => h.id === reserva!.idHabitacion);

        setReservaEncontrada(reserva);
        setHuespedEncontrado(huesped || null);
        setHabitacionEncontrada(habitacion || null);
      } else {
        setError('No se encontro ninguna reserva con los datos proporcionados');
      }
    } catch (err) {
      console.error('Error buscando reserva:', err);
      setError('Error al buscar la reserva. Por favor intenta de nuevo.');
    } finally {
      setBuscando(false);
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'pendiente':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'cancelada':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'completada':
        return <CheckCircle className="w-6 h-6 text-blue-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-600" />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelada':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'completada':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const calcularNoches = () => {
    if (!reservaEncontrada) return 0;
    const entrada = new Date(reservaEncontrada.fechaEntrada);
    const salida = new Date(reservaEncontrada.fechaSalida);
    return Math.ceil((salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Encabezado */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-3">
                Consultar Mi Reserva
              </h1>
              <p className="text-lg text-gray-600">
                Ingresa tu codigo de reserva, correo o telefono para ver el estado de tu reserva
              </p>
            </div>

            {/* Formulario de busqueda */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="mb-6">
                <label className="block text-base font-semibold text-gray-700 mb-3">
                  Buscar por:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTipoBusqueda('codigo')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      tipoBusqueda === 'codigo'
                        ? 'bg-primary-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Codigo de Reserva
                  </button>
                  <button
                    onClick={() => setTipoBusqueda('email')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      tipoBusqueda === 'email'
                        ? 'bg-primary-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Correo Electronico
                  </button>
                  <button
                    onClick={() => setTipoBusqueda('telefono')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      tipoBusqueda === 'telefono'
                        ? 'bg-primary-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Telefono
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && buscarReserva()}
                    placeholder={
                      tipoBusqueda === 'codigo'
                        ? 'Ej: HDT-202512-0001'
                        : tipoBusqueda === 'email'
                        ? 'Ej: correo@ejemplo.com'
                        : 'Ej: 7777-7777'
                    }
                    className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-600"
                  />
                </div>
                <button
                  onClick={buscarReserva}
                  disabled={buscando}
                  className="px-8 py-4 bg-gold-500 hover:bg-gold-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {buscando ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <p className="text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Resultado de la busqueda */}
            {reservaEncontrada && huespedEncontrado && habitacionEncontrada && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Estado de la reserva */}
                <div className={`p-6 border-b-4 ${getEstadoColor(reservaEncontrada.estado)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getEstadoIcon(reservaEncontrada.estado)}
                      <div>
                        <p className="text-sm text-gray-600">Estado de tu reserva</p>
                        <p className="text-2xl font-bold capitalize">{reservaEncontrada.estado}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Codigo</p>
                      <p className="text-lg font-bold">{reservaEncontrada.codigoReserva}</p>
                    </div>
                  </div>
                </div>

                {/* Detalles */}
                <div className="p-6 space-y-6">
                  {/* Fechas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-primary-700" />
                        <span className="text-sm text-gray-600">Entrada</span>
                      </div>
                      <p className="text-lg font-bold text-primary-900">
                        {new Date(reservaEncontrada.fechaEntrada + 'T00:00:00').toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">Check-in: 14:00</p>
                    </div>
                    <div className="bg-primary-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-primary-700" />
                        <span className="text-sm text-gray-600">Salida</span>
                      </div>
                      <p className="text-lg font-bold text-primary-900">
                        {new Date(reservaEncontrada.fechaSalida + 'T00:00:00').toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">Check-out: 12:00</p>
                    </div>
                  </div>

                  {/* Habitacion */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BedDouble className="w-5 h-5 text-primary-700" />
                      <span className="font-semibold text-gray-700">Habitacion</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xl font-bold text-primary-900 capitalize">
                          {habitacionEncontrada.tipo} - #{habitacionEncontrada.numero}
                        </p>
                        <p className="text-gray-600">
                          {reservaEncontrada.numPersonas} {reservaEncontrada.numPersonas === 1 ? 'persona' : 'personas'} | {calcularNoches()} {calcularNoches() === 1 ? 'noche' : 'noches'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-green-600">${reservaEncontrada.precioTotal}</p>
                      </div>
                    </div>
                  </div>

                  {/* Datos del huesped */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-primary-700" />
                      <span className="font-semibold text-gray-700">Datos del Huesped</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-gray-900">{huespedEncontrado.nombreCompleto}</p>
                      <p className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        {huespedEncontrado.correoElectronico}
                      </p>
                      <p className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        {huespedEncontrado.telefono}
                      </p>
                    </div>
                  </div>

                  {/* Notas */}
                  {reservaEncontrada.notas && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                      <p className="font-semibold text-gray-700 mb-2">Notas adicionales:</p>
                      <p className="text-gray-600">{reservaEncontrada.notas}</p>
                    </div>
                  )}

                  {/* Informacion adicional */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <p className="font-semibold text-blue-800 mb-2">Informacion importante:</p>
                    <ul className="text-blue-700 space-y-1 text-sm">
                      <li>- El pago se realiza al momento del check-in</li>
                      <li>- Cancelacion gratuita hasta 24 horas antes</li>
                      <li>- Para cambios contactanos por telefono o email</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
