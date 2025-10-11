// src/screens/SettingsScreen.js
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as LocalAuthentication from "expo-local-authentication";
import { useThemeContext } from "../context/ThemeContext";
import { useExpenses } from "../storage/db"; // to read items for export

export default function SettingsScreen({ navigation }) {
  const { mode, toggle } = useThemeContext();
  const { items = [] } = (typeof useExpenses === "function" ? useExpenses() : {}) ?? {};

  // Currency
  const [currency, setCurrency] = useState("NZD");
  // Biometric lock
  const [lockEnabled, setLockEnabled] = useState(false);
  // Import modal
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  useEffect(() => {
    (async () => {
      const c = await AsyncStorage.getItem("currency");
      if (c) setCurrency(c);
      const le = await AsyncStorage.getItem("lockEnabled");
      if (le) setLockEnabled(le === "true");
    })();
  }, []);

  async function saveCurrency(val) {
    setCurrency(val.toUpperCase());
    await AsyncStorage.setItem("currency", val.toUpperCase());
    Alert.alert("Saved", `Currency set to ${val.toUpperCase()}`);
  }

  // --- Export helpers ---
  function toCSV(rows) {
    const header = ["id", "title", "amount", "date", "category", "note"];
    const esc = (x) => `"${String(x ?? "").replace(/"/g, '""')}"`;
    const data = rows.map((e) => [
      e.id ?? "",
      e.title ?? "",
      e.amount ?? "",
      e.date ?? "",
      e.category ?? "",
      e.note ?? "",
    ]);
    return [header, ...data].map((r) => r.map(esc).join(",")).join("\n");
  }

  async function exportJSON() {
    const path = FileSystem.cacheDirectory + "expenses.json";
    await FileSystem.writeAsStringAsync(path, JSON.stringify(items, null, 2));
    await Sharing.shareAsync(path);
  }

  async function exportCSV() {
    const path = FileSystem.cacheDirectory + "expenses.csv";
    const csv = toCSV(items);
    await FileSystem.writeAsStringAsync(path, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Sharing.shareAsync(path);
  }

  // --- Import (paste JSON) ---
  async function performImport() {
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) throw new Error("Expected an array of expenses.");
      // Merge/replace strategy: replace all
      await AsyncStorage.setItem("expenses:v1", JSON.stringify(parsed));
      setShowImport(false);
      setImportText("");
      Alert.alert("Import complete", "Restart the app to see updated data.");
    } catch (e) {
      Alert.alert("Invalid JSON", e.message);
    }
  }

  // --- Biometric ---
  async function testBiometric() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return Alert.alert("Not available", "This device has no biometric hardware.");
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled)
      return Alert.alert("No biometrics enrolled", "Set up Face/Touch ID or a fingerprint first.");

    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock Expense Tracker",
      cancelLabel: "Cancel",
      disableDeviceFallback: false,
    });
    Alert.alert(res.success ? "Unlocked" : "Failed", res.success ? "Authentication successful." : "Could not verify your identity.");
  }

  async function toggleLock(v) {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (v && (!hasHardware || !enrolled)) {
      return Alert.alert(
        "Biometric not ready",
        "Your device must have biometrics set up before enabling the lock."
      );
    }
    setLockEnabled(v);
    await AsyncStorage.setItem("lockEnabled", String(v));
    if (v) Alert.alert("Enabled", "Biometric lock will be required on launch.");
  }

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Settings</Text>

      {/* Theme */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Appearance</Text>
        <TouchableOpacity style={styles.btn} onPress={toggle}>
          <Text style={styles.btnText}>Toggle Dark Mode ({mode})</Text>
        </TouchableOpacity>
      </View>

      {/* Currency */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Currency</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {["NZD", "USD", "AUD", "INR"].map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => saveCurrency(c)}
              style={[
                styles.pill,
                currency === c && { backgroundColor: "#111827" },
              ]}
            >
              <Text style={[styles.pillText, currency === c && { color: "#fff" }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: "row", marginTop: 10, gap: 8 }}>
          <TextInput
            value={currency}
            onChangeText={setCurrency}
            placeholder="e.g., NZD"
            autoCapitalize="characters"
            style={styles.input}
          />
          <TouchableOpacity style={[styles.btnSm]} onPress={() => saveCurrency(currency)}>
            <Text style={styles.btnSmText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Data */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data</Text>
        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          <TouchableOpacity style={styles.btn} onPress={exportJSON}>
            <Text style={styles.btnText}>Export JSON</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={exportCSV}>
            <Text style={styles.btnText}>Export CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#0a7" }]}
            onPress={() => setShowImport(true)}
          >
            <Text style={styles.btnText}>Import (Paste JSON)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Security */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Security</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.text}>Require biometric on launch</Text>
          <Switch value={lockEnabled} onValueChange={toggleLock} />
        </View>
        <TouchableOpacity style={styles.btnOutline} onPress={testBiometric}>
          <Text style={styles.btnOutlineText}>Test unlock now</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#ef4444", marginTop: 10 }]}
        onPress={logout}
      >
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity>

      {/* Import modal */}
      <Modal transparent visible={showImport} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.cardTitle}>Paste expenses JSON</Text>
            <TextInput
              value={importText}
              onChangeText={setImportText}
              placeholder='[ { "id": "...", "title": "...", ... } ]'
              multiline
              style={styles.importBox}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity onPress={() => setShowImport(false)}>
                <Text style={styles.text}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={performImport}>
                <Text style={[styles.text, { fontWeight: "800", color: "#0a7" }]}>
                  Import
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 16, backgroundColor: "#f7f8fb" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: { fontWeight: "800", marginBottom: 8, color: "#111827" },

  btn: {
    backgroundColor: "#5b61f6",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },

  btnSm: {
    backgroundColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnSmText: { color: "#fff", fontWeight: "700" },

  btnOutline: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  btnOutlineText: { color: "#111827", fontWeight: "700" },

  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#eef2ff",
    borderRadius: 999,
  },
  pillText: { color: "#111827", fontWeight: "700" },

  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },

  text: { color: "#111827" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "#0008",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
  },
  importBox: {
    height: 160,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#f9fafb",
    textAlignVertical: "top",
    marginBottom: 10,
  },
});
