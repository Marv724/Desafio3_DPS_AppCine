import { configureStore } from '@reduxjs/toolkit';
import auth from './slices/authSlice';
import peliculas from './slices/peliculaSlice';
import cines from './slices/cinesSlice';
import funciones from './slices/funcionesSlice';
import reservas from './slices/reservasSlice';

export const store = configureStore({
  reducer: { auth, peliculas, cines, funciones, reservas },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;