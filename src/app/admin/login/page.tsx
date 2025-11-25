'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, AlertCircle, Home } from 'lucide-react';
import { autenticarUsuario, iniciarSesion } from '@/lib/data';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcesando(true);

    try {
      // Simular delay de autenticación
      await new Promise(resolve => setTimeout(resolve, 1000));

      const usuario = autenticarUsuario(email, password);
      
      if (usuario) {
        iniciarSesion(usuario);
        router.push('/admin/dashboard');
      } else {
        setError('Credenciales incorrectas. Por favor, verifica tu email y contraseña.');
      }
    } catch (err) {
      setError('Hubo un error al iniciar sesión. Por favor, intenta nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl font-bold text-white">DT</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">HOSTAL DON TITO</h1>
          <p className="text-xl text-gold-300">Panel Administrativo</p>
        </div>

        {/* Formulario de login */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-6 text-center">
            Iniciar Sesión
          </h2>

          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <p className="text-base text-red-800">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={manejarLogin} className="space-y-6">
            <div>
              <label className="label">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@hostaldontico.com"
                required
              />
            </div>

            <div>
              <label className="label">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={procesando}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {procesando ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-6 h-6" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>

          {/* Información de demo */}
          <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <p className="text-base text-gray-700 font-semibold mb-2">
              🔐 Credenciales de prueba:
            </p>
            <p className="text-base text-gray-700">
              <strong>Email:</strong> admin@hostaldontico.com<br />
              <strong>Contraseña:</strong> admin123
            </p>
          </div>
        </div>

        {/* Volver al inicio */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-white hover:text-gold-300 transition-colors text-lg"
          >
            <Home className="w-6 h-6" />
            <span>Volver al sitio principal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
