import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { Reserva, ReservaNueva } from '../../types/reserva';

interface ReservasState {
  items: Reserva[];
  cargando: boolean;
  creando: boolean;
  error: string | null;
}

const initialState: ReservasState = { items: [], cargando: false, creando: false, error: null };

export const crearReserva = createAsyncThunk<
  ReservaNueva,
  { funcionId: number; asientos: string[] },
  { rejectValue: string }
>('reservas/crear', async (datos, { rejectWithValue }) => {
  try {
    return await api<ReservaNueva>('/reservas', { method: 'POST', body: datos });
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

export const cargarMisReservas = createAsyncThunk<Reserva[], void, { rejectValue: string }>(
  'reservas/mias',
  async (_, { rejectWithValue }) => {
    try {
      return await api<Reserva[]>('/reservas/mias');
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

const reservasSlice = createSlice({
  name: 'reservas',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(crearReserva.pending, (state) => {
      state.creando = true;
    });
    b.addCase(crearReserva.fulfilled, (state) => {
      state.creando = false;
    });
    b.addCase(crearReserva.rejected, (state) => {
      state.creando = false;
    });

    b.addCase(cargarMisReservas.pending, (state) => {
      state.cargando = true;
      state.error = null;
    });
    b.addCase(cargarMisReservas.fulfilled, (state, a) => {
      state.cargando = false;
      state.items = a.payload;
    });
    b.addCase(cargarMisReservas.rejected, (state, a) => {
      state.cargando = false;
      state.error = a.payload ?? 'Error inesperado';
    });
  },
});

export default reservasSlice.reducer;