import { NextRequest, NextResponse } from 'next/server';
import { enviarEmailRecuperacion } from '@/lib/email';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Servicio no disponible' },
        { status: 503 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Buscar cuenta y crear token
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tokenData, error: tokenError } = await (supabase.rpc as any)(
      'crear_token_recuperacion',
      { p_email: email }
    );

    if (tokenError) {
      console.error('Error creando token:', tokenError);
      // No revelar si el email existe o no
      return NextResponse.json({ success: true });
    }

    if (!tokenData) {
      // Email no encontrado, pero no lo revelamos
      return NextResponse.json({ success: true });
    }

    // Obtener nombre del huésped
    const { data: cuenta } = await supabase
      .from('cuentas_huespedes')
      .select('huespedes(nombre_completo)')
      .eq('email', email)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nombre = (cuenta as any)?.huespedes?.nombre_completo || 'Huésped';

    // Enviar email
    const resultado = await enviarEmailRecuperacion(email, nombre, tokenData);

    if (!resultado.success) {
      console.error('Error enviando email:', resultado.error);
      return NextResponse.json(
        { error: 'Error al enviar el correo' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en API recuperar:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
