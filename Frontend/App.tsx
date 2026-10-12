import { StatusBar } from 'expo-status-bar';
import { AppRegistry, StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import { Store } from '@reduxjs/toolkit';
import { restaurarSesion } from './src/redux/slices/authSlice';
import AppNavigator from './src/navigation/AppNavigation';
import { store } from './src/redux/store';
import { Provider } from 'react-redux';

export default function App() {
  useEffect(() => {
    store.dispatch(restaurarSesion());
  }, []);
    return (
      <Provider store={store}>
        <AppNavigator />
      </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
