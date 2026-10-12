import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../services/api';

export default function EnviarAvisoScreen() {
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    if (!titulo.trim() || !mensaje.trim()) {
      Alert.alert('Datos incompletos', 'Escribe el título y el mensaje');
      return;
    }
    setEnviando(true);
    try {
      const r = await api<{ enviados: number }>('/notificaciones/aviso', {
        method: 'POST',
        body: { titulo: titulo.trim(), mensaje: mensaje.trim() },
      });
      Alert.alert('Aviso enviado', `Dispositivos alcanzados: ${r.enviados}`);
      setTitulo('');
      setMensaje('');
    } catch (e) {
      Alert.alert('No se pudo enviar', (e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.ayuda}>Se enviará una notificación push a todos los clientes registrados.</Text>
      <TextInput style={styles.input} placeholder="Título" maxLength={80} value={titulo} onChangeText={setTitulo} />
      <TextInput
        style={[styles.input, styles.mensaje]}
        placeholder="Mensaje"
        maxLength={250}
        multiline
        value={mensaje}
        onChangeText={setMensaje}
      />
      <Pressable style={styles.boton} onPress={enviar} disabled={enviando}>
        {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTxt}>Enviar aviso</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 16, gap: 12 },
  ayuda: { color: '#555' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  mensaje: { minHeight: 100, textAlignVertical: 'top' },
  boton: { backgroundColor: '#1e3a8a', padding: 14, borderRadius: 8, alignItems: 'center' },
  botonTxt: { color: '#fff', fontWeight: '600' },
});