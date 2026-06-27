import 'server-only';
import { headers } from 'next/headers';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function sweep(now: number) {
   if (buckets.size < 5_000) return;
   for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
   }
}

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
   const now = Date.now();
   sweep(now);

   const bucket = buckets.get(key);
   if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true, retryAfterSeconds: 0 };
   }

   if (bucket.count >= limit) {
      return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
   }

   bucket.count += 1;
   return { ok: true, retryAfterSeconds: 0 };
}

export async function clientKey(scope: string): Promise<string> {
   const h = await headers();
   const ip =
      h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip')?.trim() || 'local';
   return `${scope}:${ip}`;
}
