'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, CalendarDays, Search, User, LogIn } from 'lucide-react';
import { verificarSesionHuespedSupabase } from '@/lib/supabase-data';
import type { CuentaHuesped } from '@/lib/supabase-data';

export default function Header() {
  const [cuenta, setCuenta] = useState<CuentaHuesped | null>(null);

  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem('huesped_token');
      if (token) {
        try {
          const cuentaData = await verificarSesionHuespedSupabase(token);
          setCuenta(cuentaData);
        } catch (error) {
          console.error('Error verificando sesión:', error);
        }
      }
    };
    verificarSesion();
  }, []);

  return (
    <header className="bg-primary-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo y nombre */}
          <Link href="/" className="flex items-center space-x-2 md:space-x-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden bg-white flex-shrink-0">
              <Image
                src="/logo-tito.png"
                alt="Hostal Don Tito Logo"
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold leading-tight">HOSTAL DON TITO</h1>
              <p className="text-xs text-gold-300">Izalco, Sonsonate</p>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              href="/"
              className="flex items-center space-x-2 px-3 py-2 hover:bg-primary-800 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">Inicio</span>
            </Link>
            <Link
              href="/calendario"
              className="flex items-center space-x-2 px-3 py-2 hover:bg-primary-800 rounded-lg transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              <span className="text-sm">Disponibilidad</span>
            </Link>
            <Link
              href="/consultar-reserva"
              className="flex items-center space-x-2 px-3 py-2 hover:bg-primary-800 rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Mi Reserva</span>
            </Link>

            {/* Botón de cuenta o login */}
            {cuenta ? (
              <Link
                href="/cuenta/mis-reservas"
                className="flex items-center space-x-2 px-3 py-2 hover:bg-primary-800 rounded-lg transition-colors"
              >
                <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center text-xs font-bold text-primary-900">
                  {cuenta.nombre.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm">Mi Cuenta</span>
              </Link>
            ) : (
              <Link
                href="/cuenta/login"
                className="flex items-center space-x-2 px-3 py-2 hover:bg-primary-800 rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm">Ingresar</span>
              </Link>
            )}
          </nav>

          {/* Navegación Tablet y Móvil */}
          <div className="flex lg:hidden items-center space-x-2">
            <Link
              href="/"
              className="p-2 hover:bg-primary-800 rounded-lg transition-colors"
              title="Inicio"
            >
              <Home className="w-5 h-5" />
            </Link>
            <Link
              href="/calendario"
              className="p-2 hover:bg-primary-800 rounded-lg transition-colors hidden sm:flex"
              title="Disponibilidad"
            >
              <CalendarDays className="w-5 h-5" />
            </Link>
            {/* Botón de cuenta o login móvil */}
            {cuenta ? (
              <Link
                href="/cuenta/mis-reservas"
                className="p-2 hover:bg-primary-800 rounded-lg transition-colors"
                title="Mi Cuenta"
              >
                <div className="w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center text-xs font-bold text-primary-900">
                  {cuenta.nombre.charAt(0).toUpperCase()}
                </div>
              </Link>
            ) : (
              <Link
                href="/cuenta/login"
                className="p-2 hover:bg-primary-800 rounded-lg transition-colors"
                title="Ingresar"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
