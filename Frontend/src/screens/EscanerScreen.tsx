import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { api } from '../services/api';

export default function EscanerScreen() {
  const enfocada = useIsFocused();
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [ocupado, setOcupado] = useState(false);
  const [manual, setManual] = useState('');

  const validar = async (codigo: string) => {
    if (ocupado || !codigo.trim()) return;
    setOcupado(true);
    try {
      const r = await api<{ codigo: string; estado: string }>(
        `/reservas/${encodeURIComponent(codigo.trim())}/validar`,
        { method: 'PATCH' }
      );
      Alert.alert('Boleto válido', `${r.codigo} marcado como ${r.estado}`);
      setManual('');
    } catch (e) {
      // 404 no existe, 409 ya usado o cancelado
      Alert.alert('Boleto no válido', (e as Error).message);
    } finally {
      setTimeout(() => setOcupado(false), 1500); // evita lecturas repetidas del mismo QR
    }
  };

  if (!permiso) return <View style={styles.centro} />;

  if (!permiso.granted) {
    return (
      <View style={styles.centro}>
        <Text style={styles.texto}>Se necesita acceso a la cámara para leer los QR</Text>
        <Pressable style={styles.boton} onPress={pedirPermiso}>
          <Text style={styles.botonTxt}>Permitir cámara</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      {enfocada ? (
        <CameraView
          style={styles.camara}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={ocupado ? undefined : ({ data }) => validar(data)}
        />
      ) : (
        <View style={styles.camara} />
      )}
      <View style={styles.manual}>
        <TextInput
          style={styles.input}
          placeholder="O escribe el código (RES-XXXXXXXX)"
          autoCapitalize="characters"
          value={manual}
          onChangeText={setManual}
        />
        <Pressable style={styles.boton} onPress={() => validar(manual)}>
          <Text style={styles.botonTxt}>Validar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  camara: { flex: 1, backgroundColor: '#000' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  texto: { textAlign: 'center' },
  manual: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  boton: { backgroundColor: '#1e3a8a', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8 },
  botonTxt: { color: '#fff', fontWeight: '600' },
});