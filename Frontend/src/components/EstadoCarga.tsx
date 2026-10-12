import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  cargando: boolean;
  error: string | null;
  vacio?: boolean;
  textoVacio?: string;
  onReintentar?: () => void;
}

export default function EstadoCarga({
  cargando, error, vacio = false, textoVacio = 'Sin resultados', onReintentar,
}: Props) {
  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.centro}>
        <Text style={styles.error}>{error}</Text>
        {onReintentar ? (
          <Pressable style={styles.boton} onPress={onReintentar}>
            <Text style={styles.botonTxt}>Reintentar</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
  if (vacio) {
    return (
      <View style={styles.centro}>
        <Text>{textoVacio}</Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  centro: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  error: { color: '#b91c1c', textAlign: 'center' },
  boton: { backgroundColor: '#1e3a8a', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  botonTxt: { color: '#fff', fontWeight: '600' },
});