import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, Entypo, FontAwesome6, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import FloatingButton from '../../components/FloatingButton';

const OptionsScreen = ({ route }) => {
  const { accountId } = route.params;
  const navigation = useNavigation();

  const buttons = [    
    {
      label: 'Ingresar',
      icon: <Entypo name="credit" size={24} color="white" />,
      onPress: () => navigation.navigate("Transaction", { isIncome: true, accountId }),
    },
    {
      label: 'Gastar',
      icon: <MaterialIcons name="money-off" size={24} color="white" />,
      onPress: () => navigation.navigate("Transaction", { isIncome: false, accountId }),
      },
    {
      label: 'Añadir a un Grupo',
      icon: <FontAwesome6 name="money-bill-trend-up" size={24} color="white" />,
      onPress: () => navigation.navigate("CreateTransactionGroupScreen", { accountId, isIncome: true }),
    },
    {
      label: 'Retirar de un Grupo',
      icon: <MaterialCommunityIcons name="hand-coin" size={24} color="white" />,
      onPress: () => navigation.navigate("CreateTransactionGroupScreen", { accountId, isIncome: false }),
    },
    {
      label: 'Delete Group',
      icon: <AntDesign name="delete" size={24} color="white" />,
      onPress: () => navigation.navigate("DeleteGroupScreen", { accountId }),
    },
    {
      label: 'Configuración',
      icon: <AntDesign name="setting" size={24} color="white" />,
      onPress: () => navigation.navigate("Settings"),
    },
    ];
    
    const handleCreateSavingGroup = () => {
        navigation.navigate("CreateSavingGroupScreen", { isEdit: false, parentId: accountId });
        };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opciones</Text>
      <View style={styles.buttonContainer}>
        {buttons.map((button, index) => (
          <View key={index} style={styles.buttonWrapper}>
            <Button
              mode="contained"
              onPress={button.onPress}
              style={styles.button}
              icon={() => button.icon}
            >
              { button.label}
            </Button>
          </View>
        ))}
          </View>
          <FloatingButton onPress={handleCreateSavingGroup} iconName='savings'/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default OptionsScreen;
