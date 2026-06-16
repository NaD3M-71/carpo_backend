import { mailer } from '../config/mailer';

interface SendResetPasswordMailParams {
  to: string;
  resetLink: string;
}

export const sendResetPasswordMail = async ({
  to,
  resetLink,
}: SendResetPasswordMailParams) => {
  console.log('Intentando enviar mail a:', to);
  await mailer.sendMail({
    from: `"Círculo de Arqueros de la Región Patagónia Oeste" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Recuperación de contraseña',
    html: `
      <div style="background-color:#f4f6f8; padding:20px; font-family:Arial, Helvetica, sans-serif;">
        <div style="
          max-width:600px;
          margin:0 auto;
          background-color:#ffffff;
          border-radius:6px;
          overflow:hidden;
          box-shadow:0 2px 6px rgba(0,0,0,0.08);
        ">

          <!-- Header -->
          <div style="
            background-color:#0b4da2;
            color:#ffffff;
            padding:16px 20px;
            text-align:center;
          ">
            <h2 style="margin:0; font-size:20px;">
              Recuperación de contraseña
            </h2>
          </div>

          <!-- Body -->
          <div style="padding:20px; color:#333333;">
            <p style="margin-top:0;">
              Recibimos una solicitud para restablecer tu contraseña.
            </p>

            <p>
              Para continuar, hacé clic en el siguiente botón:
            </p>

            <div style="text-align:center; margin:30px 0;">
              <a href="${resetLink}" target="_blank"
                style="
                  background-color:#c62828;
                  color:#ffffff;
                  padding:12px 24px;
                  text-decoration:none;
                  border-radius:4px;
                  font-weight:bold;
                  display:inline-block;
                ">
                Restablecer contraseña
              </a>
              <p style="font-size:12px; color:#777777;">
                Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>
                <span style="word-break:break-all;">${resetLink}</span>
              </p>
            </div>

            <p style="font-size:14px; color:#555555;">
              Este enlace es válido por <strong>1 hora</strong>.
            </p>

            <p style="font-size:14px; color:#555555;">
              Si no solicitaste este cambio, podés ignorar este correo.
            </p>
          </div>

          <!-- Footer -->
          <div style="
            background-color:#f0f0f0;
            padding:12px 20px;
            font-size:12px;
            color:#777777;
            text-align:center;
          ">
            Círculo de Arqueros de la Región Patagónia Oeste · Sistema de Gestión
          </div>

        </div>
      </div>

    `,
  });
  console.log('Mail enviado (SMTP aceptado)');
};
