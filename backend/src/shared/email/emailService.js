import nodemailer from "nodemailer";
import { env } from "../../config/env.js";

class EmailService {
  constructor() {
    this.transporter = null;
    this.hasSmtp = Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

    if (this.hasSmtp) {
      this.transporter = nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.secure,
        auth: {
          user: env.smtp.user,
          pass: env.smtp.pass,
        },
      });
    }
  }

  async sendVerificationEmail({ to, name, verificationUrl }) {
    if (!this.hasSmtp) {
      console.log("\n==================================================");
      console.log(`[SIMULACIÓN DE CORREO] Verificación de Correo`);
      console.log(`Para: ${name} <${to}>`);
      console.log(`Enlace de verificación: ${verificationUrl}`);
      console.log("==================================================\n");
      return { simulated: true };
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="background-color: #0f2744; padding: 18px 24px; border-radius: 6px 6px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Directorio de Egresados UAJMS</h1>
        </div>
        <div style="padding: 24px 16px; color: #334155; line-height: 1.6;">
          <p>Hola <strong>${name}</strong>,</p>
          <p>Recibimos una solicitud para verificar tu correo electrónico en el Directorio de Egresados de la Universidad Autónoma Juan Misael Saracho.</p>
          <p>Al verificar tu correo, aparecerá la insignia de <strong>perfil verificado</strong> en el directorio público y en tu ficha profesional.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationUrl}" style="background-color: #10b981; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              ✓ Verificar mi correo electrónico
            </a>
          </div>
          <p style="font-size: 0.9rem; color: #64748b;">Este enlace es válido durante las próximas 24 horas. Si no solicitaste esta verificación, puedes ignorar este mensaje.</p>
          <p style="font-size: 0.85rem; color: #94a3b8; word-break: break-all;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br><a href="${verificationUrl}">${verificationUrl}</a></p>
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 0.8rem; color: #94a3b8; text-align: center;">
          © ${new Date().getFullYear()} Ingeniería Informática · UAJMS
        </div>
      </div>
    `;

    return this.transporter.sendMail({
      from: env.smtp.from,
      to,
      subject: "Verificación de correo - Directorio de Egresados UAJMS",
      html,
    });
  }

  async sendNotificationEmail({ to, name, title, message, link }) {
    if (!this.hasSmtp) {
      console.log("\n==================================================");
      console.log(`[SIMULACIÓN DE CORREO] Notificación UAJMS: ${title}`);
      console.log(`Para: ${name} <${to}>`);
      console.log(`Mensaje: ${message}`);
      if (link) console.log(`Enlace: ${link}`);
      console.log("==================================================\n");
      return { simulated: true };
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="background-color: #0f2744; padding: 18px 24px; border-radius: 6px 6px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Directorio de Egresados UAJMS</h1>
        </div>
        <div style="padding: 24px 16px; color: #334155; line-height: 1.6;">
          <p>Estimado/a <strong>${name}</strong>,</p>
          <h3 style="color: #0f2744; margin-top: 0;">${title}</h3>
          <p style="white-space: pre-line;">${message}</p>
          ${link ? `
          <div style="text-align: center; margin: 28px 0;">
            <a href="${link}" style="background-color: #0f2744; color: #ffffff; padding: 10px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Ver detalles en la plataforma
            </a>
          </div>` : ""}
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 0.8rem; color: #94a3b8; text-align: center;">
          © ${new Date().getFullYear()} Ingeniería Informática · UAJMS
        </div>
      </div>
    `;

    return this.transporter.sendMail({
      from: env.smtp.from,
      to,
      subject: `${title} - Directorio UAJMS`,
      html,
    });
  }
}

export const emailService = new EmailService();
