// App.js
import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import HomeScreen from "./src/screens/HomeScreen";
import EditScreen from "./src/screens/EditScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import LoginScreen from "./src/screens/LoginScreen";

import { ThemeProvider, useThemeContext } from "./src/context/ThemeContext";
import { ExpensesProvider } from "./src/storage/db";

const RootStack = createNativeStackNavigator();

function AppShell() {
  const { resolved } = useThemeContext();
  const navTheme = resolved === "dark" ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator screenOptions={{ headerBackTitle: "Back" }}>
        <RootStack.Screen name="Home" component={HomeScreen} options={{ title: "Expense Tracker" }} />
        <RootStack.Screen name="Edit" component={EditScreen} options={{ title: "Add / Edit" }} />
        <RootStack.Screen name="Settings" component={SettingsScreen} />
        <RootStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ExpensesProvider>
          <AppShell />
        </ExpensesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}