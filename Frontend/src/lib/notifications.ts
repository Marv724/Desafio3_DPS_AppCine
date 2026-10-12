import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { api } from '../services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const CANAL = 'default';
let tokenActual: string | null = null;

export async function registrarPush(): Promise<string | null> {
  if (!Device.isDevice) return null; // las push remotas solo funcionan en teléfono físico

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'General',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });

  await api('/dispositivos', { method: 'POST', body: { token: data } });
  tokenActual = data;
  return data;
}

export async function quitarPush() {
  if (!tokenActual) return;
  try {
    await api(`/dispositivos/${encodeURIComponent(tokenActual)}`, { method: 'DELETE' });
  } catch {
  }
  tokenActual = null;
}

const idRecordatorio = (codigo: string) => `recordatorio-${codigo}`;

export async function programarRecordatorio(
  codigo: string,
  pelicula: string,
  fechaHoraIso: string,
  minutosAntes = 60
): Promise<boolean> {
  const d = new Date(fechaHoraIso);
  const funcion = new Date(
    d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes()
  );
  const aviso = new Date(funcion.getTime() - minutosAntes * 60000);
  if (aviso.getTime() <= Date.now()) return false; // ya pasó, no se programa

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: idRecordatorio(codigo),
      content: {
        title: 'Tu función se acerca',
        body: `${pelicula} empieza en ${minutosAntes} minutos`,
        data: { tipo: 'recordatorio', codigo },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: aviso,
        channelId: CANAL,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelarRecordatorio(codigo: string) {
  await Notifications.cancelScheduledNotificationAsync(idRecordatorio(codigo)).catch(() => {});
}