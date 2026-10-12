import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Pelicula } from '../types/pelicula';

interface Props {
  pelicula: Pelicula;
  onPress?: () => void;
}

export default function PeliculaFila({ pelicula, onPress }: Props) {
  const detalle = [
    pelicula.genero,
    pelicula.duracion ? `${pelicula.duracion} min` : null,
    pelicula.clasificacion ? `Clasif. ${pelicula.clasificacion}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable style={styles.fila} onPress={onPress}>
      <View style={styles.info}>
        <Text style={styles.nombre}>{pelicula.nombre}</Text>
        <Text style={styles.detalle}>{detalle}</Text>
        {pelicula.estado === 'no_disponible' ? (
          <Text style={styles.nodisp}>No disponible</Text>
        ) : null}
      </View>
      <Text style={styles.precio}>{`$${Number(pelicula.precio).toFixed(2)}`}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  nombre: { fontSize: 16, fontWeight: '600' },
  detalle: { color: '#555' },
  nodisp: { color: '#b91c1c', fontSize: 12 },
  precio: { fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' },
});