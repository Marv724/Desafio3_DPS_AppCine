import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { Pelicula } from '../../types/pelicula';

export interface FiltrosPeliculas {
  q?: string;
  genero?: string;
  clasificacion?: string;
  estado?: string;
}

interface PeliculasState {
  items: Pelicula[];
  cargando: boolean;
  error: string | null;
}

const initialState: PeliculasState = { items: [], cargando: false, error: null };

const armarQuery = (f: FiltrosPeliculas = {}) => {
  const partes = Object.entries(f)
    .filter(([, elemnto]) => elemnto)
    .map(([punteroa, punterob]) => `${punteroa}=${encodeURIComponent(String(punterob))}`);
  return partes.length ? `?${partes.join('&')}` : '';
};

export const cargarPeliculas = createAsyncThunk<
  Pelicula[], FiltrosPeliculas | undefined,{ rejectValue: string }>('peliculas/cargar', async (filtros, { rejectWithValue }) => {
  try {
    return await api<Pelicula[]>(`/peliculas${armarQuery(filtros)}`);
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

const peliculasSlice = createSlice({
  name: 'peliculas',
  initialState,
  reducers: {},
  extraReducers: (puntero) => {
    puntero.addCase(cargarPeliculas.pending, (state) => {
      state.cargando = true;
      state.error = null;
    });
    puntero.addCase(cargarPeliculas.fulfilled, (state, punterob) => {
      state.cargando = false;
      state.items = punterob.payload;
    });
    puntero.addCase(cargarPeliculas.rejected, (state, punteroc) => {
      state.cargando = false;
      state.error = punteroc.payload ?? 'Error inesperado';
    });
  },
});

export default peliculasSlice.reducer;