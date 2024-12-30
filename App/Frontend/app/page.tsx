import { AuthForm } from '@/components/auth-form';
import { Train } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-fit p-2 rounded-full bg-primary/10">
            <Train className="w-10 h-10 text-primary" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">Train Seat Reservation</h1>
          <p className="mt-2 text-muted-foreground">
            Book your seats with ease and comfort
          </p>
        </div>
        <AuthForm />
      </div>
    </main>
  );
}