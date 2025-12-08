import { NextRequest, NextResponse } from 'next/server';
import { enviarEmailConfirmacionReserva } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, nombre, codigoReserva, habitacion, fechaEntrada, fechaSalida, precioTotal } = await request.json();

    if (!email || !nombre || !codigoReserva) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    const resultado = await enviarEmailConfirmacionReserva(
      email,
      nombre,
      codigoReserva,
      habitacion,
      fechaEntrada,
      fechaSalida,
      precioTotal
    );

    if (!resultado.success) {
      console.error('Error enviando email de confirmación:', resultado.error);
      return NextResponse.json(
        { error: 'Error al enviar el correo' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en API confirmación email:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
