import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { theme } from '../components/theme';
import { api } from '../services/api';

export function HomeScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [activeLoan, setActiveLoan] = useState<any>(null);
  const [nextEmi, setNextEmi] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userStr = await SecureStore.getItemAsync('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserName(user.firstName || 'Customer');
        }

        const loanData = await api.get('/loans/my-active');
        setActiveLoan(loanData);
        if (loanData.repaymentSchedules && loanData.repaymentSchedules.length > 0) {
          setNextEmi(loanData.repaymentSchedules[0]);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    // Re-fetch when screen comes into focus to catch payment updates
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });

    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.header}>
          <Text style={theme.typography.h1}>Welcome back, {userName}</Text>
          <Text style={theme.typography.caption}>Mobile Customer Dashboard</Text>
        </View>

        {activeLoan ? (
          <>
            <Card style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Original Principal</Text>
              <Text style={styles.balanceAmount}>${Number(activeLoan.principalAmount).toLocaleString()}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{activeLoan.status}</Text>
              </View>
            </Card>

            {nextEmi && (
              <>
                <Text style={[theme.typography.h2, styles.sectionTitle]}>Upcoming Payment</Text>
                <Card style={styles.emiCard}>
                  <View style={styles.emiRow}>
                    <Text style={theme.typography.body}>Due Date:</Text>
                    <Text style={[theme.typography.body, { fontWeight: '600' }]}>
                      {new Date(nextEmi.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.emiRow}>
                    <Text style={theme.typography.body}>Amount Due:</Text>
                    <Text style={[theme.typography.h2, { color: theme.colors.danger }]}>
                      ${Number(nextEmi.amountDue).toFixed(2)}
                    </Text>
                  </View>
                  
                  <Button 
                    title="Pay via KHQR" 
                    onPress={() => navigation.navigate('Payment', { loanId: activeLoan.id, emiId: nextEmi.id, amount: nextEmi.amountDue })} 
                    style={{ marginTop: theme.spacing.lg }}
                  />
                </Card>
              </>
            )}
            
            {!nextEmi && (
               <Card style={styles.emiCard}>
                  <Text style={{ textAlign: 'center', color: theme.colors.success, fontWeight: '600' }}>
                    All installments paid!
                  </Text>
               </Card>
            )}
          </>
        ) : (
          <Card style={{ alignItems: 'center', padding: theme.spacing.xl }}>
             <Text style={theme.typography.h3}>No Active Loan</Text>
             <Text style={{ textAlign: 'center', color: 'rgba(0,0,0,0.5)', marginTop: theme.spacing.sm }}>
               You do not have any active loans at the moment.
             </Text>
          </Card>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  balanceCard: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  balanceAmount: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  emiCard: {
    marginBottom: theme.spacing.xl,
  },
  emiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  }
});
