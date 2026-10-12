import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

let token: string | null = null;
export const setToken = (t: string | null) => {
  token = t;
};

async function obtenerToken(): Promise<string | null> {
  if (token) return token;
  const guardada = await SecureStore.getItemAsync('sesion');
  if (!guardada) return null;
  try {
    token = (JSON.parse(guardada) as { token?: string }).token ?? null;
  } catch {
    token = null;
  }
  return token;
}

export async function api<T>(
  ruta: string,
  opciones: { method?: string; body?: unknown } = {}
): Promise<T> {
  const t = await obtenerToken();
  const res = await fetch(`${BASE_URL}${ruta}`, {
    method: opciones.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    },
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'Error de red');
  return data as T;
}