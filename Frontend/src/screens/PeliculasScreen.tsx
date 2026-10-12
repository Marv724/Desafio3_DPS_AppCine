import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Pressable,
  Text,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppDispatch, useAppSelector } from '../redux/hook';
import { cargarPeliculas } from '../redux/slices/peliculaSlice';

import Buscador from '../components/buscador';
import Filtros from '../components/filtros';
import PeliculaFila from '../components/peliculaFila';
import EstadoCarga from '../components/EstadoCarga';

import type { RootStackParams } from '../navigation/AppNavigation';

const GENEROS = [
  'Acción',
  'Animación',
  'Ciencia ficción',
  'Comedia',
  'Romance',
  'Terror',
];

const CLASIFICACIONES = ['A', 'B', 'C'];

export default function PeliculasScreen() {
  const dispatch = useAppDispatch();

  const { items, cargando, error } = useAppSelector(
    (s) => s.peliculas
  );

  const rol = useAppSelector((s) => s.auth.usuario?.rol);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParams>>();

  const [q, setQ] = useState('');
  const [genero, setGenero] = useState('');
  const [clasificacion, setClasificacion] = useState('');

  const cargar = useCallback(() => {
    dispatch(
      cargarPeliculas({
        q,
        genero,
        clasificacion,
        estado: rol === 'cliente' ? 'disponible' : '',
      })
    );
  }, [dispatch, q, genero, clasificacion, rol]);

  useEffect(() => {
    const t = setTimeout(cargar, 400);

    return () => clearTimeout(t);
  }, [cargar]);

  return (
    <View style={styles.contenedor}>
      <Buscador
        valor={q}
        onCambio={setQ}
        placeholder="Buscar por nombre o código"
      />

      <Filtros
        opciones={GENEROS}
        seleccionado={genero}
        onSeleccion={setGenero}
      />

      <Filtros
        opciones={CLASIFICACIONES}
        seleccionado={clasificacion}
        onSeleccion={setClasificacion}
      />

      <EstadoCarga
        cargando={cargando && items.length === 0}
        error={error}
        vacio={!cargando && !error && items.length === 0}
        textoVacio="No hay películas con esos filtros"
        onReintentar={cargar}
      />

      {rol === 'personal' && (
        <Pressable
          style={styles.nueva}
          onPress={() => navigation.navigate('FormularioPelicula')}
        >
          <Text style={styles.nuevaTxt}>+ Nueva película</Text>
        </Pressable>
      )}

      <FlatList
        data={items}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => (
          <PeliculaFila
            pelicula={item}
            onPress={() =>
              rol === 'personal'
                ? navigation.navigate('FormularioPelicula', {
                    peliculaId: item.id,
                  })
                : navigation.navigate('DetallePelicula', {
                    peliculaId: item.id,
                  })
            }
          />
        )}
        refreshing={cargando && items.length > 0}
        onRefresh={cargar}
        contentContainerStyle={styles.lista}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  lista: {
    paddingBottom: 24,
  },
  nueva: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  nuevaTxt: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});