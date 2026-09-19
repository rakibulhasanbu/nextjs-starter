import { NextRequest, NextResponse } from "next/server";

import { User, UserRole } from "@/features/auth/types";

export const ROUTES = {
    superAdminRoutes: ["/overview", "/users"] as const,
    adminRoutes: ["/overview"] as const,
    public: ["/"] as const,
    auth: ["/auth/sign-in", "/auth/sign-up", "/auth/forgot-password", "/auth/reset-password"] as const,
    authNotVerified: ["/auth/verify-email"] as const,
};

export const isRouteMatched = (pathname: string, routes: readonly string[]) =>
    routes.some((route) => pathname.startsWith(route));

export const isRouteExactMatched = (pathname: string, routes: readonly string[]) =>
    routes.some((route) => pathname === route);

export async function proxy(req: NextRequest) {
    const { pathname, searchParams, search } = req.nextUrl;

    const isAuthenticated = checkAuth(req);
    const isSuperAdminRoute = isRouteMatched(pathname, ROUTES.superAdminRoutes);
    const isAuthRoute = isRouteExactMatched(pathname, ROUTES.auth);
    const isAuthNotVerifiedRoute = isRouteExactMatched(pathname, ROUTES.authNotVerified);
    const isPublicRoute = isRouteMatched(pathname, ROUTES.public);
    const isRootRoute = pathname === "/";

    if (isPublicRoute) return NextResponse.next();

    if (isAuthenticated) {
        const { isVerified, isAdmin } = checkUserVerified(req);
        if (!isVerified && (isRootRoute || isAuthRoute || isSuperAdminRoute)) {
            return redirectTo("/auth/verify-email", req);
        }
        // if (isVerified && !isAdmin && !isSeller && !isEmployee) {
        //     return redirectTo("/onboarding", req);
        // }
        if (isVerified && isAuthNotVerifiedRoute) {
            return redirectTo("/", req);
        }
        if (isAuthRoute) {
            const callback = searchParams.get("callbackUrl") || "/";
            return redirectTo(callback, req);
        }
        if (isSuperAdminRoute && !isAdmin) {
            return redirectTo("/", req);
        }
        return NextResponse.next();
    }

    if (isRootRoute || isSuperAdminRoute) {
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
// unsigned `user` JSON cookie for role/verification, neither of which it can
// cryptographically verify. It is NOT an authorization boundary. Every
// privileged backend endpoint MUST independently verify the JWT and
// re-derive role/verification server-side; never rely on this gate alone.
const checkAuth = (req: NextRequest) => {
    const accessToken = req.cookies.get("accessToken")?.value;
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (accessToken && refreshToken) {
        return true;
    }

    return false;
};

const checkUserVerified = (req: NextRequest) => {
    const userCookie = req.cookies.get("user")?.value;
    const user = userCookie ? (JSON.parse(userCookie) as User) : ({} as User);

    const isVerified = user?.isVerified;
    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

    return {
        isVerified,
        isAdmin,
    };
};

// Matcher configuration - exclude static files and API routes
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
