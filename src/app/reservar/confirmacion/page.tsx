'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, Home, Mail, Calendar, Download, Copy, Check, Loader2 } from 'lucide-react';
import { getReservasSupabase, getHabitacionesSupabase, getHuespedesSupabase } from '@/lib/supabase-data';
import type { Reserva, Habitacion, Huesped } from '@/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ConfirmacionPage() {
  const searchParams = useSearchParams();
  const idReserva = searchParams?.get('id');

  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [habitacion, setHabitacion] = useState<Habitacion | null>(null);
  const [huesped, setHuesped] = useState<Huesped | null>(null);
  const [cargando, setCargando] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!idReserva) {
        setCargando(false);
        return;
      }

      try {
        const [reservas, habitaciones, huespedes] = await Promise.all([
          getReservasSupabase(),
          getHabitacionesSupabase(),
          getHuespedesSupabase()
        ]);

        const reservaEncontrada = reservas.find(r => r.id === idReserva);
        if (reservaEncontrada) {
          setReserva(reservaEncontrada);
          const habEncontrada = habitaciones.find(h => h.id === reservaEncontrada.idHabitacion);
          setHabitacion(habEncontrada || null);
          const hueEncontrado = huespedes.find(h => h.id === reservaEncontrada.idHuesped);
          setHuesped(hueEncontrado || null);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [idReserva]);

  const obtenerNumNoches = (): number => {
    if (!reserva) return 0;
    const entrada = new Date(reserva.fechaEntrada);
    const salida = new Date(reserva.fechaSalida);
    return Math.ceil((salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));
  };

  const copiarCodigo = async () => {
    if (reserva?.codigoReserva) {
      try {
        await navigator.clipboard.writeText(reserva.codigoReserva);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      } catch (error) {
        console.error('Error copiando código:', error);
      }
    }
  };

  const guardarPDF = async () => {
    if (!pdfRef.current || !reserva) return;

    setGenerandoPDF(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Reserva-${reserva.codigoReserva}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      // Fallback a impresión si falla
      window.print();
    } finally {
      setGenerandoPDF(false);
    }
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
          {/* Contenido para PDF */}
          <div ref={pdfRef} className="bg-white p-6 rounded-lg">
            {/* Mensaje de éxito */}
            <div className="bg-yellow-50 border-4 border-yellow-500 rounded-lg p-8 text-center mb-8">
              <CheckCircle className="w-20 h-20 text-yellow-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-yellow-900 mb-4">
                ¡Solicitud Recibida!
              </h1>
              <p className="text-xl text-gray-700">
                Tu reserva está pendiente de confirmación por parte del hostal
              </p>
              <p className="text-base text-gray-600 mt-2">
                Te enviaremos un correo de confirmación cuando sea aprobada
              </p>
            </div>

            {/* Número de confirmación */}
            <div className="card mb-6">
              <div className="text-center border-b pb-4 mb-4">
                <p className="text-lg text-gray-600 mb-2">Código de Reserva</p>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-4xl font-bold text-primary-900">{reserva.codigoReserva}</p>
                  <button
                    onClick={copiarCodigo}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors print:hidden"
                    title="Copiar código"
                  >
                    {copiado ? (
                      <Check className="w-6 h-6 text-green-600" />
                    ) : (
                      <Copy className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                </div>
                {copiado && (
                  <p className="text-sm text-green-600 mt-2">¡Código copiado!</p>
                )}
              </div>
              <p className="text-base text-gray-600 text-center">
                Guarda este código para cualquier consulta sobre tu reserva
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
            <div className="card mb-6 bg-gold-50 border-2 border-gold-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Mail className="w-8 h-8 text-gold-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Pendiente de Confirmación</h3>
                  <p className="text-base text-gray-700">
                    Recibirás un correo electrónico de confirmación en{' '}
                    <strong>{huesped.correoElectronico}</strong>{' '}
                    cuando tu reserva sea aprobada por el hostal.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Fin contenido PDF */}

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={guardarPDF}
              disabled={generandoPDF}
              className="flex-1 btn-outline flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generandoPDF ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-6 h-6" />
                  <span>Guardar Confirmación</span>
                </>
              )}
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
