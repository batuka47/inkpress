export interface EmailTemplateData {
  siteUrl: string;
  articleTitle: string;
  articleSlug: string;
  articleExcerpt: string;
  coverImageUrl?: string | null;
  authorName?: string | null;
  categoryName?: string | null;
  publishedAt?: string | null;
  subscriberEmail: string;
  customSubject?: string;
  customIntro?: string;
}

export function buildEmailHtml(data: EmailTemplateData): string {
  const articleUrl = `${data.siteUrl}/article/${data.articleSlug}`;
  const unsubscribeUrl = `${data.siteUrl}/unsubscribe?email=${encodeURIComponent(data.subscriberEmail)}`;
  const date = data.publishedAt
    ? new Date(data.publishedAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${data.articleTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f6;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f6;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr><td style="background:#5B3ADB;padding:24px 32px;text-align:center;">
        <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">
          AmjiltPressAgency
        </h1>
        <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:0.1em;text-transform:uppercase;">
          News as it should be read
        </p>
      </td></tr>

      <!-- Date bar -->
      <tr><td style="background:#f9fafb;padding:8px 32px;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#6b7280;letter-spacing:0.06em;text-transform:uppercase;">
          ${date}${data.categoryName ? ` &nbsp;·&nbsp; ${data.categoryName}` : ""}
        </p>
      </td></tr>

      ${data.coverImageUrl ? `
      <!-- Cover image -->
      <tr><td style="padding:0;">
        <img src="${data.coverImageUrl}" alt="${data.articleTitle}" width="600"
          style="width:100%;max-width:600px;height:280px;object-fit:cover;display:block;" />
      </td></tr>` : ""}

      <!-- Article content -->
      <tr><td style="padding:36px 40px 24px;">
        ${data.customIntro ? `
        <p style="margin:0 0 20px;font-family:Arial,sans-serif;font-size:14px;color:#4b5563;line-height:1.6;border-left:3px solid #5B3ADB;padding-left:16px;">
          ${data.customIntro}
        </p>` : ""}

        ${data.categoryName ? `
        <p style="margin:0 0 12px;">
          <span style="display:inline-block;font-family:Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#5B3ADB;background:#EDE9FF;padding:3px 10px;border-radius:999px;">
            ${data.categoryName}
          </span>
        </p>` : ""}

        <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#111827;line-height:1.2;letter-spacing:-0.02em;">
          ${data.articleTitle}
        </h2>

        <p style="margin:0 0 28px;font-family:Georgia,serif;font-size:16px;color:#374151;line-height:1.8;">
          ${data.articleExcerpt}
        </p>

        <a href="${articleUrl}"
          style="display:inline-block;background:#5B3ADB;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:0.02em;">
          Read Full Article →
        </a>

        ${data.authorName ? `
        <p style="margin:28px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#9ca3af;">
          By <strong style="color:#374151;">${data.authorName}</strong>
        </p>` : ""}
      </td></tr>

      <!-- Divider -->
      <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e5e7eb;" /></td></tr>

      <!-- Footer -->
      <tr><td style="padding:24px 40px 32px;text-align:center;">
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;color:#9ca3af;">
          You're receiving this because you subscribed to AmjiltPressAgency.
        </p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;">
          <a href="${articleUrl}" style="color:#5B3ADB;text-decoration:none;">View online</a>
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:none;">Unsubscribe</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}
