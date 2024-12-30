const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-r4al.onrender.com';

export async function signup(username: string, password: string) {
  const response = await fetch(`${API_URL}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return response.json();
}

export async function login(username: string, password: string) {
  const response = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return response.json();
}

export async function getSeats(token: string) {
  const response = await fetch(`${API_URL}/api/seats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
}

export async function reserveSeats(token: string, userId: string, seatCount: number) {
  const response = await fetch(`${API_URL}/api/seats/reserve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, seatCount }),
  });
  return response.json();
}

export async function cancelReservation(token: string, userId: string) {
  const response = await fetch(`${API_URL}/api/seats/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });
  return response.json();
}