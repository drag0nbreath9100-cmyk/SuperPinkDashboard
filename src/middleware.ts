import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
    const { supabase, response, user } = await updateSession(request);
    const path = request.nextUrl.pathname;

    // 1. Redirect to login if no user and trying to access protected routes
    const protectedPaths = ["/admin", "/head-coach", "/coach", "/approval-pending"];
    const isProtectedRoute = protectedPaths.some((p) => path.startsWith(p));
    const isAuthPage = path.startsWith("/login") || path.startsWith("/signup");
    const isPendingPage = path.startsWith("/approval-pending");

    if (!user && isProtectedRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 2. Fetch Profile if User Exists
    let profile = null;
    if (user) {
        const { data } = await supabase
            .from("coaches")
            .select("role, status")
            .eq("id", user.id)
            .single();
        profile = data;
    }

    // 3. Status Check (Redirect Pending Users)
    if (user && profile?.status === 'pending' && !isPendingPage) {
        // Allow logout (logout action usually hits an API route or page, hopefully middleware doesn't block server action endpoints if not in protectedPaths? 
        // Actually server actions are POSTs. Middleware runs on everything. 
        // But usually /approval-pending page will have a logout button that POSTs to action.
        // As long as /approval-pending is allowed, we are good.
        return NextResponse.redirect(new URL("/approval-pending", request.url));
    }

    // 4. Redirect Active Users away from Pending Page
    if (user && profile?.status !== 'pending' && isPendingPage) {
        const role = profile?.role || "coach";
        if (role === 'admin') return NextResponse.redirect(new URL("/admin", request.url));
        if (role === 'head_coach') return NextResponse.redirect(new URL("/head-coach", request.url));
        return NextResponse.redirect(new URL("/coach", request.url));
    }

    // 5. Redirect logged-in users away from login/signup page
    if (user && isAuthPage) {
        if (profile?.status === 'pending') return NextResponse.redirect(new URL("/approval-pending", request.url));

        const role = profile?.role || "coach";
        if (role === 'admin') return NextResponse.redirect(new URL("/admin", request.url));
        if (role === 'head_coach') return NextResponse.redirect(new URL("/head-coach", request.url));
        return NextResponse.redirect(new URL("/coach", request.url));
    }

    // 6. Role-based Access Control (RBAC)
    if (user && isProtectedRoute && !isPendingPage) {
        const role = profile?.role || "coach";

        // Admin Route Protection
        if (path.startsWith("/admin") && role !== "admin") {
            if (role === 'head_coach') return NextResponse.redirect(new URL("/head-coach", request.url));
            return NextResponse.redirect(new URL("/coach", request.url));
        }

        // Head Coach Route Protection
        if (path.startsWith("/head-coach") && role !== "head_coach") {
            if (role === 'admin') return NextResponse.redirect(new URL("/admin", request.url));
            return NextResponse.redirect(new URL("/coach", request.url));
        }

        // Coach Route Protection
        if (path.startsWith("/coach") && role !== "coach") {
            if (role === 'admin') return NextResponse.redirect(new URL("/admin", request.url));
            if (role === 'head_coach') return NextResponse.redirect(new URL("/head-coach", request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
