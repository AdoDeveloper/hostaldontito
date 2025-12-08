import nodemailer from 'nodemailer';

// Configuracion SMTP de Gmail
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true para puerto 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface EmailResult {
  success: boolean;
  error?: string;
}

export async function enviarEmailRecuperacion(
  email: string,
  nombre: string,
  token: string
): Promise<EmailResult> {
  try {
    const resetUrl = `${APP_URL}/cuenta/restablecer/${token}`;

    await transporter.sendMail({
      from: `"Hostal Don Tito" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Recuperar contraseña - Hostal Don Tito',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Hostal Don Tito</h1>
            <p style="color: #d4af37; margin: 10px 0 0 0; font-size: 14px;">Izalco, Sonsonate, El Salvador</p>
          </div>

          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #1e3a5f; margin-top: 0;">Hola ${nombre},</h2>

            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>

            <p>Haz clic en el siguiente boton para crear una nueva contraseña:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background: #d4af37; color: #1e3a5f; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Restablecer Contraseña
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              Este enlace expirara en <strong>1 hora</strong> por seguridad.
            </p>

            <p style="color: #666; font-size: 14px;">
              Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña seguira siendo la misma.
            </p>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; margin-bottom: 0;">
              Si el boton no funciona, copia y pega este enlace en tu navegador:<br>
              <a href="${resetUrl}" style="color: #2d5a87; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; border: 1px solid #e0e0e0; border-top: none;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Hostal Don Tito. Todos los derechos reservados.<br>
              2 Avenida Norte y 9 Calle Oriente #46, Izalco, Sonsonate, El Salvador<br>
              Tel: +503 7096-9464
            </p>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Error enviando email de recuperacion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar email'
    };
  }
}

export async function enviarEmailBienvenida(
  email: string,
  nombre: string
): Promise<EmailResult> {
  try {
    await transporter.sendMail({
      from: `"Hostal Don Tito" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Bienvenido a Hostal Don Tito!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Hostal Don Tito</h1>
            <p style="color: #d4af37; margin: 10px 0 0 0; font-size: 14px;">Izalco, Sonsonate, El Salvador</p>
          </div>

          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #1e3a5f; margin-top: 0;">Bienvenido ${nombre}!</h2>

            <p>Gracias por registrarte en <strong>Hostal Don Tito</strong>. Ahora puedes:</p>

            <ul style="color: #555; padding-left: 20px;">
              <li>Hacer reservas mas rapido con tus datos guardados</li>
              <li>Ver el historial de todas tus reservas</li>
              <li>Gestionar tus proximas estancias</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}"
                 style="background: #d4af37; color: #1e3a5f; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Hacer una Reserva
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              Esperamos verte pronto en Izalco!
            </p>
          </div>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; border: 1px solid #e0e0e0; border-top: none;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Hostal Don Tito. Todos los derechos reservados.<br>
              2 Avenida Norte y 9 Calle Oriente #46, Izalco, Sonsonate, El Salvador<br>
              Tel: +503 7096-9464
            </p>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar email'
    };
  }
}

export async function enviarEmailConfirmacionReserva(
  email: string,
  nombre: string,
  codigoReserva: string,
  habitacion: string,
  fechaEntrada: string,
  fechaSalida: string,
  precioTotal: number
): Promise<EmailResult> {
  try {
    await transporter.sendMail({
      from: `"Hostal Don Tito" <${FROM_EMAIL}>`,
      to: email,
      subject: `Confirmacion de Reserva ${codigoReserva} - Hostal Don Tito`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Hostal Don Tito</h1>
            <p style="color: #d4af37; margin: 10px 0 0 0; font-size: 14px;">Izalco, Sonsonate, El Salvador</p>
          </div>

          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #1e3a5f; margin-top: 0;">Reserva Confirmada!</h2>

            <p>Hola <strong>${nombre}</strong>,</p>

            <p>Tu reserva ha sido confirmada. Aqui estan los detalles:</p>

            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Codigo de reserva:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #1e3a5f;">${codigoReserva}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Habitacion:</td>
                  <td style="padding: 8px 0;">${habitacion}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Entrada:</td>
                  <td style="padding: 8px 0;">${fechaEntrada}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Salida:</td>
                  <td style="padding: 8px 0;">${fechaSalida}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-top: 1px solid #e0e0e0; color: #666;">Total:</td>
                  <td style="padding: 8px 0; border-top: 1px solid #e0e0e0; font-weight: bold; color: #d4af37; font-size: 18px;">$${precioTotal.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/consultar-reserva"
                 style="background: #d4af37; color: #1e3a5f; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Consultar Mi Reserva
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

            <h3 style="color: #1e3a5f; margin-bottom: 10px;">Informacion importante:</h3>
            <ul style="color: #555; padding-left: 20px; margin: 0;">
              <li>Check-in: 14:00 - 22:00 hrs</li>
              <li>Check-out: 07:00 - 12:00 hrs</li>
              <li>Pago al momento del check-in (efectivo o tarjeta)</li>
              <li>Cancelacion gratuita hasta 24 horas antes</li>
            </ul>
          </div>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; border: 1px solid #e0e0e0; border-top: none;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Hostal Don Tito. Todos los derechos reservados.<br>
              2 Avenida Norte y 9 Calle Oriente #46, Izalco, Sonsonate, El Salvador<br>
              Tel: +503 7096-9464
            </p>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Error enviando email de confirmacion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar email'
    };
  }
}
