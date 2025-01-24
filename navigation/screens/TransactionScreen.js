import React, { useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, FlatList, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Menu } from 'react-native-paper';
import { handleCheckTransactionsGroup, handleCreateSavingTransaction, handleCreateTransaction, handleGetAccount, handleGetCategories, handleGetSavingGroups } from '../../controllers/accountController';


const TransactionScreen = ({ route, navigation }) => {
    const { isIncome, accountId } = route.params;

    const [amount, setAmount] = useState('');
    const [account, setAccount] = useState(null);
    const [category, setCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [description, setDescription] = useState('');
    const [savingGroups, setSavingGroups] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState(null);
    const [openCategory, setOpenCategory] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            await handleGetAccount(accountId, (account) => {
                setAccount(account);
            });
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
        let sumGroups = 0;
        for (const group of savingGroups) {
            if (group.percentage > 0) {
                const groupAmount = amount * (group.percentage / 100);
                sumGroups += groupAmount;
                if (isIncome) {
                    if ((group.savedAmount || 0) + groupAmount > group.targetAmount) {
                        Alert.alert(
                            'Error',
                            `El monto asignado al grupo "${group.name}" supera su objetivo. Revise los porcentajes.`
                        );
                        return;
                    }
                } else {
                    if (groupAmount > group.savedAmount) {
                        Alert.alert(
                            'Error',
                            `El monto asignado al grupo "${group.name}" supera el monto disponible. Revise los porcentajes.`
                        );
                        return;
                    }
                }
                sum += group.percentage;
            }

        }

        if (sum > 100) {
            alert('La suma de los porcentajes no puede ser mayor a 100');
            return;
        }
        let ok = false;
        if (!isIncome) {            
            const libre = await handleCheckTransactionsGroup(account);
            if ((libre + sumGroups) < amount) {
                Alert.alert('Error', 'No tienes suficiente dinero en la cuenta');
                ok = false
            }
            else {
                ok = true;
            }
        }
        if(ok || isIncome) {
            await handleCreateTransaction(accountId, isIncome, amount, category, description).then(async () => {
            
                if (sum > 0) {
                    for (const group of savingGroups) {
                        const groupAmount = amount * (group.percentage / 100);
                        await handleCreateSavingTransaction(group.id, groupAmount, isIncome);
                    }
                }
                navigation.goBack();
            });
        }
        
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

                    <Text style={{textAlign:"right"}}>Porcentajes de reparto</Text>
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
