import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import EstadoCarga from '../components/EstadoCarga';
import type { Dashboard } from '../types/dashboard';

function Tarjeta({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <View style={styles.tarjeta}>
      <Text style={styles.valor}>{valor}</Text>
      <Text style={styles.titulo}>{titulo}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [datos, setDatos] = useState<Dashboard | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    api<Dashboard>('/dashboard')
      .then(setDatos)
      .catch((e: Error) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  useFocusEffect(cargar);

  if (!datos) return <EstadoCarga cargando={cargando} error={error} onReintentar={cargar} />;

  return (
    <ScrollView
      contentContainerStyle={styles.contenedor}
      refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
    >
      <View style={styles.rejilla}>
        <Tarjeta titulo="Ventas" valor={`$${datos.ventasTotales.toFixed(2)}`} />
        <Tarjeta titulo="Reservas" valor={String(datos.reservasTotales)} />
        <Tarjeta titulo="Boletos vendidos" valor={String(datos.boletosVendidos)} />
        <Tarjeta titulo="Clientes" valor={String(datos.clientes)} />
        <Tarjeta titulo="Funciones próximas" valor={String(datos.funcionesProximas)} />
      </View>

      <Text style={styles.seccion}>Reservas por estado</Text>
      {datos.reservasPorEstado.length === 0 ? <Text style={styles.vacio}>Sin reservas</Text> : null}
      {datos.reservasPorEstado.map((r) => (
        <View key={r.estado} style={styles.fila}>
          <Text style={styles.estado}>{r.estado}</Text>
          <Text style={styles.num}>{String(r.cantidad)}</Text>
        </View>
      ))}

      <Text style={styles.seccion}>Películas más vendidas</Text>
      {datos.peliculasTop.length === 0 ? <Text style={styles.vacio}>Sin ventas</Text> : null}
      {datos.peliculasTop.map((p) => (
        <View key={p.nombre} style={styles.fila}>
          <Text style={styles.estado}>{p.nombre}</Text>
          <Text style={styles.num}>{`${p.boletos} boletos`}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 16, gap: 6 },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tarjeta: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    padding: 14,
    gap: 2,
  },
  valor: { fontSize: 22, fontWeight: 'bold', color: '#1e3a8a' },
  titulo: { color: '#555' },
  seccion: { fontSize: 16, fontWeight: '600', marginTop: 16 },
  vacio: { color: '#777' },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
  },
  estado: { flex: 1, textTransform: 'capitalize' },
  num: { fontWeight: '600' },
});