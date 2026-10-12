import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../redux/hook';

const Stack = createNativeStackNavigator();

function Provisonal(){
    const usuario = useAppSelector((puntero) => puntero.auth.usuario);
    return(
        <View style={styles.centro}>
            <Text>{usuario ? `Sesion: ${usuario.nombre} (${usuario.rol}`: 'Sin sesion'}</Text>
        </View>
    )
}

export default function AppNavigator(){
    const restaurar = useAppSelector((puntero) => puntero.auth.restaurando);
    if(restaurar){
        return(
            <View style={styles.centro}>
                <ActivityIndicator size={'large'} />
            </View>
        )
    }
    return(
    <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name='Inicio' component={Provisonal} />
        </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});