'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Calendario from '@/components/reservas/Calendario';
import { Calendar, User, CheckCircle, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import {
  getHabitaciones,
  getReservas,
  verificarDisponibilidad,
  calcularPrecioTotal,
  guardarReserva,
  guardarHuesped,
  generarIdReserva,
  generarIdHuesped,
} from '@/lib/data';
import type { Habitacion, DatosReserva } from '@/types';

export default function ReservarPage() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState<string>('');
  const [fechaEntrada, setFechaEntrada] = useState<string | null>(null);
  const [fechaSalida, setFechaSalida] = useState<string | null>(null);
  const [seleccionandoFecha, setSeleccionandoFecha] = useState<'entrada' | 'salida'>('entrada');
  const [numPersonas, setNumPersonas] = useState(1);
  const [datosHuesped, setDatosHuesped] = useState({
    nombreCompleto: '',
    correoElectronico: '',
    telefono: '',
    notas: '',
  });
  const [errores, setErrores] = useState<string[]>([]);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    setHabitaciones(getHabitaciones());
  }, []);

  const manejarSeleccionFecha = (fecha: string) => {
    if (seleccionandoFecha === 'entrada') {
      setFechaEntrada(fecha);
      setFechaSalida(null);
      setSeleccionandoFecha('salida');
    } else {
      if (fechaEntrada && fecha <= fechaEntrada) {
        setErrores(['La fecha de salida debe ser posterior a la fecha de entrada']);
        return;
      }
      setFechaSalida(fecha);
    }
    setErrores([]);
  };

  const habitacionDisponible = (idHabitacion: string): boolean => {
    if (!fechaEntrada || !fechaSalida) return true;
    return verificarDisponibilidad(idHabitacion, fechaEntrada, fechaSalida);
  };

  const obtenerPrecioTotal = (): number => {
    if (!habitacionSeleccionada || !fechaEntrada || !fechaSalida) return 0;
    return calcularPrecioTotal(habitacionSeleccionada, fechaEntrada, fechaSalida);
  };

  const obtenerNumNoches = (): number => {
    if (!fechaEntrada || !fechaSalida) return 0;
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    return Math.ceil((salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));
  };

  const validarPaso1 = (): boolean => {
    const nuevosErrores: string[] = [];
    
    if (!habitacionSeleccionada) {
      nuevosErrores.push('Debe seleccionar una habitación');
    }
    if (!fechaEntrada || !fechaSalida) {
      nuevosErrores.push('Debe seleccionar fechas de entrada y salida');
    }
    if (fechaEntrada && fechaSalida && !habitacionDisponible(habitacionSeleccionada)) {
      nuevosErrores.push('La habitación no está disponible en las fechas seleccionadas');
    }

    setErrores(nuevosErrores);
    return nuevosErrores.length === 0;
  };

  const validarPaso2 = (): boolean => {
    const nuevosErrores: string[] = [];
    
    if (!datosHuesped.nombreCompleto.trim()) {
      nuevosErrores.push('El nombre completo es obligatorio');
    }
    if (!datosHuesped.correoElectronico.trim()) {
      nuevosErrores.push('El correo electrónico es obligatorio');
    } else if (!/\S+@\S+\.\S+/.test(datosHuesped.correoElectronico)) {
      nuevosErrores.push('El correo electrónico no es válido');
    }
    if (!datosHuesped.telefono.trim()) {
      nuevosErrores.push('El teléfono es obligatorio');
    }

    const habitacion = habitaciones.find(h => h.id === habitacionSeleccionada);
    if (habitacion && numPersonas > habitacion.capacidad) {
      nuevosErrores.push(`La habitación ${habitacion.tipo} tiene capacidad máxima de ${habitacion.capacidad} personas`);
    }

    setErrores(nuevosErrores);
    return nuevosErrores.length === 0;
  };

  const avanzarPaso = () => {
    if (paso === 1 && validarPaso1()) {
      setPaso(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (paso === 2 && validarPaso2()) {
      setPaso(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const retrocederPaso = () => {
    if (paso > 1) {
      setPaso(paso - 1);
      setErrores([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const confirmarReserva = async () => {
    setProcesando(true);
    
    try {
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));

      const idHuesped = generarIdHuesped();
      const idReserva = generarIdReserva();

      // Guardar huésped
      guardarHuesped({
        id: idHuesped,
        nombreCompleto: datosHuesped.nombreCompleto,
        correoElectronico: datosHuesped.correoElectronico,
        telefono: datosHuesped.telefono,
        fechaRegistro: new Date().toISOString(),
        historialVisitas: 1,
      });

      // Guardar reserva
      guardarReserva({
        id: idReserva,
        idHuesped,
        idHabitacion: habitacionSeleccionada,
        fechaEntrada: fechaEntrada!,
        fechaSalida: fechaSalida!,
        numPersonas,
        precioTotal: obtenerPrecioTotal(),
        estado: 'confirmada',
        fechaCreacion: new Date().toISOString(),
        notas: datosHuesped.notas,
      });

      // Redirigir a página de confirmación
      router.push(`/reservar/confirmacion?id=${idReserva}`);
    } catch (error) {
      setErrores(['Hubo un error al procesar la reserva. Por favor, intente nuevamente.']);
      setProcesando(false);
    }
  };

  const habitacionSeleccionadaInfo = habitaciones.find(h => h.id === habitacionSeleccionada);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Indicador de progreso */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex-1 flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors
                      ${paso >= num ? 'bg-primary-800 text-white' : 'bg-gray-300 text-gray-600'}`}
                  >
                    {num}
                  </div>
                  <span className={`ml-3 font-semibold text-lg hidden md:inline
                    ${paso >= num ? 'text-primary-900' : 'text-gray-500'}`}>
                    {num === 1 && 'Fechas y Habitación'}
                    {num === 2 && 'Tus Datos'}
                    {num === 3 && 'Confirmación'}
                  </span>
                </div>
                {num < 3 && (
                  <div
                    className={`flex-1 h-1 mx-4 transition-colors
                      ${paso > num ? 'bg-primary-800' : 'bg-gray-300'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mensajes de error */}
        {errores.length > 0 && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-red-900 mb-2">
                    Por favor, corrija los siguientes errores:
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {errores.map((error, idx) => (
                      <li key={idx} className="text-base text-red-800">{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 1: Selección de fechas y habitación */}
        {paso === 1 && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-primary-900 mb-6">
              Paso 1: Selecciona tus fechas y habitación
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendario */}
              <div>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold mb-2">Selecciona tus fechas</h3>
                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => setSeleccionandoFecha('entrada')}
                      className={`flex-1 p-4 rounded-lg border-2 transition-colors text-left
                        ${seleccionandoFecha === 'entrada' ? 'border-primary-800 bg-primary-50' : 'border-gray-300'}`}
                    >
                      <div className="text-sm text-gray-600 mb-1">Entrada</div>
                      <div className="text-lg font-bold">
                        {fechaEntrada
                          ? new Date(fechaEntrada + 'T00:00:00').toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Seleccionar fecha'}
                      </div>
                    </button>
                    <button
                      onClick={() => setSeleccionandoFecha('salida')}
                      className={`flex-1 p-4 rounded-lg border-2 transition-colors text-left
                        ${seleccionandoFecha === 'salida' ? 'border-primary-800 bg-primary-50' : 'border-gray-300'}`}
                    >
                      <div className="text-sm text-gray-600 mb-1">Salida</div>
                      <div className="text-lg font-bold">
                        {fechaSalida
                          ? new Date(fechaSalida + 'T00:00:00').toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Seleccionar fecha'}
                      </div>
                    </button>
                  </div>
                </div>
                <Calendario
                  fechaInicio={fechaEntrada}
                  fechaFin={fechaSalida}
                  onSeleccionFecha={manejarSeleccionFecha}
                />
              </div>

              {/* Habitaciones */}
              <div>
                <h3 className="text-2xl font-bold mb-4">Selecciona tu habitación</h3>
                <div className="space-y-4">
                  {habitaciones.map((hab) => {
                    const disponible = habitacionDisponible(hab.id);
                    const seleccionada = habitacionSeleccionada === hab.id;

                    return (
                      <button
                        key={hab.id}
                        onClick={() => disponible && setHabitacionSeleccionada(hab.id)}
                        disabled={!disponible}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all
                          ${seleccionada
                            ? 'border-primary-800 bg-primary-50'
                            : disponible
                            ? 'border-gray-300 hover:border-primary-400'
                            : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xl font-bold capitalize mb-1">{hab.tipo}</h4>
                            <p className="text-base text-gray-600 mb-2">Habitación {hab.numero}</p>
                            <p className="text-base text-gray-700 mb-2">{hab.descripcion}</p>
                            <div className="flex flex-wrap gap-2">
                              {hab.amenidades.slice(0, 3).map((amenidad, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm"
                                >
                                  {amenidad}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary-900">
                              ${hab.precioBase}
                            </div>
                            <div className="text-sm text-gray-600">por noche</div>
                            {!disponible && fechaEntrada && fechaSalida && (
                              <div className="mt-2 text-sm text-red-600 font-semibold">
                                No disponible
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Número de personas */}
                {habitacionSeleccionada && (
                  <div className="mt-6 p-4 bg-white rounded-lg border-2 border-gray-300">
                    <label className="label">Número de personas</label>
                    <select
                      value={numPersonas}
                      onChange={(e) => setNumPersonas(parseInt(e.target.value))}
                      className="input-field"
                    >
                      {habitacionSeleccionadaInfo &&
                        Array.from({ length: habitacionSeleccionadaInfo.capacidad }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'persona' : 'personas'}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button onClick={avanzarPaso} className="btn-primary flex items-center space-x-2">
                <span>Continuar</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: Datos del huésped */}
        {paso === 2 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-primary-900 mb-6">
              Paso 2: Completa tus datos
            </h2>

            <div className="card space-y-6">
              <div>
                <label className="label">
                  Nombre completo <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={datosHuesped.nombreCompleto}
                  onChange={(e) =>
                    setDatosHuesped({ ...datosHuesped, nombreCompleto: e.target.value })
                  }
                  className="input-field"
                  placeholder="Ingresa tu nombre completo"
                />
              </div>

              <div>
                <label className="label">
                  Correo electrónico <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={datosHuesped.correoElectronico}
                  onChange={(e) =>
                    setDatosHuesped({ ...datosHuesped, correoElectronico: e.target.value })
                  }
                  className="input-field"
                  placeholder="ejemplo@correo.com"
                />
                <p className="text-base text-gray-600 mt-2">
                  Recibirás la confirmación de tu reserva en este correo
                </p>
              </div>

              <div>
                <label className="label">
                  Teléfono <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  value={datosHuesped.telefono}
                  onChange={(e) =>
                    setDatosHuesped({ ...datosHuesped, telefono: e.target.value })
                  }
                  className="input-field"
                  placeholder="+503 XXXX-XXXX"
                />
              </div>

              <div>
                <label className="label">Notas adicionales (opcional)</label>
                <textarea
                  value={datosHuesped.notas}
                  onChange={(e) =>
                    setDatosHuesped({ ...datosHuesped, notas: e.target.value })
                  }
                  className="input-field"
                  rows={4}
                  placeholder="¿Algún requerimiento especial?"
                />
              </div>

              <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-4">
                <p className="text-base text-gray-700">
                  ☑️ Acepto los términos y condiciones del servicio
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={retrocederPaso} className="btn-outline flex items-center space-x-2">
                <ArrowLeft className="w-6 h-6" />
                <span>Volver</span>
              </button>
              <button onClick={avanzarPaso} className="btn-primary flex items-center space-x-2">
                <span>Continuar</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: Confirmación */}
        {paso === 3 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-primary-900 mb-6">
              Paso 3: Confirma tu reserva
            </h2>

            <div className="card space-y-6">
              <div className="bg-gold-50 border-2 border-gold-500 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gold-900 mb-4">Resumen de tu reserva</h3>
                
                <div className="space-y-3 text-lg">
                  <div className="flex justify-between">
                    <span className="font-semibold">Habitación:</span>
                    <span className="capitalize">{habitacionSeleccionadaInfo?.tipo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Número:</span>
                    <span>{habitacionSeleccionadaInfo?.numero}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Entrada:</span>
                    <span>
                      {fechaEntrada &&
                        new Date(fechaEntrada + 'T00:00:00').toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Salida:</span>
                    <span>
                      {fechaSalida &&
                        new Date(fechaSalida + 'T00:00:00').toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Noches:</span>
                    <span>{obtenerNumNoches()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Personas:</span>
                    <span>{numPersonas}</span>
                  </div>
                  <div className="border-t-2 border-gold-300 pt-3 mt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-bold">Total:</span>
                      <span className="text-3xl font-bold text-gold-900">
                        ${obtenerPrecioTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-xl font-bold mb-4">Tus datos:</h4>
                <div className="space-y-2 text-lg">
                  <p><strong>Nombre:</strong> {datosHuesped.nombreCompleto}</p>
                  <p><strong>Email:</strong> {datosHuesped.correoElectronico}</p>
                  <p><strong>Teléfono:</strong> {datosHuesped.telefono}</p>
                  {datosHuesped.notas && (
                    <p><strong>Notas:</strong> {datosHuesped.notas}</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <p className="text-base text-gray-700">
                  ✓ Recibirás un correo de confirmación inmediatamente<br />
                  ✓ También enviaremos un SMS con los detalles de tu reserva<br />
                  ✓ El pago se realizará al momento del check-in<br />
                  ✓ Cancelación gratuita hasta 24 horas antes
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={retrocederPaso} className="btn-outline flex items-center space-x-2">
                <ArrowLeft className="w-6 h-6" />
                <span>Volver</span>
              </button>
              <button
                onClick={confirmarReserva}
                disabled={procesando}
                className="btn-secondary flex items-center space-x-2"
              >
                {procesando ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>Confirmar Reserva</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
