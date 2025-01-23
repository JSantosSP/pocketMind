import React, { useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, FlatList, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Menu } from 'react-native-paper';
import { handleCreateSavingTransaction, handleCreateTransaction, handleDeleteGrupo, handleGetCategories, handleGetSavingGroups } from '../../controllers/accountController';
import Transaction from '../../models/Transaction';

const DeleteGroupScreen = ({ route, navigation }) => {
    const { accountId } = route.params;

    const [amount, setAmount] = useState('');
    const [savingGroups, setSavingGroups] = useState([]);
    const [savingGroup, setSavingGroup] = useState(null);
    const [openGroups, setOpenGroups] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            await handleGetSavingGroups(accountId, (groups) => {
                setSavingGroups(groups);
            });
        };
        fetchData();
    }, [accountId]);


    const handleSubmit = async () => {
        if (!savingGroup) {
            Alert.alert('Error', 'Por favor, completa todos los campos');
            return;
        }
        await handleDeleteGrupo(savingGroup.id).then(async () => {
            Alert.alert('Éxito', 'Grupo eliminado correctamente', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        });
    };


    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, padding: 16, justifyContent: 'center' }}> 
            <View style={{ zIndex: 2000 }}>
                <Menu
                    visible={openGroups}
                    onDismiss={() => setOpenGroups(false)}
                    anchor={
                    <Button mode="outlined" onPress={() => setOpenGroups(true)}>
                        {savingGroup?.name || "Selecciona un Grupo"}
                    </Button>
                    }
                >
                    <ScrollView style={{ maxHeight: 200 }}>
                    {savingGroups.map((c) => (
                    <Menu.Item
                        key={c.id}
                        title={c.name}
                        onPress={() => {
                            setSavingGroup(c);
                            setOpenGroups(false);
                        }}
                    />
                    ))}
                    </ScrollView>
                </Menu>
            </View>

            <Button onPress={handleSubmit}>Delete Grupo</Button>
        </KeyboardAvoidingView>
    );
};

export default DeleteGroupScreen;
