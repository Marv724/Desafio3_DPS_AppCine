import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { cargarAsientos, limpiarMapa } from '../redux/slices/funcionesSlice';
import { crearReserva } from '../redux/slices/reservasSlice';
import AsientoCelda from '../components/asiento';
import EstadoCarga from '../components/EstadoCarga';
import { formatearFecha } from '../lib/fecha';
import type { Asiento } from '../types/funcion';
import type { RootStackParams } from '../navigation/AppNavigation';
import { programarRecordatorio } from '../lib/notifications';

type Props = NativeStackScreenProps<RootStackParams, 'MapaAsientos'>;

const MAX_ASIENTOS = 10;

export default function MapaAsientosScreen({ route, navigation }: Props) {
  const { funcionId } = route.params;
  const dispatch = useAppDispatch();
  const { mapa, cargando, error } = useAppSelector((s) => s.funciones);
  const creando = useAppSelector((s) => s.reservas.creando);
  const [seleccion, setSeleccion] = useState<string[]>([]);

  const cargar = useCallback(() => {
    dispatch(cargarAsientos(funcionId));
  }, [dispatch, funcionId]);

  useEffect(() => {
    dispatch(limpiarMapa());
    cargar();
  }, [dispatch, cargar]);

  const filas = useMemo(() => {
    const m = new Map<string, Asiento[]>();
    mapa?.asientos.forEach((a) => {
      m.set(a.fila, [...(m.get(a.fila) ?? []), a]);
    });
    return [...m.entries()];
  }, [mapa]);

  const alternar = (codigo: string) => {
    setSeleccion((prev) => {
      if (prev.includes(codigo)) return prev.filter((x) => x !== codigo);
      if (prev.length >= MAX_ASIENTOS) return prev;
      return [...prev, codigo];
    });
  };

  const comprar = async () => {
 try {
  const r = await dispatch(crearReserva({ funcionId, asientos: seleccion })).unwrap();
  let recordatorio = false;
  if (mapa) {
    recordatorio = await programarRecordatorio(r.codigo, mapa.funcion.pelicula, mapa.funcion.fecha_hora);
  }
  Alert.alert(
    'Reserva confirmada',
    `Tu código es ${r.codigo}${recordatorio ? '\nTe avisaremos 1 hora antes de la función.' : ''}`,
    [{ text: 'OK', onPress: () => navigation.popToTop() }]
  );
} catch (e) {
      Alert.alert('No se pudo reservar', typeof e === 'string' ? e : 'Error inesperado');
      setSeleccion([]);
      cargar();
    }
  };

  if (!mapa) {
    return (
      <EstadoCarga cargando={cargando} error={error} onReintentar={cargar} />
    );
  }

  const total = seleccion.length * Number(mapa.funcion.precio);

  return (
    <View style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>{mapa.funcion.pelicula}</Text>
        <Text style={styles.sub}>{`${formatearFecha(mapa.funcion.fecha_hora)} · ${mapa.funcion.sala}`}</Text>

        <View style={styles.pantalla}>
          <Text style={styles.pantallaTxt}>PANTALLA</Text>
        </View>

        {filas.map(([fila, asientos]) => (
          <View key={fila} style={styles.fila}>
            {asientos.map((a) => (
              <AsientoCelda
                key={a.codigo}
                codigo={a.codigo}
                estado={a.estado}
                seleccionado={seleccion.includes(a.codigo)}
                onPress={() => alternar(a.codigo)}
              />
            ))}
          </View>
        ))}

        <View style={styles.leyenda}>
          <Text style={styles.leyendaTxt}>Verde: libre</Text>
          <Text style={styles.leyendaTxt}>Azul: tuyo</Text>
          <Text style={styles.leyendaTxt}>Gris: ocupado</Text>
        </View>
      </ScrollView>

      <View style={styles.pie}>
        <View style={styles.resumen}>
          <Text style={styles.resumenTxt}>
            {seleccion.length ? seleccion.join(', ') : 'Elige tus asientos'}
          </Text>
          <Text style={styles.total}>{`Total: $${total.toFixed(2)}`}</Text>
        </View>
        <Pressable
          style={[styles.boton, (seleccion.length === 0 || creando) && styles.botonOff]}
          onPress={comprar}
          disabled={seleccion.length === 0 || creando}
        >
          {creando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTxt}>Reservar</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  scroll: { padding: 12, gap: 4 },
  titulo: { fontSize: 20, fontWeight: 'bold' },
  sub: { color: '#555', marginBottom: 8 },
  pantalla: {
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    marginVertical: 12,
  },
  pantallaTxt: { fontSize: 12, color: '#555', letterSpacing: 4 },
  fila: { flexDirection: 'row' },
  leyenda: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
  leyendaTxt: { fontSize: 12, color: '#555' },
  pie: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  resumen: { flex: 1, gap: 2 },
  resumenTxt: { color: '#555' },
  total: { fontWeight: 'bold', fontSize: 16 },
  boton: { backgroundColor: '#1e3a8a', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 8 },
  botonOff: { backgroundColor: '#9ca3af' },
  botonTxt: { color: '#fff', fontWeight: '600' },
});