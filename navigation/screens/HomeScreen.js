import React, { useState, useEffect, useCallback } from "react";
import { View, ScrollView, Dimensions } from "react-native";
import { PieChart, ProgressChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";
import { handleCheckTransactionsGroup, handleGetMainAccount, handleGetSavingGroups } from "../../controllers/accountController";
import { Card, Text } from "react-native-paper";
import { useFocusEffect } from '@react-navigation/native';
import FloatingButton from "../../components/FloatingButton";
const screenWidth = Dimensions.get("window").width;

const HomeScreen = () => {
  const [account, setAccount] = useState(null);
  const navigation = useNavigation();
  const [dataTargets, setDataTargets] = useState({
    labels: [], 
    data: []
  });
  const [data, setData] = useState({
    labels: ["Gastos", "Ingresos", "Ahorros"],
    datasets: [
      {
        data: [100],
        backgroundColor: ["blue"],
      },
    ],
  });

  const chartConfig = {
  backgroundGradientFrom: "transparent",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "transparent",
  backgroundGradientToOpacity: 0,
  fillShadowGradientFrom: "#1E2923",
  fillShadowGradientFromOpacity: 0.5,
  fillShadowGradientFromOffset: 0,
  fillShadowGradientTo: "#08130D",
  fillShadowGradientToOpacity: 0.5,
  fillShadowGradientToOffset: 1,
  useShadowColorFromDataset: false,
  color: ( opacity = 1) => `rgba(0, 0, 2555, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  barRadius: 5,
  propsForBackgroundLines: {
    stroke: "#e3e3e3",
    strokeDasharray: "5, 5"
  },
  propsForLabels: {
    fontSize: 12,
    fill: "#000"
  },
  propsForVerticalLabels: {
    fontSize: 12,
    fill: "#000"
  },
  propsForHorizontalLabels: {
    fontSize: 12,
    fill: "#000"
  }
};

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        let account;
        await handleGetMainAccount(async (mainAccount) => {
          account = mainAccount;
          setAccount(mainAccount);
          if (account === undefined) {
            navigation.reset({
              index: 0,
              routes: [{ name: "CreateAccount", params: { isEdit: false, isMain: true } }],
            });
          }
        }).then(async () => {
          const libre = await handleCheckTransactionsGroup(account);
          await handleGetSavingGroups(account?.id, (savingGroups) => {
            const data = {
              labels: ["Libre"],
              datasets: [
                {
                  data: [libre],
                  backgroundColor: ["#0000FF"],
                },
              ],
            };
            const dataTargets = {
              labels: [], 
              data: []
            };
        
            savingGroups.forEach((savingGroup) => {
              data.labels.push(savingGroup.name);
              dataTargets.labels.push(savingGroup.name);
              data.datasets[0].data.push(savingGroup.savedAmount);
              data.datasets[0].backgroundColor.push(savingGroup.color);
              dataTargets.data.push(savingGroup.savedAmount / savingGroup.targetAmount);
            });
            setDataTargets(dataTargets);
            setData(data);
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

  const handleOpenOptions = () => {
    navigation.navigate("Options", { accountId: account.id });
  };

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
        <Text
          style={{
            textAlign: "center", // Centra el texto horizontalmente
            flexWrap: "wrap", // Permite ajustar el texto a múltiples líneas
            width: "100%", // Asegura que el texto ocupe todo el ancho del contenedor
            fontSize: 18, // Ajusta el tamaño según necesites
            fontWeight: "bold", // Opcional: Destaca el título
            lineHeight: 22, // Evita que las líneas se monten entre sí
            marginBottom: 10, // Espaciado inferior para separar del balance
          }}
        >
          {account.name.toUpperCase()}
        </Text>
        <Text
          variant="headlineLarge"
          style={{
            fontWeight: "bold",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          {account.balance.toLocaleString(account.locale, {
            style: "currency",
            currency: account.currency,
          })}
        </Text>
      </Card>


      <Card style={{ width: "100%", padding: 10, alignItems: "center" }}>
        <Text style={{ fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>GRUPOS</Text>
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
      <Card style={{ width: "100%", padding: 10, alignItems: "center", marginTop: 20 }}>
        <Text style={{ fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>OBJETIVOS</Text>
        <ProgressChart
          data={dataTargets}
          width={screenWidth * 0.9}
          height={220}
          strokeWidth={16}
          radius={32}
          chartConfig={chartConfig}
          backgroundColor="transparent"
          hideLegend={false}
          absolute={true}
        />
      </Card>
      <FloatingButton onPress={handleOpenOptions}  iconName="menu" position = 'top-right'/>
    </ScrollView>
  );
};

export default HomeScreen;
