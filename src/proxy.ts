import { NextRequest, NextResponse } from "next/server";

import { User, UserRole } from "@/features/auth/types";

export const ROUTES = {
    // Requires a signed-in user (any role).
    protectedRoutes: ["/dashboard", "/account"] as const,
    // Subset of protectedRoutes that additionally requires ADMIN or SUPER_ADMIN.
    adminOnlyRoutes: ["/dashboard"] as const,
    public: ["/"] as const,
    auth: ["/auth/sign-in", "/auth/sign-up", "/auth/forgot-password", "/auth/verify-email"] as const,
};

export const isRouteMatched = (pathname: string, routes: readonly string[]) =>
    routes.some((route) => pathname.startsWith(route));

export const isRouteExactMatched = (pathname: string, routes: readonly string[]) =>
    routes.some((route) => pathname === route);

export async function proxy(req: NextRequest) {
    const { pathname, searchParams, search } = req.nextUrl;

    const isAuthenticated = checkAuth(req);
    const isProtectedRoute = isRouteMatched(pathname, ROUTES.protectedRoutes);
    const isAdminOnlyRoute = isRouteMatched(pathname, ROUTES.adminOnlyRoutes);
    const isAuthRoute = isRouteExactMatched(pathname, ROUTES.auth);
    // Exact match: startsWith would match every path off of "/".
    const isPublicRoute = isRouteExactMatched(pathname, ROUTES.public);

    if (isPublicRoute) return NextResponse.next();

    if (isAuthenticated) {
        // The backend rejects login for anything but an ACTIVE user, so a
        // valid session cookie already implies a verified, non-suspended
        // account — there's no "authenticated but unverified" state to gate.
        if (isAuthRoute) {
            const callback = searchParams.get("callbackUrl") || "/";
            return redirectTo(callback, req);
        }
        if (isAdminOnlyRoute && !isAdmin(req)) {
            return redirectTo("/", req);
        }
        return NextResponse.next();
    }

    if (isProtectedRoute) {
        const callback = encodeURIComponent(pathname + search);
        return redirectTo(`/auth/sign-in?callbackUrl=${callback}`, req);
    }

    return NextResponse.next();
}

function redirectTo(path: string, req: NextRequest): NextResponse {
    const url = new URL(path, req.url);

    return url.pathname === req.nextUrl.pathname ? NextResponse.next() : NextResponse.redirect(url);
}

// NOTE: this proxy only redirects for UX — it trusts cookie *presence* and the
// unsigned `user` JSON cookie for role, neither of which it can
// cryptographically verify. It is NOT an authorization boundary. Every
// privileged backend endpoint MUST independently verify the JWT and
// re-derive the role server-side; never rely on this gate alone.
const checkAuth = (req: NextRequest) => {
    const accessToken = req.cookies.get("accessToken")?.value;
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (accessToken && refreshToken) {
        return true;
    }

    return false;
};

const isAdmin = (req: NextRequest) => {
    const userCookie = req.cookies.get("user")?.value;
    const user = userCookie ? (JSON.parse(userCookie) as User) : ({} as User);

    return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
};

// Matcher configuration - exclude static files and API routes
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
