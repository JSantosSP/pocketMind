import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import React from 'react';
import SettingsScreen from './screens/SettingsScreen';
import TransactionScreen from './screens/TransactionScreen';
import CreateSavingGroupScreen from './screens/CreateSavingGroupScreen';
import CreateTransactionGroupScreen from './screens/CreateTransactionGroupScreen';
const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Cuenta' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} options={{ title: 'Crear Cuenta' }} />
      <Stack.Screen name="Transaction" component={TransactionScreen} options={{ title: 'Transaccion' }} />
      <Stack.Screen name="CreateSavingGroupScreen" component={CreateSavingGroupScreen} options={{ title: 'Crear Grupo' }} />
      <Stack.Screen name="CreateTransactionGroupScreen" component={CreateTransactionGroupScreen} options={{ title: 'Transaction Group' }} />
    </Stack.Navigator>
  );
};

export default Navigation;
