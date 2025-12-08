'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Star,
  MapPin,
  Wifi,
  Wind,
  Tv,
  Check,
  ArrowRight,
  Calendar,
  Users,
  Shield,
  Clock,
  Phone,
  ChevronLeft,
  ChevronRight,
  Quote,
  Sparkles,
  Heart,
  Mountain,
  TreePine,
  Building
} from 'lucide-react';
import { getHabitacionesSupabase } from '@/lib/supabase-data';
import type { Habitacion } from '@/types';

const testimonios = [
  {
    id: 1,
    nombre: 'María Elena',
    origen: 'San Salvador',
    texto: 'Excelente atención y muy limpio. El personal es muy amable y las habitaciones son cómodas.',
    rating: 5,
  },
  {
    id: 2,
    nombre: 'Carlos Mendoza',
    origen: 'Guatemala',
    texto: 'Increíble relación calidad-precio. La ubicación es perfecta para conocer Izalco.',
    rating: 5,
  },
  {
    id: 3,
    nombre: 'Ana Patricia',
    origen: 'Honduras',
    texto: 'Me sentí como en casa. Don Tito y su familia son muy hospitalarios.',
    rating: 5,
  },
];

const caracteristicas = [
  { icon: Wifi, titulo: 'WiFi Gratis', descripcion: 'Todas las areas', color: 'from-blue-500 to-blue-600' },
  { icon: Wind, titulo: 'Aire Acond.', descripcion: 'Clima perfecto', color: 'from-cyan-500 to-cyan-600' },
  { icon: Tv, titulo: 'TV Cable', descripcion: 'Entretenimiento', color: 'from-purple-500 to-purple-600' },
  { icon: Users, titulo: 'Descuentos', descripcion: 'Grupos familiares', color: 'from-amber-500 to-amber-600' },
  { icon: Shield, titulo: 'Parqueo', descripcion: 'Estacionamiento', color: 'from-green-500 to-green-600' },
  { icon: Clock, titulo: '10:00-23:00', descripcion: 'Todos los dias', color: 'from-rose-500 to-rose-600' },
];

const lugaresCercanos = [
  { nombre: 'Volcán de Izalco', distancia: '15 min', icon: Mountain },
  { nombre: 'Parque Central', distancia: '5 min', icon: TreePine },
  { nombre: 'Iglesia de Izalco', distancia: '3 min', icon: Building },
];

