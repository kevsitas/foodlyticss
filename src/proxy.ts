import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ROLE_ROUTES: Record<string, string> = {
  client: "/client/dashboard",
  nutritionist: "/nutritionist/dashboard",
  trainer: "/trainer/dashboard",
  admin: "/admin/dashboard",
};

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Allow public routes (and /verify-identity for unverified users)
  const publicRoutes = ["/login", "/signup", "/", "/auth/", "/forgot-password", "/reset-password", "/_next/"];
  const isPublic = publicRoutes.some(r => pathname.startsWith(r));
  const isVerifyIdentity = pathname.startsWith("/verify-identity");

  // Redirect already-verified users from verify-identity to their dashboard
  if (isVerifyIdentity && user?.user_metadata?.verification_status === "approved") {
    const role = user.user_metadata?.role as string || "client";
    const dashboard = ROLE_ROUTES[role] || "/client/dashboard";
    const url = request.nextUrl.clone();
    url.pathname = dashboard;
    return NextResponse.redirect(url);
  }

  // Redirect clients and users without role away from verify-identity
  if (isVerifyIdentity && user) {
    const role = user.user_metadata?.role as string || "";
    if (!role || role === "client" || role === "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/client/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Allow /verify-identity for unverified or pending users
  if (isVerifyIdentity) {
    return supabaseResponse;
  }

  // Redirect authenticated users away from public routes
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const role = user.user_metadata?.role as string || "client";
    const dashboard = ROLE_ROUTES[role] || "/client/dashboard";
    const url = request.nextUrl.clone();
    url.pathname = dashboard;
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users away from protected routes
  if (!user && !isPublic && pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Role-based route protection
  if (user) {
    const role = user.user_metadata?.role as string || "client";
    const vStatus = user.user_metadata?.verification_status as string | undefined;

    // Redirect unverified professionals to verify-identity
    if (
      (role === "nutritionist" || role === "trainer") &&
      vStatus !== "approved" &&
      (pathname.startsWith("/nutritionist/") || pathname.startsWith("/trainer/"))
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/verify-identity";
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith("/client/") && role !== "client" && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_ROUTES[role] || "/login";
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith("/nutritionist/") && role !== "nutritionist" && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_ROUTES[role] || "/login";
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith("/trainer/") && role !== "trainer" && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_ROUTES[role] || "/login";
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith("/admin/") && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    // Redirect /dashboard to role-specific
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_ROUTES[role] || "/client/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
