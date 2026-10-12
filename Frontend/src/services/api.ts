const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

let token: string | null = null;
export const setToken = (t: string | null) => {
  token = t;
};

export async function api<T>(
  ruta: string,
  opciones: { method?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${ruta}`, {
    method: opciones.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'Error de red');
  return data as T;
}