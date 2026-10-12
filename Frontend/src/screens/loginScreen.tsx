import { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { login, limpiarError } from '../redux/slices/authSlice';
import type { AuthStackParams } from '../navigation/AppNavigation';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { cargando, error } = useAppSelector((puntero) => puntero.auth);
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');

  const entrar = () => {
    dispatch(login({ correo: correo.trim(), clave }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.titulo}>AppCine</Text>
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
        placeholder="Clave"
        secureTextEntry
        value={clave}
        onChangeText={setClave}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.boton} onPress={entrar} disabled={cargando}>
        {cargando ? <ActivityIndicator /> : <Text style={styles.botonTxt}>Entrar</Text>}
      </Pressable>
      <Pressable
        onPress={() => {
          dispatch(limpiarError());
          navigation.navigate('Registro');
        }}
      >
        <Text style={styles.enlace}>Crear cuenta</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  titulo: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  boton: { backgroundColor: '#1e3a8a', padding: 14, borderRadius: 8, alignItems: 'center' },
  botonTxt: { fontWeight: '600' },
  error: { color: '#b91c1c' },
  enlace: { color: '#1e3a8a', textAlign: 'center', marginTop: 8 },
});