import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Define public routes
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/auth/callback']
    const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))

    // If not logged in and trying to access protected route
    if (!user && !isPublicRoute && request.nextUrl.pathname !== '/') {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // If logged in, check role-based access
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role || 'user'
        const pathname = request.nextUrl.pathname

        // Student trying to access admin routes
        if (pathname.startsWith('/admin') && role === 'user') {
            const url = request.nextUrl.clone()
            url.pathname = '/student/dashboard'
            return NextResponse.redirect(url)
        }

        // Redirect root to appropriate dashboard
        if (pathname === '/' || isPublicRoute) {
            const url = request.nextUrl.clone()
            if (role === 'user') {
                url.pathname = '/student/dashboard'
            } else {
                url.pathname = '/admin/dashboard'
            }
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
