import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [user, setUser] = useState("");

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem("user");
      if (u) navigation.replace("Home");
    })();
  }, []);

  const login = async () => {
    if (!user.trim()) return;
    await AsyncStorage.setItem("user", user);
    navigation.replace("Home");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>ExpenseTracker Login</Text>
      <TextInput
        placeholder="Enter username"
        value={user}
        onChangeText={setUser}
        style={styles.input}
      />
      <TouchableOpacity style={styles.btn} onPress={login}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, width: "70%", marginBottom: 12 },
  btn: { backgroundColor: "#a37de9ff", padding: 12, borderRadius: 6 },
  btnText: { color: "#fff", fontWeight: "700" },
});
