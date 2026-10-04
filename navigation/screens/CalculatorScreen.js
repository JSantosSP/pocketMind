import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { Button, Card, Menu, Text, TextInput } from 'react-native-paper';
import { handleGetAccount, handleGetSavingGroups } from '../../controllers/accountController';
import { projectSavings } from '../../utils/compoundInterest';

const FREQUENCIES = [
  { label: 'Mensual', perYear: 12 },
  { label: 'Trimestral', perYear: 4 },
  { label: 'Semestral', perYear: 2 },
  { label: 'Anual', perYear: 1 },
];

const parseAmount = (value) => {
  const parsed = parseFloat(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
};

const CalculatorScreen = ({ route, navigation }) => {
  const { accountId = null } = route.params || {};

  const [account, setAccount] = useState(null);
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [tin, setTin] = useState('');
  const [frequency, setFrequency] = useState(FREQUENCIES[0]);
  const [groupMenuVisible, setGroupMenuVisible] = useState(false);
  const [frequencyMenuVisible, setFrequencyMenuVisible] = useState(false);

  useEffect(() => {
    if (!accountId) {
      return;
    }
    handleGetAccount(accountId, (loadedAccount) => {
      if (loadedAccount) {
        setAccount(loadedAccount);
      } else {
        Alert.alert('Error', 'Hubo un problema al obtener la cuenta');
        navigation.goBack();
      }
    });
    handleGetSavingGroups(accountId, (loadedGroups) => {
      setGroups(loadedGroups || []);
    });
  }, [accountId, navigation]);

  const formatMoney = (value) => {
    const amount = Number(value) || 0;
    if (!account?.locale || !account?.currency) {
      return amount.toFixed(2);
    }
    return amount.toLocaleString(account.locale, {
      style: 'currency',
      currency: account.currency,
    });
  };

  const projections = useMemo(() => {
    if (!group) {
      return null;
    }
    const tinPercent = parseAmount(tin);
    if (tinPercent === null || tinPercent < 0) {
      return null;
    }
    const contribution = monthlyContribution.trim() === '' ? 0 : parseAmount(monthlyContribution);
    if (contribution === null || contribution < 0) {
      return null;
    }

    return projectSavings({
      principal: parseFloat(group.savedAmount) || 0,
      monthlyContribution: contribution,
      annualTin: tinPercent / 100,
      compoundsPerYear: frequency.perYear,
    });
  }, [group, tin, monthlyContribution, frequency]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Calculadora de ahorro" />
        <Card.Content>
          <Text style={styles.label}>Grupo:</Text>
          <Menu
            visible={groupMenuVisible}
            onDismiss={() => setGroupMenuVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setGroupMenuVisible(true)} style={styles.menuButton}>
                {group?.name || 'Selecciona un grupo'}
              </Button>
            }
          >
            <ScrollView style={styles.menuList}>
              {groups.map((item) => (
                <Menu.Item
                  key={item.id}
                  title={item.name}
                  onPress={() => {
                    setGroup(item);
                    setGroupMenuVisible(false);
                  }}
                />
              ))}
            </ScrollView>
          </Menu>
          {group ? (
            <Text style={styles.balance}>Saldo actual: {formatMoney(group.savedAmount)}</Text>
          ) : null}

          <Text style={styles.label}>Aporte mensual:</Text>
          <TextInput
            mode="outlined"
            value={monthlyContribution}
            onChangeText={setMonthlyContribution}
            keyboardType="numeric"
            placeholder="0.00"
            style={styles.input}
          />

          <Text style={styles.label}>TIN (%):</Text>
          <TextInput
            mode="outlined"
            value={tin}
            onChangeText={setTin}
            keyboardType="numeric"
            placeholder="3"
            style={styles.input}
          />

          <Text style={styles.label}>Cada cuánto se liquida el interés:</Text>
          <Menu
            visible={frequencyMenuVisible}
            onDismiss={() => setFrequencyMenuVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setFrequencyMenuVisible(true)} style={styles.menuButton}>
                {frequency.label}
              </Button>
            }
          >
            {FREQUENCIES.map((item) => (
              <Menu.Item
                key={item.perYear}
                title={item.label}
                onPress={() => {
                  setFrequency(item);
                  setFrequencyMenuVisible(false);
                }}
              />
            ))}
          </Menu>
        </Card.Content>
      </Card>

      {projections ? (
        projections.map((item) => (
          <Card key={item.years} style={styles.resultCard}>
            <Card.Title title={item.years === 1 ? '1 año' : `${item.years} años`} />
            <Card.Content>
              <Text style={styles.total}>Total: {formatMoney(item.total)}</Text>
              <Text style={styles.detail}>Aportado por ti: {formatMoney(item.contributed)}</Text>
              <Text style={styles.detail}>Interés compuesto: {formatMoney(item.interest)}</Text>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Text style={styles.hint}>Elige un grupo e indica el TIN para ver la proyección.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  card: {
    width: '100%',
    padding: 10,
    marginBottom: 16,
  },
  resultCard: {
    width: '100%',
    marginBottom: 12,
  },
  input: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  menuButton: {
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  menuList: {
    maxHeight: 200,
  },
  balance: {
    marginTop: -8,
    marginBottom: 15,
    fontSize: 15,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  detail: {
    fontSize: 16,
    marginBottom: 4,
  },
  hint: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
});

export default CalculatorScreen;
