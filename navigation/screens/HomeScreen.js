import React, { useState, useEffect, useCallback } from "react";
import { View, ScrollView, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";
import { handleCheckTransactionsGroup, handleGetMainAccount, handleGetSavingGroups } from "../../controllers/accountController";
import { Button, Card, Text } from "react-native-paper";
import { useFocusEffect } from '@react-navigation/native';
const screenWidth = Dimensions.get("window").width;

const HomeScreen = () => {
  const [account, setAccount] = useState(null);
  const navigation = useNavigation();
  const [data, setData] = useState({
    labels: ["Gastos", "Ingresos", "Ahorros"],
    datasets: [
      {
        data: [100],
        backgroundColor: ["blue"],
      },
    ],
  });

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        let account;
        await handleGetMainAccount(async (mainAccount) => {
          account = mainAccount;
          setAccount(mainAccount);
        }).then(async () => {
          await handleCheckTransactionsGroup(account, async (libre) => {
            await handleGetSavingGroups(account.id, (savingGroups) => {
              const data = {
                labels: ["Libre"],
                datasets: [
                  {
                    data: [libre],
                    backgroundColor: ["#0000FF"],
                  },
                ],
              };
          
              savingGroups.forEach((savingGroup) => {
                data.labels.push(savingGroup.name);
                data.datasets[0].data.push(savingGroup.savedAmount);
                data.datasets[0].backgroundColor.push(savingGroup.color);
              });

              setData(data);
            });
          });
        });
      };
      
      fetchData();

      return () => {};
    }, [])
  );

  useEffect(() => {
    handleGetMainAccount((mainAccount) => {
      setAccount(mainAccount);
    });
  }, []);

  useEffect(() => {
    if (account === undefined) {
      navigation.reset({
        index: 0,
        routes: [{ name: "CreateAccount", params: { isEdit: false, isMain: true } }],
      });
    }
  }, [account, navigation]);

  if (!account) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ textAlign: "center" }}>Cargando...</Text>
      </View>
    );
  }

  const chartData = data.datasets[0].data.map((value, index) => ({
    name: `${data.labels[index]}`, // Nombre del grupo con monto en moneda
    population: value,  // Usado para calcular el porcentaje
    color: data.datasets[0].backgroundColor[index],
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  }));

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", padding: 20 }}>
      <Card
        style={{
          width: "100%",
          marginBottom: 20,
          alignItems: "center",
          padding: 10,
        }}
      >
        <Card.Title
          title={account.name.toUpperCase()}
          titleStyle={{ textAlign: "center" }}
        />
        <Text
          variant="headlineLarge"
          style={{ fontWeight: "bold", marginBottom: 20, textAlign: "center" }}
        >
          {account.balance.toLocaleString(account.locale, {
            style: "currency",
            currency: account.currency,
          })}
        </Text>
      </Card>

      <Card style={{ width: "100%", padding: 10, alignItems: "center" }}>
        <PieChart
          data={chartData}
          width={screenWidth * 0.9}
          height={220}
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute={true}  
        />
      </Card>

      <Button
        style={{ width: "100%", margin: 10 }}
        mode="contained"
        onPress={() =>
          navigation.navigate("CreateAccount", { isEdit: false, isMain: false })
        }
      >
        Añadir Cuenta
      </Button>
      <Button
        style={{ width: "100%", margin: 10 }}
        mode="contained"
        onPress={() =>
          navigation.navigate("Transaction", { isIncome: false, accountId: account.id })
        }
      >
        Añadir dinero
      </Button>
      <Button
        style={{ width: "100%", margin: 10 }}
        mode="contained"
        onPress={() =>
          navigation.navigate("Settings")
        }
      >
        Settings
      </Button>
      <Button
        style={{ width: "100%", margin: 10 }}
        mode="contained"
        onPress={() =>
          navigation.navigate("CreateSavingGroupScreen", { isEdit: false, parentId: account.id })
        }
      >
        Añadir Grupo
      </Button>
      <Button
        style={{ width: "100%", margin: 10 }}
        mode="contained"
        onPress={() =>
          navigation.navigate("CreateTransactionGroupScreen", { accountId: account.id, isIncome: true })
        }
      >
        Ingresar Dinero a Grupo
      </Button>
    </ScrollView>
  );
};

export default HomeScreen;