export default function HomePage() {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [testimonioActual, setTestimonioActual] = useState(0);

  useEffect(() => {
    const cargarHabitaciones = async () => {
      try {
        const habs = await getHabitacionesSupabase();
        setHabitaciones(habs);
      } catch (error) {
        console.error('Error cargando habitaciones:', error);
      }
    };
    cargarHabitaciones();

    const interval = setInterval(() => {
      setTestimonioActual((prev) => (prev + 1) % testimonios.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-48 h-48 md:w-72 md:h-72 bg-gold-400/25 rounded-full filter blur-[80px]"></div>
            <div className="absolute bottom-20 right-10 w-48 h-48 md:w-72 md:h-72 bg-primary-400/25 rounded-full filter blur-[80px]"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 py-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-8 border border-white/20">
              <Sparkles className="w-5 h-5 text-gold-400" />
              <span className="text-white/90 text-base">Tu mejor opcion en Izalco</span>
            </div>

            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white shadow-xl p-2">
                <Image
                  src="/logo-tito.png"
                  alt="Hostal Don Tito"
                  width={160}
                  height={160}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Hostal <span className="text-gold-400">Don Tito</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-6">Tu hogar lejos de casa</p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-gold-400 text-gold-400" />
                ))}
                <span className="text-white text-base ml-2">91%</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="w-5 h-5 text-gold-400" />
                <span className="text-base">Izalco, Sonsonate</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
              <Link
                href="/reservar"
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-bold py-4 px-8 rounded-xl text-lg"
              >
                <Calendar className="w-6 h-6" />
                <span>Reservar Ahora</span>
              </Link>
              <Link
                href="/calendario"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl text-lg border border-white/30"
              >
                <span>Ver Disponibilidad</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-gold-400">{habitaciones.length || 4}</div>
                <div className="text-white/80 text-sm">Habitaciones</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-gold-400">24/7</div>
                <div className="text-white/80 text-sm">Atencion</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-gold-400">
                  ${habitaciones.length > 0 ? Math.min(...habitaciones.map(h => h.precioBase)) : 15}
                </div>
                <div className="text-white/80 text-sm">Desde/noche</div>
              </div>
            </div>
          </div>
        </section>

        {/* Características */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block bg-primary-100 text-primary-800 px-4 py-1.5 rounded-full text-base font-semibold mb-3">
                COMODIDADES
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Todo lo que necesitas</h2>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-4">
              {caracteristicas.map((car, index) => (
                <div key={index} className="bg-white rounded-xl p-3 md:p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow text-center">
                  <div className={`w-10 h-10 md:w-11 md:h-11 rounded-lg bg-gradient-to-br ${car.color} flex items-center justify-center mb-2 mx-auto`}>
                    <car.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-xs md:text-sm leading-tight">{car.titulo}</h3>
                  <p className="text-xs text-gray-500 leading-tight mt-0.5">{car.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Habitaciones */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block bg-gold-100 text-gold-800 px-4 py-1.5 rounded-full text-base font-semibold mb-3">
                HABITACIONES
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Escoge tu espacio ideal</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {habitaciones.map((hab) => (
                <div key={hab.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col hover:shadow-xl transition-shadow">
                  <div className="relative h-48 bg-gradient-to-br from-primary-600 to-primary-800">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-7xl font-bold text-white/20">{hab.numero}</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">{hab.capacidad}</span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-gold-500 text-white px-4 py-1.5 rounded-full text-sm font-bold capitalize">
                        {hab.tipo}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-gray-600 text-base mb-4 line-clamp-2">{hab.descripcion}</p>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {hab.amenidades.slice(0, 4).map((amenidad, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-600 truncate">{amenidad}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div>
                        <span className="text-xs text-gray-500">Desde</span>
                        <div className="text-2xl font-bold text-primary-900">${hab.precioBase}<span className="text-sm text-gray-500">/noche</span></div>
                      </div>
                      <Link
                        href="/reservar"
                        className="bg-primary-900 hover:bg-primary-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                      >
                        Reservar
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section className="py-12 bg-primary-900 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-8">
              <span className="inline-block bg-white/10 text-white px-3 py-1 rounded-full text-sm font-semibold mb-2">
                TESTIMONIOS
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Lo que dicen nuestros huéspedes</h2>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                <Quote className="w-8 h-8 text-gold-400/30 mb-3" />
                <div className="flex justify-center mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="text-white text-center mb-4 italic">
                  &ldquo;{testimonios[testimonioActual].texto}&rdquo;
                </p>
                <div className="text-center">
                  <p className="font-semibold text-white">{testimonios[testimonioActual].nombre}</p>
                  <p className="text-white/60 text-sm">{testimonios[testimonioActual].origen}</p>
                </div>

                <div className="flex justify-center items-center gap-3 mt-4">
                  <button
                    onClick={() => setTestimonioActual((prev) => (prev - 1 + testimonios.length) % testimonios.length)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <div className="flex gap-1">
                    {testimonios.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setTestimonioActual(index)}
                        className={`w-2 h-2 rounded-full ${index === testimonioActual ? 'bg-gold-400' : 'bg-white/30'}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setTestimonioActual((prev) => (prev + 1) % testimonios.length)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Por qué elegirnos */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                  POR QUÉ ELEGIRNOS
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Más que un hostal, <span className="text-primary-600">una experiencia</span>
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-gold-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Atención Personalizada</h3>
                      <p className="text-sm text-gray-600">Nos preocupamos por cada detalle de tu estadía.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Ubicación Privilegiada</h3>
                      <p className="text-sm text-gray-600">En el corazón de Izalco, cerca de volcanes y playas.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Seguridad Garantizada</h3>
                      <p className="text-sm text-gray-600">Tu tranquilidad es nuestra prioridad, las 24 horas.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-gold-50 rounded-2xl p-5 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Lugares Cercanos</h3>
                <div className="space-y-3">
                  {lugaresCercanos.map((lugar, index) => (
                    <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center">
                          <lugar.icon className="w-4 h-4 text-primary-600" />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{lugar.nombre}</span>
                      </div>
                      <span className="bg-gold-100 text-gold-800 px-2 py-0.5 rounded-full text-xs">
                        {lugar.distancia}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 p-4 bg-primary-900 rounded-xl text-white">
                  <h4 className="font-bold text-sm mb-2">Contáctanos</h4>
                  <div className="space-y-1">
                    <a href="tel:+50370969464" className="flex items-center gap-2 text-gold-400 hover:text-gold-300 text-sm">
                      <Phone className="w-4 h-4" />
                      <span>+503 7096-9464</span>
                    </a>
                    <p className="flex items-center gap-2 text-white/80 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>2 Av. Norte y 9 Calle Oriente #46, Izalco</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nosotros */}
        <section id="nosotros" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <span className="inline-block bg-gold-100 text-gold-800 px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
                NOSOTROS
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Conoce La Posada de Don Tito</h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-primary-900 mb-4">Nuestra Historia</h3>
                    <p className="text-gray-600 mb-4">
                      La Posada de Don Tito es un acogedor hostal ubicado en el corazon de Izalco, Sonsonate.
                      Ofrecemos alojamiento comodo y accesible para viajeros, familias y grupos que desean
                      explorar la riqueza cultural y natural de la zona occidental de El Salvador.
                    </p>
                    <p className="text-gray-600">
                      Con mas de 200 clientes atendidos mensualmente, nos hemos convertido en una opcion
                      confiable para quienes buscan hospitalidad salvadorena autentica.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-900 mb-4">Informacion</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900">Direccion</p>
                          <p className="text-sm text-gray-600">2 Avenida Norte y 9 Calle Oriente #46, Izalco, Sonsonate</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900">Telefono</p>
                          <a href="tel:+50370969464" className="text-sm text-primary-600 hover:underline">+503 7096-9464</a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900">Horario de Atencion</p>
                          <p className="text-sm text-gray-600">Todos los dias: 10:00 AM - 11:00 PM</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900">Gerente</p>
                          <p className="text-sm text-gray-600">Leila Zulema Velasquez</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-12 bg-gradient-to-r from-gold-500 to-amber-500">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Reserva 100% online</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              ¿Listo para tu próxima aventura?
            </h2>
            <p className="text-white/90 mb-6 max-w-lg mx-auto">
              Reserva ahora y vive la experiencia Hostal Don Tito.
            </p>

            <Link
              href="/reservar"
              className="inline-flex items-center gap-2 bg-white text-gold-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-xl shadow-lg"
            >
              <Calendar className="w-5 h-5" />
              <span>Reservar Ahora</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-white/90 text-sm">
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Confirmación inmediata</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Cancelación flexible</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
