import { StyleSheet, TextInput } from 'react-native';

interface Props {
  valor: string;
  onCambio: (texto: string) => void;
  placeholder?: string;
}

export default function Buscador({ valor, onCambio, placeholder = 'Buscar...' }: Props) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={valor}
      onChangeText={onCambio}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginTop: 12,
  },
});