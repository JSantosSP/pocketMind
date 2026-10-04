import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { handleGetAccount, handleGetYearHistory } from '../../controllers/accountController';
import { meses } from '../../constants/constantes';
import Loading from '../../components/Loading';

const BORDER_RED = '#e53935';
const BORDER_GREEN = '#43a047';
const BORDER_GRAY = '#9e9e9e';

const getBorderColor = (expenses, income) => {
  if (expenses === null || income === null) {
    return BORDER_GRAY;
  }
  if (expenses > income) {
    return BORDER_RED;
  }
  if (expenses < income) {
    return BORDER_GREEN;
  }
  return BORDER_GRAY;
};

const HistoryScreen = ({ route }) => {
  const { accountId } = route.params;
  const [year, setYear] = useState(new Date().getFullYear());
  const [account, setAccount] = useState(null);
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    handleGetAccount(accountId, setAccount);
  }, [accountId]);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      const data = await handleGetYearHistory(accountId, year);
      setMonths(data);
      setLoading(false);
    };
    loadHistory();
  }, [accountId, year]);

  const formatAmount = (value) => {
    if (value === null) {
      return '--';
    }
    if (!account) {
      return `${value}€`;
    }
    return value.toLocaleString(account.locale, {
      style: 'currency',
      currency: account.currency,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.yearSelector}>
        <TouchableOpacity onPress={() => setYear((prev) => prev - 1)} style={styles.yearButton}>
          <Text style={styles.yearArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.yearLabel}>{year}</Text>
        <TouchableOpacity onPress={() => setYear((prev) => prev + 1)} style={styles.yearButton}>
          <Text style={styles.yearArrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <Loading />
        </View>
      ) : (
        <View style={styles.grid}>
          {months.map((item) => (
            <Card
              key={item.month}
              mode="outlined"
              style={[
                styles.monthCard,
                { borderColor: getBorderColor(item.expenses, item.income) },
              ]}
            >
              <Card.Content>
                <Text style={styles.monthName}>{meses[item.month - 1]}</Text>
                <View style={styles.amountsRow}>
                  <View style={styles.amountColumn}>
                    <Text style={styles.amountLabel}>Gastos</Text>
                    <Text style={styles.amountValue} numberOfLines={1} adjustsFontSizeToFit>
                      {formatAmount(item.expenses)}
                    </Text>
                  </View>
                  <View style={styles.separator} />
                  <View style={styles.amountColumn}>
                    <Text style={styles.amountLabel}>Ingresos</Text>
                    <Text style={styles.amountValue} numberOfLines={1} adjustsFontSizeToFit>
                      {formatAmount(item.income)}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingBox: {
    paddingVertical: 80,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  yearButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  yearArrow: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  yearLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 80,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthCard: {
    width: '48%',
    marginBottom: 12,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  monthName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountColumn: {
    flex: 1,
    alignItems: 'center',
  },
  separator: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    width: '100%',
    textAlign: 'center',
  },
});

export default HistoryScreen;
