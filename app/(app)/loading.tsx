import { Loader2 } from 'lucide-react';

export default function AppLoading() {
   return (
      <div className="flex h-full items-center justify-center py-24">
         <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
   );
}
