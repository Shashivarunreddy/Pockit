import type { SessionOptions } from 'iron-session';

export type SessionData = {
   userId?: string;
};

const sessionPassword =
   process.env.SESSION_PASSWORD ?? 'dev_only_change_me_circle_pm_session_secret_32+';

export const sessionOptions: SessionOptions = {
   password: sessionPassword,
   cookieName: 'circle_session',
   cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
   },
};
