import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Card, Text } from 'react-native-paper';
import { handleCreateSavingGroup, handleUpdateSavingGroup, handleGetSavingGroupById, handleGetAccount, handleCheckTransactionsGroup, handleCreateSavingTransaction } from '../../controllers/accountController';
import ColorPicker from 'react-native-wheel-color-picker'

const CreateSavingGroupScreen = ({ route, navigation }) => {
  const { isEdit = false, savingGroupId = null, parentId = null } = route.params || {};

  const [account, setAccount] = useState({});
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('0');

  useEffect(() => {
  const fetchData = async () => {
    await handleGetAccount(parentId,( account) => { 
        if (account === undefined) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }]
            });
        }
        else {
            setAccount(account);
        }
    });
    if (isEdit && savingGroupId) {
      await handleGetSavingGroupById(savingGroupId, (savingGroup) => {
        if (savingGroup) {
          setName(savingGroup.name);
          setTargetAmount(savingGroup.targetAmount.toString());
          setSavedAmount(savingGroup.savedAmount.toString());
          setColor(savingGroup.color);
        }
      });
    }
    };
    fetchData();
  }, [parentId, isEdit, savingGroupId]);

  const handleSave = async () => {
    if (!name || !targetAmount || color === '') {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    if (isEdit) {
      if (parseFloat(targetAmount) < parseFloat(savedAmount)) {
        Alert.alert('Error', 'El monto ahorrado no puede ser mayor a la meta de ahorro', [{ text: 'OK' }]);
        return;
      }
      const updateSuccess = await handleUpdateSavingGroup(savingGroupId, name, parseFloat(targetAmount), parseFloat(savedAmount));
      if (updateSuccess) {
        Alert.alert('Éxito', 'Grupo de ahorro actualizado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', 'Hubo un problema al actualizar el grupo de ahorro', [{ text: 'OK' }]);
      }
    } else {
      if (0 < parseFloat(savedAmount)) {
        await handleCheckTransactionsGroup(account.id, (libre) => {
          if (libre < parseFloat(savedAmount)) {
            Alert.alert('Error', 'No tienes suficiente dinero en tu cuenta principal para crear este grupo de ahorro', [{ text: 'OK' }]);
            return;
          }
        });
      }
      if (parseFloat(targetAmount) < parseFloat(savedAmount)) {
        Alert.alert('Error', 'El monto ahorrado no puede ser mayor a la meta de ahorro', [{ text: 'OK' }]);
        return;
      }
      const createSuccess = await handleCreateSavingGroup(name, parseFloat(targetAmount), parseFloat(0), color, parentId);

      if (createSuccess.status) {
        if (0 < parseFloat(savedAmount)) {
          const transferSuccess = await handleCreateSavingTransaction(createSuccess.id, parseFloat(savedAmount), true);
          if (!transferSuccess) {
            Alert.alert('Error', 'Hubo un problema al transferir el monto ahorrado al grupo de ahorro', [{ text: 'OK' }]);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }]
            });
          }
        }
        Alert.alert('Éxito', 'Grupo de ahorro creado correctamente', [
          { text: 'OK', onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
          })}
        ]);
      } else {
        Alert.alert('Error', 'Hubo un problema al crear el grupo de ahorro', [{ text: 'OK' }]);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={isEdit ? 'Editar Grupo de Ahorro' : 'Crear Grupo de Ahorro'} />
        <Card.Content>
          <Text style={styles.label}>Nombre:</Text>
          <TextInput 
            mode="outlined"
            value={name} 
            onChangeText={setName} 
            style={styles.input}
          />

          <Text style={styles.label}>Meta de Ahorro:</Text>
          <TextInput 
            mode="outlined"
            value={targetAmount} 
            onChangeText={setTargetAmount} 
            keyboardType="numeric" 
            placeholder="0.00" 
            style={styles.input}
          />

          <Text style={styles.label}>Monto Ahorrado:</Text>
          <TextInput 
            mode="outlined"
            value={savedAmount} 
            onChangeText={setSavedAmount} 
            keyboardType="numeric" 
            placeholder="0.00" 
            style={styles.input}
            disabled={isEdit} 
                  />
          <Text style={styles.label}>Color:</Text>
          <ColorPicker
            color={color}
            onColorChangeComplete={(color) => setColor(color)}
            thumbSize={30}
            sliderSize={30}
            noSnap
            row={false}
          />
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={handleSave}>
            {isEdit ? 'Actualizar' : 'Guardar'}
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

export default CreateSavingGroupScreen;
