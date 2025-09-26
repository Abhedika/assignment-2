import React from "react";
import { SafeAreaView, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeContext } from "../context/ThemeContext";

export default function SettingsScreen({ navigation }) {
  const { mode, toggle } = useThemeContext();

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Settings</Text>
      <TouchableOpacity style={styles.btn} onPress={toggle}>
        <Text style={styles.btnText}>Toggle Dark Mode ({mode})</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, { backgroundColor: "#ef4444" }]} onPress={logout}>
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  btn: { backgroundColor: "#5b61f6", padding: 14, borderRadius: 8, marginBottom: 12 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});
