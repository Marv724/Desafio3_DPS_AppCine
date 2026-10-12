import { useCallback, useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { cargarFunciones } from '../redux/slices/funcionesSlice';
import EstadoCarga from '../components/EstadoCarga';
import { formatearFecha } from '../lib/fecha';
import type { RootStackParams } from '../navigation/AppNavigation';

type Props = NativeStackScreenProps<RootStackParams, 'DetallePelicula'>;

export default function DetallePeliculaScreen({ route, navigation }: Props) {
  const { peliculaId } = route.params;
  const dispatch = useAppDispatch();
  const pelicula = useAppSelector((s) => s.peliculas.items.find((p) => p.id === peliculaId));
  const { items, cargando, error } = useAppSelector((s) => s.funciones);

  const cargar = useCallback(() => {
    dispatch(cargarFunciones(peliculaId));
  }, [dispatch, peliculaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const programadas = items.filter((f) => f.estado === 'programada');

  return (
    <View style={styles.contenedor}>
      <View style={styles.cabecera}>
        <Text style={styles.titulo}>{pelicula?.nombre ?? 'Película'}</Text>
        {pelicula ? (
          <Text style={styles.detalle}>
            {[
              pelicula.genero,
              pelicula.duracion ? `${pelicula.duracion} min` : null,
              pelicula.clasificacion ? `Clasif. ${pelicula.clasificacion}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        ) : null}
        {pelicula ? <Text style={styles.precio}>{`$${Number(pelicula.precio).toFixed(2)} por boleto`}</Text> : null}
      </View>

      <Text style={styles.subtitulo}>Funciones disponibles</Text>

      <EstadoCarga
        cargando={cargando}
        error={error}
        vacio={!cargando && !error && programadas.length === 0}
        textoVacio="No hay funciones programadas"
        onReintentar={cargar}
      />

      <FlatList
        data={programadas}
        keyExtractor={(f) => String(f.id)}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <Pressable
            style={styles.fila}
            onPress={() => navigation.navigate('MapaAsientos', { funcionId: item.id })}
          >
            <View style={styles.info}>
              <Text style={styles.fecha}>{formatearFecha(item.fecha_hora)}</Text>
              <Text style={styles.sala}>{`${item.cine} · ${item.sala}`}</Text>
            </View>
            <Text style={styles.elegir}>Elegir asientos</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  cabecera: { padding: 16, gap: 4 },
  titulo: { fontSize: 22, fontWeight: 'bold' },
  detalle: { color: '#555' },
  precio: { color: '#1e3a8a', fontWeight: '600' },
  subtitulo: { fontSize: 16, fontWeight: '600', paddingHorizontal: 16, paddingBottom: 4 },
  lista: { paddingBottom: 24 },
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
  info: { flex: 1, gap: 2 },
  fecha: { fontWeight: '600' },
  sala: { color: '#555' },
  elegir: { color: '#1e3a8a', fontWeight: '600' },
});