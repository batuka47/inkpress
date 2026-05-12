import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";
import { buildEmailHtml } from "@/lib/email/template";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      articleTitle,
      articleSlug,
      articleExcerpt,
      coverImageUrl,
      authorName,
      categoryName,
      publishedAt,
      customSubject,
      customIntro,
    } = body;

    if (!articleTitle || !articleSlug) {
      return NextResponse.json({ error: "Missing article data" }, { status: 400 });
    }

    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch active subscribers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscribers, error: subError } = await (supabase as any)
      .from("subscribers")
      .select("email, name")
      .eq("active", true);

    if (subError) return NextResponse.json({ error: subError.message }, { status: 500 });
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ sent: 0, message: "No active subscribers" });
    }

    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const subject = customSubject || `${categoryName ? `[${categoryName}] ` : ""}${articleTitle} — InkPress`;

    let sent = 0;
    const errors: string[] = [];

    for (const sub of subscribers as { email: string; name: string | null }[]) {
      try {
        const html = buildEmailHtml({
          siteUrl,
          articleTitle,
          articleSlug,
          articleExcerpt: articleExcerpt || "",
          coverImageUrl,
          authorName,
          categoryName,
          publishedAt,
          subscriberEmail: sub.email,
          customIntro,
        });

        await transporter.sendMail({
          from: `"InkPress" <${process.env.GMAIL_USER}>`,
          to: sub.email,
          subject,
          html,
        });

        sent++;
      } catch (err) {
        errors.push(sub.email);
        console.error(`Failed to send to ${sub.email}:`, err);
      }
    }

    return NextResponse.json({
      sent,
      total: subscribers.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("Newsletter send error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
