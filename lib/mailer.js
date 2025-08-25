"use server";

import nodemailer from "nodemailer";
import { render } from "@react-email/render";

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const secureEnv = process.env.SMTP_SECURE;
  const secure = typeof secureEnv === "string" ? secureEnv.toLowerCase() === "true" : port === 465;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.");
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return cachedTransporter;
}

export async function sendEmail({ to, subject, react, text, html: htmlInput }) {
  if (!to) throw new Error("Recipient 'to' is required");
  if (!subject) throw new Error("Email 'subject' is required");

  const transporter = getTransporter();

  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || "Mischief Meet";
  const from = `${fromName} <${fromAddress}>`;

  // Render React template to HTML if provided
  const html = htmlInput ?? (react ? await render(react) : undefined);

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });

  return info;
}


