import { Pressable, StyleSheet, Text } from 'react-native';

interface Props {
  codigo: string;
  estado: 'libre' | 'ocupado';
  seleccionado: boolean;
  onPress: () => void;
}

export default function Asiento({ codigo, estado, seleccionado, onPress }: Props) {
  const ocupado = estado === 'ocupado';
  return (
    <Pressable
      disabled={ocupado}
      onPress={onPress}
      style={[styles.celda, ocupado && styles.ocupado, seleccionado && styles.seleccionado]}
    >
      <Text style={[styles.txt, (ocupado || seleccionado) && styles.txtClaro]}>{codigo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  celda: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  ocupado: { backgroundColor: '#9ca3af', borderColor: '#9ca3af' },
  seleccionado: { backgroundColor: '#1e3a8a', borderColor: '#1e3a8a' },
  txt: { fontSize: 9, color: '#065f46' },
  txtClaro: { color: '#fff' },
});