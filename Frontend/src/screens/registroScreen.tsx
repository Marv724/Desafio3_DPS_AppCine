import { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  Pressable, StyleSheet, Text, TextInput,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { registro } from '../redux/slices/authSlice';
import type { AuthStackParams } from '../navigation/AppNavigation';

type Props = NativeStackScreenProps<AuthStackParams, 'Registro'>;

export default function RegistroScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { cargando, error } = useAppSelector((s) => s.auth);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');

  const crear = () => {
    dispatch(registro({ nombre: nombre.trim(), correo: correo.trim(), clave }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.titulo}>Crear cuenta</Text>
      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput
        style={styles.input}
        placeholder="Correo"
        autoCapitalize="none"
        keyboardType="email-address"
        value={correo}
        onChangeText={setCorreo}
      />
      <TextInput
        style={styles.input}
        placeholder="Clave (mínimo 6)"
        secureTextEntry
        value={clave}
        onChangeText={setClave}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.boton} onPress={crear} disabled={cargando}>
        {cargando ? <ActivityIndicator /> : <Text style={styles.botonTxt}>Registrarme</Text>}
      </Pressable>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.enlace}>Ya tengo cuenta</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  titulo: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  boton: { backgroundColor: '#1e3a8a', padding: 14, borderRadius: 8, alignItems: 'center' },
  botonTxt: {fontWeight: '600' },
  error: { color: '#b91c1c' },
  enlace: { color: '#1e3a8a', textAlign: 'center', marginTop: 8 },
});