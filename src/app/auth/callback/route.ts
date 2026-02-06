import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // We ignore the 'next' param for dashboard logic to enforce role-based landing
  
  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
             try {
               cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
             } catch {}
          },
        },
      }
    );
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
       // INTELLIGENT REDIRECT FOR OAUTH
       const { data: profile } = await supabase
         .from('profiles')
         .select('role')
         .eq('id', data.user.id)
         .single();
       
       const role = profile?.role || 'user';
       
       if (role === 'sacco_admin') {
          return NextResponse.redirect(`${origin}/dashboard/sacco`);
       } else {
          return NextResponse.redirect(`${origin}/dashboard/user`);
       }
    }
  }

  return NextResponse.redirect(`${origin}/login?message=Auth failed`);
}