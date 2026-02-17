import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';

export default function PaymentResultScreen({ navigation, route }) {
  const [paymentStatus, setPaymentStatus] = useState({
    status: route.params?.status || 'pending',
    message: route.params?.message || 'Processing...',
    txnId: null,
    responseCode: null,
  });

  console.log({paymentStatus});
  

  useEffect(() => {
    // Listen for deep link when app returns from payment
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => subscription.remove();
  }, []);

  const handleDeepLink = ({ url }) => {
    console.log('Payment result URL:', url);
    
    // Parse URL parameters
    // Expected format: upipaymentdemo://payment?status=success&txnId=ABC123&responseCode=00
    const parsed = Linking.parse(url);
    const params = parsed.queryParams || {};

    if (params.status) {
      setPaymentStatus({
        status: params.status,
        message: getStatusMessage(params.status),
        txnId: params.txnId || params.txnRef || 'N/A',
        responseCode: params.responseCode || params.ApprovalRefNo || 'N/A',
      });
    }
  };

  const getStatusMessage = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'Payment completed successfully!';
      case 'failed':
      case 'failure':
        return 'Payment failed. Please try again.';
      case 'cancelled':
      case 'cancel':
        return 'Payment was cancelled by user.';
      default:
        return 'Payment status unknown.';
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus.status?.toLowerCase()) {
      case 'success':
        return '✅';
      case 'failed':
      case 'failure':
        return '❌';
      case 'cancelled':
      case 'cancel':
        return '⚠️';
      default:
        return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus.status?.toLowerCase()) {
      case 'success':
        return '#4caf50';
      case 'failed':
      case 'failure':
        return '#f44336';
      case 'cancelled':
      case 'cancel':
        return '#ff9800';
      default:
        return '#2196f3';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.resultCard}>
        <Text style={styles.icon}>{getStatusIcon()}</Text>
        
        <Text style={[styles.status, { color: getStatusColor() }]}>
          {paymentStatus.status?.toUpperCase()}
        </Text>
        
        <Text style={styles.message}>{paymentStatus.message}</Text>

        {paymentStatus.txnId && paymentStatus.txnId !== 'N/A' && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID:</Text>
            <Text style={styles.detailValue}>{paymentStatus.txnId}</Text>
          </View>
        )}

        {paymentStatus.responseCode && paymentStatus.responseCode !== 'N/A' && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Response Code:</Text>
            <Text style={styles.detailValue}>{paymentStatus.responseCode}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.homeButtonText}>Back to Home</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ Testing Notes:</Text>
        <Text style={styles.infoText}>
          • Real UPI apps may not return to this app automatically{'\n'}
          • Response parsing depends on wallet app implementation{'\n'}
          • Use test UPI IDs only - no real transactions{'\n'}
          • Deep link: upipaymentdemo://payment
        </Text>
      </View>
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
  resultCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    marginBottom: 20,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  status: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  detailRow: {
    width: '100%',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#856404',
  },
  infoText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 18,
  },
});
