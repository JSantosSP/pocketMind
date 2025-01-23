import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Card, Text, Menu } from 'react-native-paper';
import { handleCreateAccount, handleUpdateAccount, handleGetAccountById } from '../../controllers/accountController';
import { paises } from '../../constants/constantes';

const CreateAccountScreen = ({ route, navigation }) => {
  const { isEdit = false, isMain = false, accountId = null } = route.params || {};
  
  const [name, setName] = useState(isMain ? 'principal' : '');
  const [balance, setBalance] = useState('');
  const [pais, setPais] = useState('');
  const [locale, setLocale] = useState('');
  const [currency, setCurrency] = useState('');

  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (isEdit && accountId) {
      handleGetAccountById(accountId, (account) => {
        if (account) {
          setName(account.name);
          setBalance(account.balance.toString());
          setPais(account.pais);
          setLocale(account.locale);
          setCurrency(account.currency);
        }
      });
    }
  }, [isEdit, accountId]);

  const handleSave = async () => {
    if (!balance || !pais || !name)  {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    if (isEdit) {
      const updateSuccess = await handleUpdateAccount(accountId, parseFloat(balance), pais, locale, currency);
      if (updateSuccess) {
        Alert.alert('Éxito', 'Cuenta actualizada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', 'Hubo un problema al actualizar la cuenta', [{ text: 'OK' }]);
      }
    } else {
      const createSuccess = await handleCreateAccount(name, parseFloat(balance), pais, locale, currency);
      if (createSuccess) {
        Alert.alert('Éxito', 'Cuenta creada correctamente', [
          { text: 'OK', onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: "Home" }]
          })}
        ]);
      } else {
        Alert.alert('Error', 'Hubo un problema al crear la cuenta', [{ text: 'OK' }]);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Crear Cuenta" />
        <Card.Content>
          <Text style={styles.label}>Nombre de la cuenta:</Text>
          <TextInput 
            mode="outlined"
            value={name} 
            onChangeText={setName} 
            disabled={isMain || isEdit} 
            style={styles.input}
          />

          <Text style={styles.label}>Saldo Inicial:</Text>
          <TextInput 
            mode="outlined"
            value={balance} 
            onChangeText={setBalance} 
            keyboardType="numeric" 
            placeholder="0.00" 
            style={styles.input}
          />

          <Text style={styles.label}>País:</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setMenuVisible(true)}>
                {pais || "Selecciona un país"}
              </Button>
            }
          >
            <ScrollView style={{ maxHeight: 200 }}>
            {paises.map((p) => (
              <Menu.Item
                key={p.name}
                title={p.name}
                onPress={() => {
                  setPais(p.name);
                  setLocale(p.locale);
                  setCurrency(p.currency);
                  setMenuVisible(false);
                }}
              />
            ))}
            </ScrollView>
          </Menu>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={handleSave}>
            {isEdit ? "Actualizar Cuenta" : "Guardar Cuenta"}
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

export default CreateAccountScreen;
