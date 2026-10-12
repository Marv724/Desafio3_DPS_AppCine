import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface Props {
  valor: string;
  tamano?: number;
}

export default function BoletoQR({ valor, tamano = 200 }: Props) {
  return (
    <View style={styles.marco}>
      <QRCode value={valor} size={tamano} />
    </View>
  );
}

const styles = StyleSheet.create({
  marco: { padding: 12, backgroundColor: '#fff', borderRadius: 12, alignSelf: 'center' },
});