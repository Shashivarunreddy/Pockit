'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { loginSchema, type LoginValues } from '@/lib/schemas';
import { loginAction } from '@/server/actions/auth';
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

export function LoginForm() {
   const [isPending, startTransition] = useTransition();
   const form = useForm<LoginValues>({
      resolver: zodResolver(loginSchema),
      defaultValues: { email: '', password: '' },
   });

   function onSubmit(values: LoginValues) {
      startTransition(async () => {
         const result = await loginAction(values);
         if (result?.error) {
            toast.error(result.error);
         }
      });
   }

   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                           autoComplete="current-password"
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
               Log in &rarr;
            </GradientSubmitButton>
         </form>
      </Form>
   );
}
