'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram, Star, Shield, Clock, Settings } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-950 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de contacto */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gold-400">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-6 h-6 text-gold-400 flex-shrink-0 mt-1" />
                <p className="text-lg">
                  2 Avenida Norte y 9 Calle Oriente #46<br />
                  Izalco, Sonsonate, El Salvador
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-6 h-6 text-gold-400 flex-shrink-0" />
                <a href="tel:+50370969464" className="text-lg hover:text-gold-400 transition-colors">+503 7096-9464</a>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-gold-400 flex-shrink-0" />
                <p className="text-lg">Horario: 10:00 - 23:00</p>
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gold-400">Horarios</h3>
            <div className="space-y-2 text-lg">
              <p><strong>Check-in:</strong> 14:00 - 22:00</p>
              <p><strong>Check-out:</strong> 07:00 - 12:00</p>
              <p><strong>Recepcion:</strong> 24 horas</p>
              <p className="text-gold-300 mt-4">
                Sistema de reservas disponible 24/7/365
              </p>
            </div>
          </div>

          {/* Redes sociales */}
          <div className="flex flex-col h-full">
            <h3 className="text-xl font-bold mb-4 text-gold-400">Siguenos</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/LaPosadaDeDonTito/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-primary-800 hover:bg-gold-500 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://www.instagram.com/laposadadedontito/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-primary-800 hover:bg-gold-500 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
            <div className="mt-6 text-lg">
              <p className="flex items-center gap-2">
                <strong className="text-gold-400">91%</strong> de satisfaccion
              </p>
              <p className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                ))}
                <span className="ml-1 text-sm text-gray-400">Calificacion promedio</span>
              </p>
            </div>
            <div className="mt-auto pt-4 flex justify-end">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm text-gray-300"
              >
                <Settings className="w-4 h-4" />
                Panel Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-800 mt-8 pt-6 text-center">
          <p className="text-base text-gray-400">
            © {currentYear} Hostal Don Tito. Todos los derechos reservados.
          </p>
          <p className="text-base text-gray-400 mt-2 flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Conexion segura SSL
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              Confirmacion por Email
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Soporte 24/7
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
