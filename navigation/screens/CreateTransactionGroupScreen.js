import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Card, Text, Menu } from 'react-native-paper';
import { handleGetSavingGroups, handleCreateSavingTransaction, handleCheckTransactionsGroup, handleGetAccount } from '../../controllers/accountController';

const CreateTransactionGroupScreen = ({ route, navigation }) => {
  const { accountId = null, isIncome = true } = route.params || {};
  
  const [amount, setAmount] = useState('');
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState([]);
  const [account, setAccount] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (accountId) {
      handleGetAccount(accountId, (account) => {
        if (account) {
          setAccount(account);
        } else {
          Alert.alert('Error', 'Hubo un problema al obtener la cuenta');
          navigation.goBack();
        }
      });
      handleGetSavingGroups(accountId, (groups) => {
        if (groups) {
          setGroups(groups);
        } else {
          Alert.alert('Error', 'Hubo un problema al obtener el grupo');
          navigation.goBack();
        }
      });
    }
  }, [accountId]);

  const handleSave = async () => {
    if (!amount || !group) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }
    if (isIncome) {
      if (parseFloat(group.targetAmount) < parseFloat(amount) + parseFloat(group.savedAmount)) {
        Alert.alert('Error', 'El monto ahorrado no puede ser mayor a la meta de ahorro');
        return;
      }
      const libre = await handleCheckTransactionsGroup(account); 

      if ((libre) < amount) {
        Alert.alert('Error', 'No tienes suficiente dinero en la cuenta');
        return;
      }
    }
    else {
      if(group.savedAmount < amount){
        Alert.alert('Error', 'No tienes suficiente dinero en el grupo');
        return;
      }
    }
    const groupId = group.id; 
    const createSuccess = await handleCreateSavingTransaction(groupId, amount, isIncome);
    if (createSuccess) {
      Alert.alert('Éxito', 'Transaccion realizada correctamente', [
        { text: 'OK', onPress: () => navigation.reset({
          index: 0,
          routes: [{ name: "Home" }]
        })}
      ]);
    } else {
      Alert.alert('Error', 'Hubo un problema al realizar la transacción', [{ text: 'OK' }]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={isIncome ? "Ingresar Dinero" : "Sacar Dinero"} />
        <Card.Content>
          <Text style={styles.label}>Cantidad:</Text>
          <TextInput 
            mode="outlined"
            value={amount} 
            onChangeText={setAmount} 
            keyboardType="numeric" 
            placeholder="0.00" 
            style={styles.input}
          />
          <Text style={styles.label}>Grupo:</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setMenuVisible(true)}>
                {group.name || "Selecciona un grupo"}
              </Button>
            }
          >
            <ScrollView style={{ maxHeight: 200 }}>
            {groups.map((p) => (
              <Menu.Item
                key={p.id}
                title={p.name}
                onPress={() => {
                  setGroup(p);
                  setMenuVisible(false);
                }}
              />
            ))}
            </ScrollView>
          </Menu>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={handleSave}>
            {"Realizar Transacción"}
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  card: { width: '100%', padding: 10 },
  input: { marginBottom: 15 },
  label: { fontSize: 16, marginBottom: 5 }
});

export default CreateTransactionGroupScreen;
