import React from 'react';
import { View, Alert } from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';
import { deleteDatabase, initializeDb } from '../../services/database';

const SettingsScreen = ({ route, navigation }) => {
  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <Appbar.Header>
        <Appbar.Content title="Settings" titleStyle={{ alignSelf: 'center', fontSize: 24 }} />
      </Appbar.Header>

      {/* Main Content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
        <Button
          mode="contained"
          onPress={() =>
            Alert.alert(
              'Confirmar',
              '¿Estás seguro de que deseas eliminar la base de datos? Esto eliminará todos los datos y tablas.',
              [
                { text: 'Cancelar' },
                {
                  text: 'Eliminar',
                  onPress: async () => {
                    await deleteDatabase()
                      .then(async () => {
                        await initializeDb()
                          .then(() => navigation.reset({
                            index: 0,
                            routes: [{ name: 'CreateAccount', params: { isEdit: false, isMain: true } }]
                          }))
                          .catch((error) => {
                            console.error('Error al inicializar la base de datos:', error);
                            Alert.alert('Error', 'Hubo un problema al inicializar la base de datos');
                          });
                      })
                      .catch((error) => {
                        console.error('Error al eliminar la base de datos:', error);
                        Alert.alert('Error', 'Hubo un problema al eliminar la base de datos');
                      });
                  },
                },
              ]
            )
          }
          style={{ marginBottom: 20 }}
        >
          Eliminar Base de Datos
        </Button>

        {/* Aquí puedes añadir más botones en el futuro */}
      </View>
    </View>
  );
};

export default SettingsScreen;
