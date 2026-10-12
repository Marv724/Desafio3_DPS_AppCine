import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../redux/hook';
import LoginScreen from '../screens/loginScreen';
import RegistroScreen from '../screens/registroScreen';
import PerfilScreen from '../screens/perfilScreen';
import PeliculasScreen from '../screens/PeliculasScreen';
import DetallePeliculaScreen from '../screens/DetallePeliculaScreen';
import MapaAsientosScreen from '../screens/MapaAsientosScreen';
export type AuthStackParams = {
  Login: undefined;
  Registro: undefined;
};

export type RootStackParams = {
  Tabs: undefined;
  DetallePelicula: { peliculaId: number };
  MapaAsientos: { funcionId: number };
};

const RootStack = createNativeStackNavigator<RootStackParams>();

const AuthStack = createNativeStackNavigator<AuthStackParams>();
const Tab = createBottomTabNavigator();

function Pendiente({ route }: { route: { name: string } }) {
  return (
    <View style={styles.centro}>
      <Text>{route.name} (pendiente)</Text>
    </View>
  );
}

function ClienteTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Películas" component={PeliculasScreen} />
      <Tab.Screen name="Cines" component={Pendiente} />
      <Tab.Screen name="Mis boletos" component={Pendiente} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

function PersonalTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={Pendiente} />
      <Tab.Screen name="Catálogo" component={PeliculasScreen} />
      <Tab.Screen name="Funciones" component={Pendiente} />
      <Tab.Screen name="Escáner" component={Pendiente} />
      <Tab.Screen name="Avisos" component={Pendiente} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

function Tabs() {
  const rol = useAppSelector((s) => s.auth.usuario?.rol);
  return rol === 'personal' ? <PersonalTabs /> : <ClienteTabs />;
}

export default function AppNavigator() {
  const { usuario, restaurando } = useAppSelector((s) => s.auth);

  if (restaurando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

 return (
  <NavigationContainer>
    {!usuario ? (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Registro" component={RegistroScreen} />
      </AuthStack.Navigator>
    ) : (
      <RootStack.Navigator>
        <RootStack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <RootStack.Screen
          name="DetallePelicula"
          component={DetallePeliculaScreen}
          options={{ title: 'Detalle' }}
        />
        <RootStack.Screen
          name="MapaAsientos"
          component={MapaAsientosScreen}
          options={{ title: 'Asientos' }}
        />
      </RootStack.Navigator>
    )}
  </NavigationContainer>
);
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});