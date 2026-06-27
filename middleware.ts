import { NextResponse, type NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type SessionData } from '@/lib/session';

export async function middleware(request: NextRequest) {
   const response = NextResponse.next();
   const session = await getIronSession<SessionData>(request, response, sessionOptions);

   if (!session.userId) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
   }

   return response;
}

export const config = {
   matcher: [
      '/dashboard/:path*',
      '/my-items/:path*',
      '/projects/:path*',
      '/members/:path*',
      '/admin/:path*',
   ],
};
