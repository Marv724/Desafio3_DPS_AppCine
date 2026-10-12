import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { EstadoPelicula, Pelicula } from '../../types/pelicula';

export interface FiltrosPeliculas {
  q?: string;
  genero?: string;
  clasificacion?: string;
  estado?: string;
}

export interface PeliculaForm {
  codigo: string;
  nombre: string;
  genero?: string;
  duracion?: number;
  clasificacion?: string;
  precio: number;
  estado: EstadoPelicula;
}

interface PeliculasState {
  items: Pelicula[];
  cargando: boolean;
  error: string | null;
}

const initialState: PeliculasState = { items: [], cargando: false, error: null };

const armarQuery = (f: FiltrosPeliculas = {}) => {
  const partes = Object.entries(f)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`);
  return partes.length ? `?${partes.join('&')}` : '';
};

export const cargarPeliculas = createAsyncThunk<
  Pelicula[],
  FiltrosPeliculas | undefined,
  { rejectValue: string }
>('peliculas/cargar', async (filtros, { rejectWithValue }) => {
  try {
    return await api<Pelicula[]>(`/peliculas${armarQuery(filtros)}`);
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

export const guardarPelicula = createAsyncThunk<
  Pelicula,
  { id?: number; datos: PeliculaForm },
  { rejectValue: string }
>('peliculas/guardar', async ({ id, datos }, { rejectWithValue }) => {
  try {
    return await api<Pelicula>(id ? `/peliculas/${id}` : '/peliculas', {
      method: id ? 'PUT' : 'POST',
      body: datos,
    });
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

export const cambiarEstadoPelicula = createAsyncThunk<
  { id: number; estado: EstadoPelicula },
  { id: number; estado: EstadoPelicula },
  { rejectValue: string }
>('peliculas/estado', async ({ id, estado }, { rejectWithValue }) => {
  try {
    return await api<{ id: number; estado: EstadoPelicula }>(`/peliculas/${id}/estado`, {
      method: 'PATCH',
      body: { estado },
    });
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

export const eliminarPelicula = createAsyncThunk<number, number, { rejectValue: string }>(
  'peliculas/eliminar',
  async (id, { rejectWithValue }) => {
    try {
      await api(`/peliculas/${id}`, { method: 'DELETE' });
      return id;
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

const peliculasSlice = createSlice({
  name: 'peliculas',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(cargarPeliculas.pending, (state) => {
      state.cargando = true;
      state.error = null;
    });
    b.addCase(cargarPeliculas.fulfilled, (state, a) => {
      state.cargando = false;
      state.items = a.payload;
    });
    b.addCase(cargarPeliculas.rejected, (state, a) => {
      state.cargando = false;
      state.error = a.payload ?? 'Error inesperado';
    });

    b.addCase(guardarPelicula.fulfilled, (state, a) => {
      const i = state.items.findIndex((p) => p.id === a.payload.id);
      if (i >= 0) state.items[i] = a.payload;
      else state.items.push(a.payload);
    });
    b.addCase(cambiarEstadoPelicula.fulfilled, (state, a) => {
      const p = state.items.find((x) => x.id === a.payload.id);
      if (p) p.estado = a.payload.estado;
    });
    b.addCase(eliminarPelicula.fulfilled, (state, a) => {
      state.items = state.items.filter((p) => p.id !== a.payload);
    });
  },
});

export default peliculasSlice.reducer;