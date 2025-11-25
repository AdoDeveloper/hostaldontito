'use client';

import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
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
                  Casco urbano, Izalco<br />
                  Sonsonate, El Salvador
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-6 h-6 text-gold-400 flex-shrink-0" />
                <p className="text-lg">+503 XXXX-XXXX</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-6 h-6 text-gold-400 flex-shrink-0" />
                <p className="text-lg">info@hostaldontico.com</p>
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gold-400">Horarios</h3>
            <div className="space-y-2 text-lg">
              <p><strong>Check-in:</strong> 14:00 - 22:00</p>
              <p><strong>Check-out:</strong> 07:00 - 12:00</p>
              <p><strong>Recepción:</strong> 24 horas</p>
              <p className="text-gold-300 mt-4">
                Sistema de reservas disponible 24/7/365
              </p>
            </div>
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gold-400">Síguenos</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-12 h-12 bg-primary-800 hover:bg-gold-500 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-primary-800 hover:bg-gold-500 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
            <p className="mt-6 text-lg">
              <strong className="text-gold-400">91%</strong> de satisfacción<br />
              ⭐⭐⭐⭐⭐ Calificación promedio
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-800 mt-8 pt-6 text-center">
          <p className="text-base text-gray-400">
            © 2024 Hostal Don Tito. Todos los derechos reservados.
          </p>
          <p className="text-base text-gray-400 mt-2">
            🔒 Conexión segura SSL | 📧 Confirmación por Email y SMS | 📞 Soporte 24/7
          </p>
        </div>
      </div>
    </footer>
  );
}
