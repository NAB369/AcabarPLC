import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { theme } from '../components/theme';
import { api } from '../services/api';

export function PaymentScreen({ route, navigation }: any) {
  const [loading, setLoading] = useState(false);
  
  // Extract data passed from HomeScreen
  const { loanId, emiId, amount } = route.params || {};

  const simulateKhqrPayment = async () => {
    if (!loanId || !amount) {
      Alert.alert("Error", "Missing loan information.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/repayments/simulate-khqr', {
        loanId: loanId,
        amount: Number(amount),
        paymentMethod: 'KHQR'
      });
      
      Alert.alert(
        "Payment Successful", 
        "Your KHQR payment has been recorded in the ledger.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert(
        "Payment Failed", 
        error.message || "There was an issue processing your payment.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Text style={theme.typography.h2}>Scan to Pay</Text>
        <Text style={[theme.typography.body, styles.subtitle]}>
          Use your preferred banking app to scan the KHQR code below.
        </Text>

        <Card style={styles.qrCard}>
          {/* Mock QR Code visually represented as a box */}
          <View style={styles.qrPlaceholder}>
            <View style={styles.qrInner}>
              <Text style={{ fontWeight: 'bold', color: theme.colors.primary, fontSize: 24 }}>KHQR</Text>
            </View>
          </View>
          
          <View style={styles.details}>
            <Text style={theme.typography.caption}>Amount Due</Text>
            <Text style={theme.typography.h1}>${Number(amount || 0).toFixed(2)}</Text>
          </View>
        </Card>

        <Button 
          title={loading ? "Processing..." : "Simulate KHQR Payment"} 
          onPress={simulateKhqrPayment}
          disabled={loading}
          style={{ width: '100%', marginTop: 'auto' }}
        />
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  qrCard: {
    width: '100%',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  qrPlaceholder: {
    width: 250,
    height: 250,
    backgroundColor: '#000',
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  qrInner: {
    width: 230,
    height: 230,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  }
});
