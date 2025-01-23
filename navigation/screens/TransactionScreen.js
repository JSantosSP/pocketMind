import React, { useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, FlatList, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Menu } from 'react-native-paper';
import { handleCreateSavingTransaction, handleCreateTransaction, handleGetCategories, handleGetSavingGroups } from '../../controllers/accountController';
import Transaction from '../../models/Transaction';

const TransactionScreen = ({ route, navigation }) => {
    const { isIncome, accountId } = route.params;

    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [description, setDescription] = useState('');
    const [savingGroups, setSavingGroups] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState(null);
    const [allocatedGroups, setAllocatedGroups] = useState([]);
    const [openCategory, setOpenCategory] = useState(false);
    const [openGroup, setOpenGroup] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            await handleGetCategories((categoryList) => {
                setCategories(categoryList);
            });
            await handleGetSavingGroups(accountId, (groups) => {
                setSavingGroups(groups.map((g) => ({ ...g, percentage: 0 })));
            });
        };
        fetchData();
    }, [accountId]);


    const handleSubmit = async () => {
        if (!amount || (!isIncome && !category)) {
            Alert.alert('Error', 'Por favor, completa todos los campos');
            return;
        }
        let sum = 0;
        for (const group of savingGroups) {
            if (group.percentage > 0) {
                const groupAmount = numericAmount * (group.percentage / 100);
                if ((group.currentSaving || 0) + groupAmount > group.target) {
                    Alert.alert(
                        'Error',
                        `El monto asignado al grupo "${group.name}" supera su objetivo. Revise los porcentajes.`
                    );
                    return;
                }
                sum += g.percentage;
            }
        }
        if (sum > 100) {
            alert('La suma de los porcentajes no puede ser mayor a 100');
            return;
        }
        await handleCreateTransaction(accountId, isIncome, amount, category, description).then(async () => {
            
            if (sum > 0) {
                for (const group of savingGroups) {
                    const groupAmount = amount * (group.percentage / 100);
                    await handleCreateSavingTransaction(group.id, groupAmount, isIncome);
                }
            }
            navigation.goBack();
        });
    };

    const updatePercentage = (id, percentage) => {
        const newGroups = savingGroups.map((g) => {
            if (g.id === id) {
                return { ...g, percentage };
            }
            return g;
        });
        setSavingGroups(newGroups);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, padding: 16 }}>
            <TextInput label="Cantidad" keyboardType="numeric" value={amount} onChangeText={setAmount} />

            {!isIncome && (<View style={{ zIndex: 2000 }}>
                <Menu
                    visible={openCategory}
                    onDismiss={() => setOpenCategory(false)}
                    anchor={
                    <Button mode="outlined" onPress={() => setOpenCategory(true)}>
                        {selectedCategoria?.name || "Selecciona una categoria"}
                    </Button>
                    }
                >
                    <ScrollView style={{ maxHeight: 200 }}>
                    {categories.map((c) => (
                    <Menu.Item
                        key={c.id}
                        title={c.name}
                        onPress={() => {
                            setCategory(c.name);
                            setSelectedCategoria(c);
                            setOpenCategory(false);
                        }}
                    />
                    ))}
                    </ScrollView>
                </Menu>
            </View>)}


            <FlatList
                data={savingGroups}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Text style={{ flex: 1 }}>{item.name}</Text>
                        <TextInput
                            style={{ width: 60 }}
                            keyboardType="numeric"
                            value={String(item.percentage)}
                            onChangeText={p => updatePercentage(item.id, parseInt(p) || 0)}
                        />
                    </View>
                )}
            />

            <Button onPress={handleSubmit}>Guardar Transacción</Button>
        </KeyboardAvoidingView>
    );
};

export default TransactionScreen;
