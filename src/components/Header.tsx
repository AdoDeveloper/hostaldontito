'use client';

import Link from 'next/link';
import { Home, Calendar, User, LogIn } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-primary-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo y nombre */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <div className="w-12 h-12 bg-gold-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">DT</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">HOSTAL DON TITO</h1>
              <p className="text-sm text-gold-300">Izalco, Sonsonate</p>
            </div>
          </Link>

          {/* Navegación */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className="flex items-center space-x-2 px-4 py-2 hover:bg-primary-800 rounded-lg transition-colors min-h-[44px]"
            >
              <Home className="w-5 h-5" />
              <span className="text-lg">Inicio</span>
            </Link>
            <Link
              href="/reservar"
              className="flex items-center space-x-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 rounded-lg transition-colors font-semibold min-h-[44px]"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-lg">Reservar</span>
            </Link>
            <Link
              href="/admin/login"
              className="flex items-center space-x-2 px-4 py-2 hover:bg-primary-800 rounded-lg transition-colors min-h-[44px]"
            >
              <LogIn className="w-5 h-5" />
              <span className="text-lg">Admin</span>
            </Link>
          </nav>

          {/* Navegación móvil */}
          <div className="flex md:hidden space-x-1">
            <Link
              href="/"
              className="p-3 hover:bg-primary-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Home className="w-6 h-6" />
            </Link>
            <Link
              href="/reservar"
              className="p-3 bg-gold-500 hover:bg-gold-600 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Calendar className="w-6 h-6" />
            </Link>
            <Link
              href="/admin/login"
              className="p-3 hover:bg-primary-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <User className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
