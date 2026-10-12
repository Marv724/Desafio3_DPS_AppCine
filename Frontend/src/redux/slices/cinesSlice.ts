import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { Cine } from '../../types/cine';

interface CinesState {
  items: Cine[];
  cargando: boolean;
  error: string | null;
}

const initialState: CinesState = { items: [], cargando: false, error: null };

export const cargarCines = createAsyncThunk<Cine[], void, { rejectValue: string }>(
  'cines/cargar',
  async (_, { rejectWithValue }) => {
    try {
      return await api<Cine[]>('/cines');
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

const cineSlice = createSlice({
  name: 'cines',
  initialState,
  reducers: {},
  extraReducers: (puntero) => {
    puntero.addCase(cargarCines.pending, (state) => {
      state.cargando = true;
      state.error = null;
    });
    puntero.addCase(cargarCines.fulfilled, (state, punteroA) => {
      state.cargando = false;
      state.items = punteroA.payload;
    });
    puntero.addCase(cargarCines.rejected, (state, punteroB) => {
      state.cargando = false;
      state.error = punteroB.payload ?? 'Error inesperado';
    });
  },
});

export default cineSlice.reducer;