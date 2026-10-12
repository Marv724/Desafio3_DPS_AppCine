import {Expo} from 'expo-server-sdk';
import { pool } from '../config.js';

const expo = new Expo();

export const enviarPush = async (tokens, title, body, data = {}) => {
    const mensaje = tokens
        .filter((t) => Expo.isExpoPushToken(t))
        .map((to) => ({to, sound: 'default', title, body, data}));
      for(const lote of expo.chunkPushNotifications(mensaje)) {
        try{
            await expo.sendPushNotificationsAsync(lote);
        }
        catch (e) {
             console.error('Error de envio push', e.message);
        }
      }
      return mensaje.length;
}

export const tokensDeUsuarios = async (ids) => {
    if(!ids.length){
        return [];
    }
    const[f] = await pool.query(
        'SELECT expo_push_token FROM dispositivos WHERE usuario_id IN (?)', [ids]
    );
    return f.map((x) => x.expo_push_token);
};

export const tokesDeCliente = async () => {
    const [f] = await pool.query(
        `SELECT d.expo_push_token FROM dispositivos d
        JOIN usuarios u ON u.id = d.usuario_id WHERE u.rol = 'cliente'`
    );
    return f.map((x) => x.expo_push_token);
};