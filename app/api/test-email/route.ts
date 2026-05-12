import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { to } = await req.json();

  if (!process.env.GMAIL_USER || process.env.GMAIL_USER === "your_gmail@gmail.com") {
    return NextResponse.json({
      error: "GMAIL_USER is not configured in .env.local",
    }, { status: 400 });
  }

  if (!process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD === "your_16_char_app_password") {
    return NextResponse.json({
      error: "GMAIL_APP_PASSWORD is not configured in .env.local",
    }, { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"InkPress" <${process.env.GMAIL_USER}>`,
      to: to || user.email,
      subject: "✓ InkPress — Email test successful",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;">
          <h2 style="color:#5B3ADB;">InkPress Email Test</h2>
          <p>Your Gmail SMTP is configured correctly. Newsletter sending will work.</p>
          <p style="color:#6b7280;font-size:12px;">Sent from: ${process.env.GMAIL_USER}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, sentTo: to || user.email });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
