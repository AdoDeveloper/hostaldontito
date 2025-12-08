'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Save, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { verificarTokenRecuperacionSupabase, restablecerPasswordHuespedSupabase } from '@/lib/supabase-data';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function RestablecerPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    const verificarToken = async () => {
      if (!token || !isSupabaseConfigured()) {
        setTokenValido(false);
        setVerificando(false);
        return;
      }

      try {
        const cuentaId = await verificarTokenRecuperacionSupabase(token);
        setTokenValido(!!cuentaId);
      } catch (err) {
        console.error('Error verificando token:', err);
        setTokenValido(false);
      } finally {
        setVerificando(false);
      }
    };

    verificarToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);

    try {
      const resultado = await restablecerPasswordHuespedSupabase(token, password);

      if (resultado) {
        setExito(true);
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/cuenta/login');
        }, 3000);
      } else {
        setError('El enlace ha expirado o ya fue utilizado');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al restablecer la contraseña. Por favor intente de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  // Pantalla de carga mientras se verifica el token
  if (verificando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  // Pantalla de error si el token es inválido
  if (!tokenValido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Enlace inválido</h1>
            <p className="text-gray-600 mb-6">
              Este enlace de recuperación ha expirado o ya fue utilizado.
            </p>
            <Link
              href="/cuenta/recuperar"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
            >
              Solicitar nuevo enlace
            </Link>
            <div className="mt-4">
              <Link
                href="/cuenta/login"
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                ← Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xl mb-4">
              <Image
                src="/logo-tito.png"
                alt="Hostal Don Tito"
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Nueva contraseña</h1>
          <p className="text-gray-300">Ingresa tu nueva contraseña</p>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {exito ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Contraseña actualizada!
              </h2>
              <p className="text-gray-600 mb-6">
                Tu contraseña ha sido restablecida correctamente. Serás redirigido al inicio de sesión...
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirigiendo...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label htmlFor="confirmarPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    id="confirmarPassword"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="••••••••"
                  />
                  {confirmarPassword && password === confirmarPassword && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar nueva contraseña
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Volver al inicio */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
