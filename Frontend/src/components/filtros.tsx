import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

interface Props {
  opciones: string[];
  seleccionado: string;
  onSeleccion: (valor: string) => void;
}

export default function Filtros({ opciones, seleccionado, onSeleccion }: Props) {
  const todas = ['', ...opciones]; // '' = sin filtro
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.fila}
      style={styles.scroll}
    >
      {todas.map((o) => {
        const activo = o === seleccionado;
        return (
          <Pressable
            key={o || 'todos'}
            style={[styles.chip, activo && styles.chipActivo]}
            onPress={() => onSeleccion(o)}
          >
            <Text style={[styles.txt, activo && styles.txtActivo]}>{o || 'Todos'}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  fila: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e3a8a',
  },
  chipActivo: { backgroundColor: '#1e3a8a' },
  txt: { color: '#1e3a8a' },
  txtActivo: { color: '#fff' },
});