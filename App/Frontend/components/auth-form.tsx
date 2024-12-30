'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { login, signup } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { setAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const data = await login(username, password);
        if (data.message) {
          
      
          // Fetch the userId based on the username
          const response = await fetch('https://backend-r4al.onrender.com/api/user-id', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
          });
      
          const userData = await response.json();
          const userId = userData.userId;
          setAuth(data.token, { username: userId || data.error });
          if (response.ok) {
             // Assuming the response contains the userId
            // Redirect to the dashboard with userId in the URL
            router.push(`/dashboard`);
          } else {
            throw new Error(userData.error || 'Failed to fetch user ID');
          }
        } else {
          throw new Error(data.error || 'Login failed');
        }
      }
       else {
        const data = await signup(username, password);
        if (data.user) {
          toast({
            title: 'Success',
            description: 'Account created! Please login.',
          });
          setIsLogin(true);
        } else {
          throw new Error(data.error || 'Signup failed');
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
        </Button>
      </form>
    </Card>
  );
}