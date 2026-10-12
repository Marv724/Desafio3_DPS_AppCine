import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import {
  cambiarEstadoPelicula, eliminarPelicula, guardarPelicula,
} from '../redux/slices/peliculaSlice';
import type { PeliculaForm } from '../redux/slices/peliculaSlice';
import type { EstadoPelicula } from '../types/pelicula';
import type { RootStackParams } from '../navigation/AppNavigation';

type Props = NativeStackScreenProps<RootStackParams, 'FormularioPelicula'>;

export default function FormularioPeliculaScreen({ route, navigation }: Props) {
  const id = route.params?.peliculaId;
  const dispatch = useAppDispatch();
  const existente = useAppSelector((s) => s.peliculas.items.find((p) => p.id === id));

  const [codigo, setCodigo] = useState(existente?.codigo ?? '');
  const [nombre, setNombre] = useState(existente?.nombre ?? '');
  const [genero, setGenero] = useState(existente?.genero ?? '');
  const [duracion, setDuracion] = useState(existente?.duracion ? String(existente.duracion) : '');
  const [clasificacion, setClasificacion] = useState(existente?.clasificacion ?? '');
  const [precio, setPrecio] = useState(existente?.precio ? String(Number(existente.precio)) : '');
  const [estado, setEstado] = useState<EstadoPelicula>(existente?.estado ?? 'disponible');

  const guardar = async () => {
    const precioNum = Number(precio);
    if (!codigo.trim() || !nombre.trim() || precio.trim() === '' || Number.isNaN(precioNum) || precioNum < 0) {
      Alert.alert('Datos incompletos', 'Código, nombre y un precio válido son obligatorios');
      return;
    }
    const datos: PeliculaForm = {
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      precio: precioNum,
      estado,
      genero: genero.trim() || undefined,
      duracion: duracion.trim() ? Number(duracion) : undefined,
      clasificacion: clasificacion.trim() || undefined,
    };
    try {
      await dispatch(guardarPelicula({ id, datos })).unwrap();
      navigation.goBack();
    } catch (e) {
      // Aquí llega el 409 de "El código ya existe"
      Alert.alert('No se pudo guardar', typeof e === 'string' ? e : 'Error inesperado');
    }
  };

  const alternarEstado = async () => {
    if (!id) return;
    const nuevo: EstadoPelicula = estado === 'disponible' ? 'no_disponible' : 'disponible';
    try {
      await dispatch(cambiarEstadoPelicula({ id, estado: nuevo })).unwrap();
      setEstado(nuevo);
    } catch (e) {
      Alert.alert('No se pudo cambiar', typeof e === 'string' ? e : 'Error inesperado');
    }
  };

  const borrar = () => {
    if (!id) return;
    Alert.alert('Eliminar película', '¿Seguro? Se borrarán también sus funciones.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(eliminarPelicula(id)).unwrap();
            navigation.goBack();
          } catch (e) {
            // Aquí llega el 409 de "tiene reservas activas"
            Alert.alert('No se pudo eliminar', typeof e === 'string' ? e : 'Error inesperado');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor} keyboardShouldPersistTaps="handled">
      <TextInput style={styles.input} placeholder="Código (ej. PEL007)" autoCapitalize="characters" value={codigo} onChangeText={setCodigo} />
      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Género" value={genero} onChangeText={setGenero} />
      <TextInput style={styles.input} placeholder="Duración (minutos)" keyboardType="numeric" value={duracion} onChangeText={setDuracion} />
      <TextInput style={styles.input} placeholder="Clasificación (A, B, C)" autoCapitalize="characters" value={clasificacion} onChangeText={setClasificacion} />
      <TextInput style={styles.input} placeholder="Precio" keyboardType="decimal-pad" value={precio} onChangeText={setPrecio} />

      {!id ? (
        <View style={styles.fila}>
          <Text>Disponible</Text>
          <Switch
            value={estado === 'disponible'}
            onValueChange={(v) => setEstado(v ? 'disponible' : 'no_disponible')}
          />
        </View>
      ) : null}

      <Pressable style={styles.boton} onPress={guardar}>
        <Text style={styles.botonTxt}>{id ? 'Guardar cambios' : 'Crear película'}</Text>
      </Pressable>

      {id ? (
        <>
          <Pressable style={styles.botonSec} onPress={alternarEstado}>
            <Text style={styles.botonSecTxt}>
              {estado === 'disponible' ? 'Marcar como no disponible' : 'Marcar como disponible'}
            </Text>
          </Pressable>
          <Pressable style={styles.botonPeligro} onPress={borrar}>
            <Text style={styles.botonTxt}>Eliminar película</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 16, gap: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  boton: { backgroundColor: '#1e3a8a', padding: 14, borderRadius: 8, alignItems: 'center' },
  botonTxt: { color: '#fff', fontWeight: '600' },
  botonSec: { borderWidth: 1, borderColor: '#1e3a8a', padding: 14, borderRadius: 8, alignItems: 'center' },
  botonSecTxt: { color: '#1e3a8a', fontWeight: '600' },
  botonPeligro: { backgroundColor: '#b91c1c', padding: 14, borderRadius: 8, alignItems: 'center' },
});