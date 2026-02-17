import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  const handlePayNow = () => {
    navigation.navigate('WalletList');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UPI Payment Test</Text>
      
      <View style={styles.detailsCard}>
        <Text style={styles.label}>Amount:</Text>
        <Text style={styles.amount}>₹1.00</Text>
        
        <Text style={styles.label}>Payee:</Text>
        <Text style={styles.value}>test@upi</Text>
        
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>Test Merchant</Text>
      </View>

      <TouchableOpacity 
        style={styles.payButton}
        onPress={handlePayNow}
      >
        <Text style={styles.payButtonText}>Pay Now</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        ⚠️ This is a test app. Use dummy UPI ID only.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  detailsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 10,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  payButton: {
    backgroundColor: '#6200ee',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    marginTop: 20,
    textAlign: 'center',
    color: '#ff6b6b',
    fontSize: 12,
  },
});
