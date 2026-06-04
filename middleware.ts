import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — required to keep the session alive
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if journalist — block from admin, send to their page
    const { data: author } = await supabase
      .from("authors")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (author && author.role !== "editor") {
      const journalistUrl = request.nextUrl.clone();
      journalistUrl.pathname = `/author/${author.id}/dashboard`;
      return NextResponse.redirect(journalistUrl);
    }
  }

  // Redirect logged-in users away from /login based on their role
  if (pathname === "/login" && user) {
    const { data: author } = await supabase
      .from("authors")
      .select("id, role")
      .eq("id", user.id)
      .single();

    const dest = request.nextUrl.clone();
    dest.pathname = author && author.role !== "editor"
      ? `/author/${author.id}/dashboard`
      : "/admin";
    return NextResponse.redirect(dest);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
