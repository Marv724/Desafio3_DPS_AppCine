import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { Funcion, MapaAsientos } from '../../types/funcion';

interface FuncionesState {
  items: Funcion[];
  mapa: MapaAsientos | null;
  cargando: boolean;
  error: string | null;
}

const initialState: FuncionesState = { items: [], mapa: null, cargando: false, error: null };

export const cargarFunciones = createAsyncThunk<Funcion[], number, { rejectValue: string }>(
  'funciones/cargar',
  async (peliculaId, { rejectWithValue }) => {
    try {
      return await api<Funcion[]>(`/funciones?peliculaId=${peliculaId}`);
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const cargarAsientos = createAsyncThunk<MapaAsientos, number, { rejectValue: string }>(
  'funciones/asientos',
  async (funcionId, { rejectWithValue }) => {
    try {
      return await api<MapaAsientos>(`/funciones/${funcionId}/asientos`);
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

const funcionesSlice = createSlice({
  name: 'funciones',
  initialState,
  reducers: {
    limpiarMapa: (state) => {
      state.mapa = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(cargarFunciones.pending, (state) => {
      state.cargando = true;
      state.error = null;
      state.items = [];
    });
    b.addCase(cargarFunciones.fulfilled, (state, a) => {
      state.cargando = false;
      state.items = a.payload;
    });
    b.addCase(cargarFunciones.rejected, (state, a) => {
      state.cargando = false;
      state.error = a.payload ?? 'Error inesperado';
    });

    b.addCase(cargarAsientos.pending, (state) => {
      state.cargando = true;
      state.error = null;
    });
    b.addCase(cargarAsientos.fulfilled, (state, a) => {
      state.cargando = false;
      state.mapa = a.payload;
    });
    b.addCase(cargarAsientos.rejected, (state, a) => {
      state.cargando = false;
      state.error = a.payload ?? 'Error inesperado';
    });
  },
});

export const { limpiarMapa } = funcionesSlice.actions;
export default funcionesSlice.reducer;