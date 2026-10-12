import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { cargarTodasFunciones } from '../redux/slices/funcionesSlice';
import { cargarPeliculas } from '../redux/slices/peliculaSlice';
import { api } from '../services/api';
import Filtros from '../components/filtros';
import EstadoCarga from '../components/EstadoCarga';
import { formatearFecha } from '../lib/fecha';
import type { Sala } from '../types/cine';

export default function FuncionesScreen() {
  const dispatch = useAppDispatch();
  const { items, cargando, error } = useAppSelector((s) => s.funciones);
  const peliculas = useAppSelector((s) => s.peliculas.items);

  const [salas, setSalas] = useState<Sala[]>([]);
  const [peliculaSel, setPeliculaSel] = useState('');
  const [salaSel, setSalaSel] = useState('');
  const [fecha, setFecha] = useState('');
  const [reprog, setReprog] = useState<{ id: number; texto: string } | null>(null);

  const cargar = useCallback(() => {
    dispatch(cargarTodasFunciones());
    dispatch(cargarPeliculas());
    api<Sala[]>('/cines/salas').then(setSalas).catch(() => {});
  }, [dispatch]);

  useFocusEffect(cargar);

  const etiquetaSala = (s: Sala) => `${s.cine} · ${s.nombre}`;

  const crear = async () => {
    const p = peliculas.find((x) => x.nombre === peliculaSel);
    const s = salas.find((x) => etiquetaSala(x) === salaSel);
    if (!p || !s || !fecha.trim()) {
      Alert.alert('Datos incompletos', 'Elige película y sala, y escribe la fecha');
      return;
    }
    try {
      await api('/funciones', {
        method: 'POST',
        body: { peliculaId: p.id, salaId: s.id, fechaHora: fecha.trim() },
      });
      setFecha('');
      cargar();
    } catch (e) {
      Alert.alert('No se pudo crear', (e as Error).message); // incluye el 409 de horario ocupado
    }
  };

  const guardarReprogramacion = async () => {
    if (!reprog) return;
    try {
      await api(`/funciones/${reprog.id}`, { method: 'PUT', body: { fechaHora: reprog.texto.trim() } });
      setReprog(null);
      cargar();
      Alert.alert('Función reprogramada', 'Se avisó a los clientes con reserva.');
    } catch (e) {
      Alert.alert('No se pudo reprogramar', (e as Error).message);
    }
  };

  const cancelar = (id: number) => {
    Alert.alert('Cancelar función', 'Se cancelarán las reservas y se avisará a los clientes.', [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Cancelar función',
        style: 'destructive',
        onPress: async () => {
          try {
            const r = await api<{ clientesAvisados: number }>(`/funciones/${id}/cancelar`, { method: 'PATCH' });
            cargar();
            Alert.alert('Función cancelada', `Clientes avisados: ${r.clientesAvisados}`);
          } catch (e) {
            Alert.alert('No se pudo cancelar', (e as Error).message);
          }
        },
      },
    ]);
  };

  const formulario = (
    <View style={styles.form}>
      <Text style={styles.seccion}>Nueva función</Text>
      <Text style={styles.etiqueta}>Película</Text>
      <Filtros opciones={peliculas.map((p) => p.nombre)} seleccionado={peliculaSel} onSeleccion={setPeliculaSel} />
      <Text style={styles.etiqueta}>Sala</Text>
      <Filtros opciones={salas.map(etiquetaSala)} seleccionado={salaSel} onSeleccion={setSalaSel} />
      <TextInput
        style={styles.input}
        placeholder="Fecha y hora: AAAA-MM-DD HH:mm"
        value={fecha}
        onChangeText={setFecha}
        autoCapitalize="none"
      />
      <Pressable style={styles.boton} onPress={crear}>
        <Text style={styles.botonTxt}>Crear función</Text>
      </Pressable>
      <Text style={styles.seccion}>Funciones</Text>
      <EstadoCarga
        cargando={cargando && items.length === 0}
        error={error}
        vacio={!cargando && !error && items.length === 0}
        textoVacio="No hay funciones"
        onReintentar={cargar}
      />
    </View>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(f) => String(f.id)}
      ListHeaderComponent={formulario}
      refreshing={cargando && items.length > 0}
      onRefresh={cargar}
      contentContainerStyle={styles.lista}
      renderItem={({ item }) => (
        <View style={styles.fila}>
          <Text style={styles.pelicula}>{item.pelicula}</Text>
          <Text style={styles.sub}>{`${formatearFecha(item.fecha_hora)} · ${item.cine} · ${item.sala}`}</Text>
          <Text style={[styles.sub, item.estado !== 'programada' && styles.inactiva]}>{item.estado}</Text>

          {item.estado === 'programada' ? (
            reprog?.id === item.id ? (
              <View style={styles.acciones}>
                <TextInput
                  style={[styles.input, styles.inputReprog]}
                  value={reprog.texto}
                  onChangeText={(t) => setReprog({ id: item.id, texto: t })}
                  autoCapitalize="none"
                />
                <Pressable style={styles.boton} onPress={guardarReprogramacion}>
                  <Text style={styles.botonTxt}>Guardar</Text>
                </Pressable>
                <Pressable style={styles.botonSec} onPress={() => setReprog(null)}>
                  <Text style={styles.botonSecTxt}>X</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.acciones}>
                <Pressable
                  style={styles.botonSec}
                  onPress={() =>
                    setReprog({ id: item.id, texto: item.fecha_hora.slice(0, 16).replace('T', ' ') })
                  }
                >
                  <Text style={styles.botonSecTxt}>Reprogramar</Text>
                </Pressable>
                <Pressable style={styles.botonPeligro} onPress={() => cancelar(item.id)}>
                  <Text style={styles.botonTxt}>Cancelar</Text>
                </Pressable>
              </View>
            )
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  lista: { paddingBottom: 24 },
  form: { padding: 12, gap: 6 },
  seccion: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  etiqueta: { color: '#555' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  inputReprog: { flex: 1 },
  fila: { backgroundColor: '#f3f4f6', borderRadius: 10, padding: 12, marginHorizontal: 12, marginVertical: 5, gap: 2 },
  pelicula: { fontWeight: '600', fontSize: 16 },
  sub: { color: '#555' },
  inactiva: { color: '#b91c1c' },
  acciones: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  boton: { backgroundColor: '#1e3a8a', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  botonTxt: { color: '#fff', fontWeight: '600' },
  botonSec: { borderWidth: 1, borderColor: '#1e3a8a', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  botonSecTxt: { color: '#1e3a8a', fontWeight: '600' },
  botonPeligro: { backgroundColor: '#b91c1c', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
});