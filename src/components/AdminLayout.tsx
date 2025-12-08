'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LogOut,
  Home,
  Calendar,
  Users,
  BedDouble,
  BarChart3,
  Menu,
  X,
  UserCog,
} from 'lucide-react';
import { verificarSesion, cerrarSesion } from '@/lib/data';
import { verificarTokenSupabase, cerrarSesionTokenSupabase } from '@/lib/supabase-data';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { Usuario } from '@/types';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/reservas', label: 'Reservas', icon: Calendar },
  { href: '/admin/habitaciones', label: 'Habitaciones', icon: BedDouble },
  { href: '/admin/huespedes', label: 'Huéspedes', icon: Users },
  { href: '/admin/usuarios', label: 'Usuarios', icon: UserCog },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const verificarUsuario = async () => {
      // Intentar verificar sesión con Supabase primero
      if (isSupabaseConfigured()) {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const usuarioSupabase = await verificarTokenSupabase(token);
          if (usuarioSupabase) {
            setUsuario(usuarioSupabase);
            setCargando(false);
            return;
          }
          // Token inválido, limpiar
          localStorage.removeItem('auth_token');
          localStorage.removeItem('usuario');
        }
      }

      // Fallback a sesión local
      const user = verificarSesion();
      if (!user) {
        router.push('/admin/login');
        return;
      }
      setUsuario(user);
      setCargando(false);
    };

    verificarUsuario();
  }, [router]);

  const manejarCerrarSesion = async () => {
    // Cerrar sesión en Supabase si hay token
    const token = localStorage.getItem('auth_token');
    if (token && isSupabaseConfigured()) {
      await cerrarSesionTokenSupabase(token);
    }
    // Limpiar localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('usuario');
    // Cerrar sesión local
    cerrarSesion();
    router.push('/admin/login');
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-800 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Principal */}
      <header className="bg-gradient-to-r from-primary-950 to-primary-900 text-white shadow-xl sticky top-0 z-40">
        {/* Barra superior con logo y usuario */}
        <div className="border-b border-primary-800/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              {/* Logo y título */}
              <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <Image
                    src="/logo-tito.png"
                    alt="Hostal Don Tito"
                    width={32}
                    height={32}
                    className="object-contain rounded-md"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold tracking-tight">Hostal Don Tito</h1>
                  <p className="text-xs text-gold-400 font-medium">Panel Administrativo</p>
                </div>
              </Link>

              {/* Acciones del usuario */}
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-primary-800/50 rounded-lg transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span>Ver sitio</span>
                </Link>

                <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-primary-700">
                  <div className="text-right">
                    <p className="text-sm font-semibold">{usuario.nombre}</p>
                    <p className="text-xs text-gold-400 capitalize">{usuario.rol}</p>
                  </div>
                  <div className="w-9 h-9 bg-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
                    {usuario.nombre.charAt(0).toUpperCase()}
                  </div>
                </div>

                <button
                  onClick={manejarCerrarSesion}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors text-sm font-medium shadow-sm"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación principal */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Botón menú móvil */}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="lg:hidden flex items-center gap-2 py-3 text-gray-300 hover:text-white transition-colors"
            >
              {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span className="text-sm font-medium">Menú</span>
            </button>

            {/* Navegación desktop */}
            <nav className="hidden lg:flex items-center">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href ||
                  (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                      isActive
                        ? 'border-gold-400 text-white bg-primary-800/30'
                        : 'border-transparent text-gray-300 hover:text-white hover:bg-primary-800/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Espacio para equilibrar en desktop */}
            <div className="hidden lg:block"></div>
          </div>
        </div>
      </header>

      {/* Menú móvil */}
      {menuAbierto && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={() => setMenuAbierto(false)}>
          <nav
            className="absolute top-[7.5rem] left-0 right-0 bg-primary-900 shadow-2xl border-t border-primary-700"
            onClick={(e) => e.stopPropagation()}
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href ||
                (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuAbierto(false)}
                  className={`flex items-center gap-3 px-6 py-4 border-b border-primary-800 ${
                    isActive
                      ? 'bg-primary-800 text-white border-l-4 border-l-gold-400'
                      : 'text-gray-300 hover:bg-primary-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            <Link
              href="/"
              onClick={() => setMenuAbierto(false)}
              className="flex items-center gap-3 px-6 py-4 text-gray-400 hover:bg-primary-800 hover:text-white"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Ver sitio principal</span>
            </Link>
          </nav>
        </div>
      )}

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
