'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, Home, Mail, MessageSquare, Calendar, Printer } from 'lucide-react';
import { getReservas, getHabitaciones, getHuespedes } from '@/lib/data';
import type { Reserva, Habitacion, Huesped } from '@/types';

export default function ConfirmacionPage() {
  const searchParams = useSearchParams();
  const idReserva = searchParams?.get('id');
  
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [habitacion, setHabitacion] = useState<Habitacion | null>(null);
  const [huesped, setHuesped] = useState<Huesped | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!idReserva) {
      setCargando(false);
      return;
    }

    const reservas = getReservas();
    const habitaciones = getHabitaciones();
    const huespedes = getHuespedes();

    const reservaEncontrada = reservas.find(r => r.id === idReserva);
    if (reservaEncontrada) {
      setReserva(reservaEncontrada);
      const habEncontrada = habitaciones.find(h => h.id === reservaEncontrada.idHabitacion);
      setHabitacion(habEncontrada || null);
      const hueEncontrado = huespedes.find(h => h.id === reservaEncontrada.idHuesped);
      setHuesped(hueEncontrado || null);
    }

    setCargando(false);
  }, [idReserva]);

  const obtenerNumNoches = (): number => {
    if (!reserva) return 0;
    const entrada = new Date(reserva.fechaEntrada);
    const salida = new Date(reserva.fechaSalida);
    return Math.ceil((salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));
  };

  const imprimir = () => {
    window.print();
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-800 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Cargando información de tu reserva...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!reserva || !habitacion || !huesped) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-4">Reserva no encontrada</h2>
            <p className="text-lg text-gray-600 mb-6">
              No pudimos encontrar la información de esta reserva.
            </p>
            <Link href="/" className="btn-primary">
              Volver al Inicio
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Mensaje de éxito */}
          <div className="bg-green-50 border-4 border-green-500 rounded-lg p-8 text-center mb-8">
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-green-900 mb-4">
              ¡Reserva Confirmada!
            </h1>
            <p className="text-xl text-gray-700">
              Tu reserva ha sido procesada exitosamente
            </p>
          </div>

          {/* Número de confirmación */}
          <div className="card mb-6">
            <div className="text-center border-b pb-4 mb-4">
              <p className="text-lg text-gray-600 mb-2">Número de Confirmación</p>
              <p className="text-4xl font-bold text-primary-900">{reserva.id}</p>
            </div>
            <p className="text-base text-gray-600 text-center">
              Guarda este número para cualquier consulta sobre tu reserva
            </p>
          </div>

          {/* Detalles de la reserva */}
          <div className="card mb-6">
            <h2 className="text-2xl font-bold mb-6 text-primary-900">Detalles de tu Reserva</h2>
            
            <div className="space-y-4 text-lg">
              <div className="flex justify-between py-3 border-b">
                <span className="font-semibold text-gray-700">Habitación:</span>
                <span className="text-right capitalize">
                  {habitacion.tipo} - #{habitacion.numero}
                </span>
              </div>
              
              <div className="flex justify-between py-3 border-b">
                <span className="font-semibold text-gray-700">Fecha de entrada:</span>
                <span className="text-right">
                  {new Date(reserva.fechaEntrada + 'T00:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              
              <div className="flex justify-between py-3 border-b">
                <span className="font-semibold text-gray-700">Fecha de salida:</span>
                <span className="text-right">
                  {new Date(reserva.fechaSalida + 'T00:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              
              <div className="flex justify-between py-3 border-b">
                <span className="font-semibold text-gray-700">Número de noches:</span>
                <span className="text-right">{obtenerNumNoches()}</span>
              </div>
              
              <div className="flex justify-between py-3 border-b">
                <span className="font-semibold text-gray-700">Número de personas:</span>
                <span className="text-right">{reserva.numPersonas}</span>
              </div>
              
              <div className="flex justify-between py-4 bg-gold-50 px-4 rounded-lg">
                <span className="text-2xl font-bold text-gray-900">Total a pagar:</span>
                <span className="text-3xl font-bold text-gold-600">
                  ${reserva.precioTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Información del huésped */}
          <div className="card mb-6">
            <h2 className="text-2xl font-bold mb-4 text-primary-900">Información del Huésped</h2>
            <div className="space-y-2 text-lg">
              <p><strong>Nombre:</strong> {huesped.nombreCompleto}</p>
              <p><strong>Email:</strong> {huesped.correoElectronico}</p>
              <p><strong>Teléfono:</strong> {huesped.telefono}</p>
            </div>
          </div>

          {/* Información importante */}
          <div className="card mb-6 bg-blue-50 border-2 border-blue-300">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              Información Importante
            </h3>
            <div className="space-y-3 text-base">
              <p className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span><strong>Check-in:</strong> 14:00 - 22:00 horas</span>
              </p>
              <p className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span><strong>Check-out:</strong> 07:00 - 12:00 horas</span>
              </p>
              <p className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span><strong>Pago:</strong> Se realizará al momento del check-in (efectivo o tarjeta)</span>
              </p>
              <p className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span><strong>Cancelación:</strong> Gratuita hasta 24 horas antes de la llegada</span>
              </p>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="card mb-8 bg-gold-50 border-2 border-gold-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex space-x-2">
                  <Mail className="w-8 h-8 text-gold-600" />
                  <MessageSquare className="w-8 h-8 text-gold-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Confirmación Enviada</h3>
                <p className="text-base text-gray-700">
                  Hemos enviado un correo electrónico con toda la información de tu reserva a{' '}
                  <strong>{huesped.correoElectronico}</strong>
                </p>
                <p className="text-base text-gray-700 mt-2">
                  También recibirás un SMS de confirmación en <strong>{huesped.telefono}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={imprimir}
              className="flex-1 btn-outline flex items-center justify-center space-x-2"
            >
              <Printer className="w-6 h-6" />
              <span>Imprimir Confirmación</span>
            </button>
            <Link href="/" className="flex-1 btn-primary flex items-center justify-center space-x-2">
              <Home className="w-6 h-6" />
              <span>Volver al Inicio</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
