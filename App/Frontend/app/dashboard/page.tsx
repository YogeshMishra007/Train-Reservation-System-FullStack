'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { getSeats, reserveSeats, cancelReservation } from '@/lib/api';
import { LogOut } from 'lucide-react';

type Seat = {
  id: number;
  row: number;
  seatNumber: number;
  isReserved: boolean;
  reservedBy: number | null;
};

export default function Dashboard() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [seatCount, setSeatCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const { token, user, logout, hasHydrated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) {
      router.push('/');
      return;
    }

    fetchSeats();
  }, [hasHydrated, token, router]);

  const fetchSeats = async () => {
    try {
      const data = await getSeats(token!);
      setSeats(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch seats',
      });
    }
  };

  const handleReserve = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await reserveSeats(token!, user.username, seatCount);
      await fetchSeats();
      toast({
        title: 'Success',
        description: 'Seats reserved successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reserve seats',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await cancelReservation(token!, user.username);
      await fetchSeats();
      toast({
        title: 'Success',
        description: 'Reservation cancelled successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to cancel reservation',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const reservedSeatCount = seats.filter(seat => seat.isReserved).length;
  const unreservedSeatCount = seats.length - reservedSeatCount;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Train Seat Reservation</h1>

          <div className="flex items-center gap-2">
              <span className="font-semibold">Reserved Seats:</span>
              <span>{reservedSeatCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Unreserved Seats:</span>
              <span>{unreservedSeatCount}</span>
            </div>


          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                type="number"
                min="1"
                max="7"
                value={seatCount}
                onChange={(e) => setSeatCount(Number(e.target.value))}
                className="w-32"
              />
              <Button onClick={handleReserve} disabled={loading}>
                Reserve Seats
              </Button>
              <Button variant="destructive" onClick={handleCancel} disabled={loading}>
                Cancel Reservation
              </Button>
            </div>

            {/* Seat Grid */}
            {/* Seat Grid */}
            <div className="grid gap-4">
              {Array.from({ length: 12 }).map((_, rowIndex) => {
                // Calculate seat indices for the current row
                const rowSeats =
                  rowIndex < 11
                    ? seats.slice(rowIndex * 7, rowIndex * 7 + 7)
                    : seats.slice(77, 80); // Last row only has 3 seats

                return (
                  <div
                    key={rowIndex}
                    className={`grid gap-2 ${rowIndex < 11 ? 'grid-cols-7' : 'grid-cols-3 justify-center'
                      }`}
                  >
                    {rowSeats.map((_, seatIndex) => {
                      // Dynamically calculate the seat number
                      const seatNumber = rowIndex * 7 + seatIndex + 1;

                      return (
                        <div
                          key={seatNumber}
                          className={`p-4 rounded-md text-center ${seats[seatNumber - 1]?.isReserved
                              ? seats[seatNumber - 1].reservedBy === Number(user?.username)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-destructive text-destructive-foreground'
                              : 'bg-secondary'
                            }`}
                        >
                          {seatNumber} {/* Display the sequential seat number */}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-secondary rounded" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded" />
                <span>Your Reservation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-destructive rounded" />
                <span>Reserved by Others</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
