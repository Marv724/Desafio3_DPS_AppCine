import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { cargarMisReservas } from '../redux/slices/reservasSlice';
import EstadoCarga from '../components/EstadoCarga';
import { formatearFecha } from '../lib/fecha';
import type { RootStackParams } from '../navigation/AppNavigation';

const COLOR = { activa: '#047857', utilizada: '#6b7280', cancelada: '#b91c1c' } as const;

export default function MisBoletosScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const { items, cargando, error } = useAppSelector((s) => s.reservas);

  const cargar = useCallback(() => {
    dispatch(cargarMisReservas());
  }, [dispatch]);

  // Se recarga cada vez que la pestaña recibe foco
  useFocusEffect(cargar);

  return (
    <View style={styles.contenedor}>
      <EstadoCarga
        cargando={cargando && items.length === 0}
        error={error}
        vacio={!cargando && !error && items.length === 0}
        textoVacio="Aún no tienes boletos"
        onReintentar={cargar}
      />
      <FlatList
        data={items}
        keyExtractor={(r) => String(r.id)}
        refreshing={cargando && items.length > 0}
        onRefresh={cargar}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <Pressable
            style={styles.fila}
            onPress={() => navigation.navigate('DetalleBoleto', { codigo: item.codigo })}
          >
            <View style={styles.info}>
              <Text style={styles.pelicula}>{item.pelicula}</Text>
              <Text style={styles.sub}>{`${formatearFecha(item.fecha_hora)} · ${item.cine}`}</Text>
              <Text style={styles.sub}>{`Asientos: ${item.asientos.join(', ')}`}</Text>
            </View>
            <Text style={[styles.estado, { color: COLOR[item.estado] }]}>{item.estado}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  lista: { paddingVertical: 8 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 5,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
  },
  info: { flex: 1, gap: 2, paddingRight: 8 },
  pelicula: { fontSize: 16, fontWeight: '600' },
  sub: { color: '#555' },
  estado: { fontWeight: '600', textTransform: 'capitalize' },
});