import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Card, IconButton, Menu, Text, TextInput } from 'react-native-paper';
import { handleGetAccount, handleGetSavingGroups } from '../../controllers/accountController';
import { projectSavings } from '../../utils/compoundInterest';

const FREQUENCIES = [
  { label: 'Mensual', perYear: 12 },
  { label: 'Trimestral', perYear: 4 },
  { label: 'Semestral', perYear: 2 },
  { label: 'Anual', perYear: 1 },
];

const SCENARIO_COLORS = ['#7C4DFF', '#1E88E5', '#43A047', '#FB8C00', '#00ACC1'];
const YEARS = [1, 3, 5, 10];
const screenWidth = Dimensions.get('window').width;
const scenarioCardWidth = Math.min(320, screenWidth * 0.82);

const parseAmount = (value) => {
  const parsed = parseFloat(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
};

const formatAmount = (value, account) => {
  const amount = Number(value) || 0;
  if (!account?.locale || !account?.currency) {
    return amount.toFixed(2);
  }
  return amount.toLocaleString(account.locale, {
    style: 'currency',
    currency: account.currency,
  });
};

const currencyAffix = (account) => {
  if (!account?.currency) {
    return '';
  }
  try {
    const formatted = (0).toLocaleString(account.locale || 'es-ES', {
      style: 'currency',
      currency: account.currency,
    });
    return formatted.replace(/[\d\s.,\u00a0]/g, '').trim();
  } catch {
    return account.currency;
  }
};

const frequencyLabel = (perYear) => (
  FREQUENCIES.find((item) => item.perYear === perYear)?.label || 'Mensual'
);

const projectScenario = (scenario, group) => {
  if (!group) {
    return null;
  }
  const tinPercent = parseAmount(scenario.tin);
  if (tinPercent === null || tinPercent < 0) {
    return null;
  }
  const rawContribution = String(scenario.contribution ?? '').trim();
  const contribution = rawContribution === '' ? 0 : parseAmount(rawContribution);
  if (contribution === null || contribution < 0) {
    return null;
  }

  return projectSavings({
    principal: parseFloat(group.savedAmount) || 0,
    monthlyContribution: contribution,
    annualTin: tinPercent / 100,
    compoundsPerYear: scenario.compoundsPerYear,
  });
};

const blankScenario = (id) => ({
  id,
  groupId: null,
  contribution: '',
  tin: '',
  compoundsPerYear: 12,
});

const cloneScenario = (source, id) => ({
  id,
  groupId: source.groupId,
  contribution: source.contribution,
  tin: source.tin,
  compoundsPerYear: source.compoundsPerYear,
});

const METRICS = [
  { label: 'Total', key: 'total' },
  { label: 'Aportado', key: 'contributed' },
  { label: 'Intereses', key: 'interest' },
];

const ComparisonColumns = ({ year, columns, columnStyle, formatMoney }) => (
  <View style={columnStyle === styles.tableColFlex ? styles.tableFill : null}>
    <View style={styles.tableRow}>
      {columns.map((column) => (
        <View key={column.id} style={[columnStyle, styles.dotCell]}>
          <View style={[styles.dot, { backgroundColor: column.color }]} />
        </View>
      ))}
    </View>
    {METRICS.map((metric) => (
      <View key={metric.key} style={styles.metricBlock}>
        <Text style={styles.metricLabel}>{metric.label}</Text>
        <View style={styles.tableRow}>
          {columns.map((column) => {
            const horizon = column.projection?.find((item) => item.years === year);
            return (
              <Text
                key={column.id}
                style={[columnStyle, styles.metricValue]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.65}
              >
                {horizon ? formatMoney(horizon[metric.key]) : '—'}
              </Text>
            );
          })}
        </View>
      </View>
    ))}
  </View>
);

const ComparisonYearCard = ({ year, columns, scroll, formatMoney }) => {
  const values = (
    <ComparisonColumns
      year={year}
      columns={columns}
      columnStyle={scroll ? styles.tableColFixed : styles.tableColFlex}
      formatMoney={formatMoney}
    />
  );

  return (
    <Card style={styles.resultCard}>
      <Card.Title title={year === 1 ? '1 año' : `${year} años`} />
      <Card.Content>
        {scroll ? (
          <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator>
            {values}
          </ScrollView>
        ) : values}
      </Card.Content>
    </Card>
  );
};

const CalculatorScreen = ({ route, navigation }) => {
  const { accountId = null } = route.params || {};
  const nextId = useRef(2);

  const [account, setAccount] = useState(null);
  const [groups, setGroups] = useState([]);
  const [scenarios, setScenarios] = useState(() => [blankScenario(1)]);
  const [openMenu, setOpenMenu] = useState(null);

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

  const symbol = currencyAffix(account);

  const columns = useMemo(() => {
    return scenarios.map((scenario, index) => {
      const group = groups.find((item) => item.id === scenario.groupId) || null;
      return {
        id: scenario.id,
        color: SCENARIO_COLORS[index % SCENARIO_COLORS.length],
        group,
        projection: projectScenario(scenario, group),
      };
    });
  }, [scenarios, groups]);

  const formatMoney = (value) => formatAmount(value, account);

  const updateScenario = (id, patch) => {
    setScenarios((current) => current.map((item) => (
      item.id === id ? { ...item, ...patch } : item
    )));
  };

  const addScenario = () => {
    const id = nextId.current;
    nextId.current += 1;
    setScenarios((current) => [
      ...current,
      cloneScenario(current[current.length - 1], id),
    ]);
  };

  const removeScenario = (id) => {
    setOpenMenu(null);
    setScenarios((current) => (
      current.length < 2 ? current : current.filter((item) => item.id !== id)
    ));
  };

  const isMenuOpen = (id, kind) => openMenu?.id === id && openMenu?.kind === kind;

  const singleProjection = scenarios.length === 1 ? columns[0].projection : null;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Button
        mode="text"
        icon={({ size, color }) => (
          <MaterialCommunityIcons name="plus" size={size} color={color} />
        )}
        onPress={addScenario}
        style={styles.addButton}
      >
        Añadir escenario
      </Button>

      <ScrollView
        horizontal
        nestedScrollEnabled
        removeClippedSubviews={false}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={styles.scenarioScroll}
        contentContainerStyle={styles.scenarioRow}
      >
        {scenarios.map((scenario, index) => {
          const column = columns[index];
          const frequency = frequencyLabel(scenario.compoundsPerYear);
          return (
            <Card key={scenario.id} style={[styles.scenarioCard, { width: scenarioCardWidth }]}>
              <Card.Content>
                <View style={styles.scenarioHeader}>
                  <View style={[styles.dot, { backgroundColor: column.color }]} />
                  {scenarios.length > 1 ? (
                    <IconButton
                      icon={({ size, color }) => (
                        <MaterialCommunityIcons name="trash-can-outline" size={size} color={color} />
                      )}
                      size={20}
                      onPress={() => removeScenario(scenario.id)}
                      style={styles.trash}
                    />
                  ) : null}
                </View>

                <Text style={styles.label}>Grupo:</Text>
                <Menu
                  visible={isMenuOpen(scenario.id, 'group')}
                  onDismiss={() => setOpenMenu(null)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setOpenMenu({ id: scenario.id, kind: 'group' })}
                      style={styles.menuButton}
                    >
                      {column.group?.name || 'Selecciona un grupo'}
                    </Button>
                  }
                >
                  <ScrollView style={styles.menuList}>
                    {groups.map((item) => (
                      <Menu.Item
                        key={item.id}
                        title={item.name}
                        onPress={() => {
                          updateScenario(scenario.id, { groupId: item.id });
                          setOpenMenu(null);
                        }}
                      />
                    ))}
                  </ScrollView>
                </Menu>
                {column.group ? (
                  <Text style={styles.balance}>Saldo actual: {formatMoney(column.group.savedAmount)}</Text>
                ) : null}

                <Text style={styles.label}>Aporte mensual:</Text>
                <TextInput
                  mode="outlined"
                  value={scenario.contribution}
                  onChangeText={(contribution) => updateScenario(scenario.id, { contribution })}
                  keyboardType="numeric"
                  placeholder="0.00"
                  style={styles.input}
                  right={symbol ? <TextInput.Affix text={symbol} /> : null}
                />

                <Text style={styles.label}>TIN (%):</Text>
                <TextInput
                  mode="outlined"
                  value={scenario.tin}
                  onChangeText={(tin) => updateScenario(scenario.id, { tin })}
                  keyboardType="numeric"
                  placeholder="3"
                  style={styles.input}
                />

                <Text style={styles.label}>Cada cuánto se liquida el interés:</Text>
                <Menu
                  visible={isMenuOpen(scenario.id, 'frequency')}
                  onDismiss={() => setOpenMenu(null)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setOpenMenu({ id: scenario.id, kind: 'frequency' })}
                      style={styles.menuButton}
                    >
                      {frequency}
                    </Button>
                  }
                >
                  {FREQUENCIES.map((item) => (
                    <Menu.Item
                      key={item.perYear}
                      title={item.label}
                      onPress={() => {
                        updateScenario(scenario.id, { compoundsPerYear: item.perYear });
                        setOpenMenu(null);
                      }}
                    />
                  ))}
                </Menu>
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>

      <Text style={styles.resultsTitle}>Resultados</Text>

      {scenarios.length < 2 ? (
        singleProjection ? (
          singleProjection.map((item) => (
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
        )
      ) : (
        YEARS.map((year) => (
          <ComparisonYearCard
            key={year}
            year={year}
            columns={columns}
            scroll={scenarios.length >= 4}
            formatMoney={formatMoney}
          />
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 20,
    backgroundColor: '#f4f4f4',
  },
  scenarioScroll: {
    flexGrow: 0,
    overflow: 'visible',
  },
  scenarioRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: 'flex-start',
  },
  scenarioCard: {
    marginRight: 12,
  },
  scenarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  trash: {
    margin: 0,
  },
  resultsTitle: {
    marginTop: 28,
    marginBottom: 12,
    marginHorizontal: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  resultCard: {
    marginHorizontal: 20,
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
    alignSelf: 'stretch',
  },
  menuList: {
    maxHeight: 200,
  },
  balance: {
    marginTop: -8,
    marginBottom: 15,
    fontSize: 15,
  },
  addButton: {
    alignSelf: 'flex-start',
    marginLeft: 12,
    marginBottom: 4,
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
    marginHorizontal: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotCell: {
    alignItems: 'center',
    marginBottom: 4,
  },
  tableFill: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tableColFlex: {
    flex: 1,
    paddingRight: 6,
  },
  tableColFixed: {
    width: 128,
    paddingRight: 8,
  },
  metricBlock: {
    marginTop: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CalculatorScreen;
