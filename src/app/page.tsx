'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Star, MapPin, Wifi, Wind, Tv, Coffee, Check, ArrowRight } from 'lucide-react';
import { getHabitaciones } from '@/lib/data';
import type { Habitacion } from '@/types';

export default function HomePage() {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);

  useEffect(() => {
    setHabitaciones(getHabitaciones());
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Bienvenido a Hostal Don Tito
              </h2>
              <p className="text-xl md:text-2xl mb-4 text-gray-100">
                Tu hogar en Izalco - Experiencia auténtica y confortable
              </p>
              <div className="flex items-center justify-center space-x-2 mb-8">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-6 h-6 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <span className="text-xl font-semibold">91% Satisfacción</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 text-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-6 h-6 text-gold-400" />
                  <span>Izalco, Sonsonate</span>
                </div>
                <div className="hidden sm:block text-gold-400">|</div>
                <div className="flex items-center space-x-2">
                  <span>📞 Teléfono: +503 XXXX-XXXX</span>
                </div>
              </div>
              <Link
                href="/reservar"
                className="inline-flex items-center space-x-2 mt-8 bg-gold-500 hover:bg-gold-600 text-white font-bold py-4 px-8 rounded-lg transition-colors text-xl"
              >
                <span>Reservar Ahora</span>
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </section>

        {/* Características principales */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wifi className="w-8 h-8 text-primary-800" />
                </div>
                <h3 className="text-xl font-bold mb-2">WiFi Gratis</h3>
                <p className="text-base text-gray-600">Internet de alta velocidad en todas las áreas</p>
              </div>
              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wind className="w-8 h-8 text-primary-800" />
                </div>
                <h3 className="text-xl font-bold mb-2">Aire Acondicionado</h3>
                <p className="text-base text-gray-600">Climatización en todas las habitaciones</p>
              </div>
              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tv className="w-8 h-8 text-primary-800" />
                </div>
                <h3 className="text-xl font-bold mb-2">TV Cable</h3>
                <p className="text-base text-gray-600">Entretenimiento en tu habitación</p>
              </div>
              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coffee className="w-8 h-8 text-primary-800" />
                </div>
                <h3 className="text-xl font-bold mb-2">Áreas Comunes</h3>
                <p className="text-base text-gray-600">Espacios acogedores para relajarte</p>
              </div>
            </div>
          </div>
        </section>

        {/* Nuestras Habitaciones */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary-900">
              Nuestras Habitaciones
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {habitaciones.map((hab) => (
                <div key={hab.id} className="card hover:shadow-xl transition-shadow">
                  <div className="bg-gradient-to-br from-primary-100 to-primary-200 h-48 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-6xl font-bold text-primary-800">{hab.numero}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 capitalize">{hab.tipo}</h3>
                  <p className="text-base text-gray-600 mb-4">{hab.descripcion}</p>
                  <div className="space-y-2 mb-4">
                    {hab.amenidades.slice(0, 3).map((amenidad, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-base">{amenidad}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-base text-gray-600">Desde</span>
                      <div>
                        <span className="text-3xl font-bold text-primary-900">${hab.precioBase}</span>
                        <span className="text-base text-gray-600">/noche</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/reservar"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>Ver Disponibilidad y Reservar</span>
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </section>

        {/* Por qué elegirnos */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary-900">
              ¿Por qué Elegir Hostal Don Tito?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="text-5xl mb-4">🏠</div>
                <h3 className="text-2xl font-bold mb-3">Ambiente Familiar</h3>
                <p className="text-lg text-gray-600">
                  Atención personalizada en un ambiente acogedor que te hará sentir como en casa.
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">📍</div>
                <h3 className="text-2xl font-bold mb-3">Ubicación Estratégica</h3>
                <p className="text-lg text-gray-600">
                  En el corazón de Izalco, cerca de los principales atractivos turísticos de Sonsonate.
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-2xl font-bold mb-3">Mejor Precio</h3>
                <p className="text-lg text-gray-600">
                  Tarifas competitivas con excelente relación calidad-precio para tu estadía.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Llamado a la acción */}
        <section className="py-16 bg-gradient-to-r from-gold-500 to-gold-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Listo para tu próxima aventura?
            </h2>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
              Reserva ahora y asegura tu habitación en Hostal Don Tito. Sistema de reservas disponible 24/7.
            </p>
            <Link
              href="/reservar"
              className="inline-flex items-center space-x-2 bg-white text-gold-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-colors text-xl"
            >
              <Calendar className="w-6 h-6" />
              <span>Reservar Mi Habitación</span>
            </Link>
            <p className="mt-6 text-lg">
              ✓ Confirmación inmediata | ✓ Sin tarjeta de crédito | ✓ Cancelación flexible
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
