import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { api, setToken } from '../../services/api';
import type { Usuario } from '../../types/usuario';

interface Sesion {
  usuario: Usuario;
  token: string;
}

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  restaurando: boolean;
  error: string | null;
}

const initialState: AuthState = {
  usuario: null,
  token: null,
  cargando: false,
  restaurando: true,
  error: null,
};

const guardar = async (s: Sesion) => {
  setToken(s.token);
  await SecureStore.setItemAsync('sesion', JSON.stringify(s));
};

export const login = createAsyncThunk<
  Sesion,
  { correo: string; clave: string },
  { rejectValue: string }
>('auth/login', async (datos, { rejectWithValue }) => {
  try {
    const s = await api<Sesion>('/usuarios/login', { method: 'POST', body: datos });
    await guardar(s);
    return s;
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

export const registro = createAsyncThunk<
  Sesion,
  { nombre: string; correo: string; clave: string },
  { rejectValue: string }
>('auth/registro', async (datos, { rejectWithValue }) => {
  try {
    const s = await api<Sesion>('/usuarios/registro', { method: 'POST', body: datos });
    await guardar(s);
    return s;
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

export const restaurarSesion = createAsyncThunk<Sesion | null>(
  'auth/restaurar',
  async () => {
    const guardada = await SecureStore.getItemAsync('sesion');
    if (!guardada) return null;
    const s = JSON.parse(guardada) as Sesion;
    setToken(s.token);
    return s;
  }
);

export const cerrarSesion = createAsyncThunk('auth/logout', async () => {
  setToken(null);
  await SecureStore.deleteItemAsync('sesion');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    limpiarError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    const pendiente = (state: AuthState) => {
      state.cargando = true;
      state.error = null;
    };
    const ok = (state: AuthState, a: { payload: Sesion }) => {
      state.cargando = false;
      state.usuario = a.payload.usuario;
      state.token = a.payload.token;
    };
    const fallo = (state: AuthState, a: { payload?: string }) => {
      state.cargando = false;
      state.error = a.payload ?? 'Error inesperado';
    };

    b.addCase(login.pending, pendiente).addCase(login.fulfilled, ok).addCase(login.rejected, fallo);
    b.addCase(registro.pending, pendiente).addCase(registro.fulfilled, ok).addCase(registro.rejected, fallo);
    b.addCase(restaurarSesion.fulfilled, (state, a) => {
      state.restaurando = false;
      if (a.payload) {
        state.usuario = a.payload.usuario;
        state.token = a.payload.token;
      }
    });
    b.addCase(restaurarSesion.rejected, (state) => {
      state.restaurando = false;
    });
    b.addCase(cerrarSesion.fulfilled, (state) => {
      state.usuario = null;
      state.token = null;
    });
  },
});

export const { limpiarError } = authSlice.actions;
export default authSlice.reducer;