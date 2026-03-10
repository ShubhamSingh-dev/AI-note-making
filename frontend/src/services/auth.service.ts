const BASE = 'http://localhost:4000/api/v1'

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${BASE}/users/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data.data.user
}

export async function registerUser(username: string, email: string, password: string) {
  const res = await fetch(`${BASE}/users/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data.data.user
}

export async function logoutUser() {
  await fetch(`${BASE}/users/logout`, {
    method: 'GET',
    credentials: 'include',
  })
}