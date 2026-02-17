import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

const UPI_APPS = [
  { name: 'Google Pay', package: 'com.google.android.apps.nbu.paisa.user', icon: '💳' },
  { name: 'PhonePe', package: 'com.phonepe.app', icon: '💜' },
  { name: 'Paytm', package: 'net.one97.paytm', icon: '💙' },
  { name: 'CRED', package: 'com.dreamplug.androidapp', icon: '🎯' },
  { name: 'Amazon Pay', package: 'in.amazon.mShop.android.shopping', icon: '🛒' },
  { name: 'BHIM', package: 'in.org.npci.upiapp', icon: '🏦' },
  { name: 'WhatsApp', package: 'com.whatsapp', icon: '💬' },
];

export default function WalletListScreen({ navigation }) {
  const [installedApps, setInstalledApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectInstalledApps();
  }, []);

  const detectInstalledApps = () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Not Supported', 'UPI payments are only supported on Android');
      setLoading(false);
      return;
    }

    // On Android, we'll show all apps and let the system handle which ones can respond
    // Real detection would require native module or checking via Intent
    setInstalledApps(UPI_APPS);
    setLoading(false);
  };

  const buildUpiUri = () => {
    const params = {
      pa: '8948492799@upi',
      pn: 'Test Merchant',
      am: '1.00',
      cu: 'INR',
      tn: 'Test Payment',
      tr: `TXN${Date.now()}`, // Transaction reference
      url: 'upipaymentdemo://payment', // Callback URL
    };

    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    return `upi://pay?${queryString}`;
  };

  const handleWalletSelect = async (app) => {
    try {
      const upiUri = buildUpiUri();
      
      if (Platform.OS === 'android') {
        // Use generic UPI intent - let Android choose available UPI apps
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: upiUri,
        });

        // Navigate to result screen after a delay
        // In real scenario, the app would be backgrounded and resumed via deep link
        setTimeout(() => {
          navigation.navigate('PaymentResult', {
            status: 'pending',
            message: 'Waiting for payment confirmation...',
          });
        }, 1000);
      } else {
        Alert.alert('Error', 'UPI payments only work on Android');
      }
    } catch (error) {
      console.error('Error launching UPI app:', error);
      Alert.alert(
        'Error',
        `Unable to launch UPI payment. Please ensure you have a UPI app installed.\n\nError: ${error.message}`
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Detecting UPI apps...</Text>
      </View>
    );
  }

  if (installedApps.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>❌ No UPI apps detected</Text>
        <Text style={styles.emptySubtext}>
          Please install a UPI-enabled app like Google Pay, PhonePe, or Paytm
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Select a UPI app to pay ₹1.00</Text>
      
      {installedApps.map((app, index) => (
        <TouchableOpacity
          key={index}
          style={styles.appCard}
          onPress={() => handleWalletSelect(app)}
        >
          <Text style={styles.appIcon}>{app.icon}</Text>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>{app.name}</Text>
            <Text style={styles.appPackage}>{app.package}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.note}>
        💡 Tap any app to initiate payment. You'll be redirected to the wallet app.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#333',
    marginTop: 50,
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    paddingHorizontal: 30,
  },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  appIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  appPackage: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: '#ccc',
  },
  note: {
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
    lineHeight: 20,
  },
});
