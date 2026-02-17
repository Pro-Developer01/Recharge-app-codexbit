import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import HomeScreen from './src/screens/HomeScreen';
import WalletListScreen from './src/screens/WalletListScreen';
import PaymentResultScreen from './src/screens/PaymentResultScreen';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['upipaymentdemo://'],
  config: {
    screens: {
      Home: 'home',
      WalletList: 'wallets',
      PaymentResult: 'payment',
    },
  },
};

export default function App() {
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('Deep link received:', url);
    });

    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#6200ee' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'UPI Payment Demo' }}
        />
        <Stack.Screen 
          name="WalletList" 
          component={WalletListScreen}
          options={{ title: 'Select Wallet' }}
        />
        <Stack.Screen 
          name="PaymentResult" 
          component={PaymentResultScreen}
          options={{ title: 'Payment Status' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
