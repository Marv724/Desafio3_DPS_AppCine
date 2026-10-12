import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { cerrarSesion } from '../redux/slices/authSlice';
import { quitarPush } from '../lib/notifications';

export default function PerfilScreen() {
  const dispatch = useAppDispatch();
  const usuario = useAppSelector((s) => s.auth.usuario);

  return (
    <View style={styles.contenedor}>
      <Text style={styles.nombre}>{usuario?.nombre}</Text>
      <Text>{usuario?.correo}</Text>
      <Text style={styles.rol}>Rol: {usuario?.rol}</Text>
      <Pressable style={styles.boton} onPress={async () => {
  await quitarPush();
  dispatch(cerrarSesion());
}}>
        <Text style={styles.botonTxt}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  nombre: { fontSize: 22, fontWeight: 'bold' },
  rol: { color: '#555', marginBottom: 16 },
  boton: { backgroundColor: '#b91c1c', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  botonTxt: { color: '#fff', fontWeight: '600' },
});