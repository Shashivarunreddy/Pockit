'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, MailCheck } from 'lucide-react';

import { signupSchema, type SignupValues } from '@/lib/schemas';
import { signupAction } from '@/server/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/aceternity/input';
import { GradientSubmitButton } from '@/components/pm/auth-form-ui';
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form';

export function SignupForm() {
   const [isPending, startTransition] = useTransition();
   const [submitted, setSubmitted] = useState(false);
   const form = useForm<SignupValues>({
      resolver: zodResolver(signupSchema),
      defaultValues: { name: '', email: '', password: '' },
   });

   function onSubmit(values: SignupValues) {
      startTransition(async () => {
         const result = await signupAction(values);
         if (result?.error) {
            toast.error(result.error);
            return;
         }
         if (result?.pending) setSubmitted(true);
      });
   }

   if (submitted) {
      return (
         <div className="bg-card flex flex-col items-center gap-3 rounded-lg border p-6 text-center">
            <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
               <MailCheck className="size-5" />
            </div>
            <h2 className="text-base font-semibold">Account requested</h2>
            <p className="text-muted-foreground text-sm">
               Thanks for signing up. An administrator needs to approve your profile before you can
               log in. You&apos;ll be able to sign in once it&apos;s verified.
            </p>
            <Button asChild variant="outline" className="mt-1 w-full">
               <Link href="/login">Back to login</Link>
            </Button>
         </div>
      );
   }

   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
               control={form.control}
               name="name"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-neutral-800 dark:text-neutral-200">Name</FormLabel>
                     <FormControl>
                        <Input autoComplete="name" placeholder="Ada Lovelace" {...field} />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />
            <FormField
               control={form.control}
               name="email"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-neutral-800 dark:text-neutral-200">Email</FormLabel>
                     <FormControl>
                        <Input
                           type="email"
                           autoComplete="email"
                           placeholder="you@example.com"
                           {...field}
                        />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />
            <FormField
               control={form.control}
               name="password"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel className="text-neutral-800 dark:text-neutral-200">
                        Password
                     </FormLabel>
                     <FormControl>
                        <Input
                           type="password"
                           autoComplete="new-password"
                           placeholder="••••••••"
                           {...field}
                        />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />
            <GradientSubmitButton type="submit" disabled={isPending} className="mt-2">
               {isPending && <Loader2 className="size-4 animate-spin" />}
               Create account &rarr;
            </GradientSubmitButton>
         </form>
      </Form>
   );
}
