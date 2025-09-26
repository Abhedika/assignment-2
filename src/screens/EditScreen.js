// src/screens/EditScreen.js
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExpenses } from "../storage/db";

const CATEGORIES = [
  "General",
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Health",
  "Entertainment",
  "Grocery",
];

function Chip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      android_ripple={{ color: "#e5e7eb" }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function EditScreen({ route, navigation }) {
  const { mode, item } = route.params || { mode: "add" };
  const isEdit = mode === "edit";
  const { add, update, remove } = useExpenses();

  const [title, setTitle] = useState(item?.title ?? "");
  const [amount, setAmount] = useState(item?.amount ? String(item.amount) : "");
  const [category, setCategory] = useState(item?.category ?? "General");
  const [note, setNote] = useState(item?.note ?? "");

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? "Edit Expense" : "Add Expense" });
  }, [isEdit, navigation]);

  const onSave = () => {
    const amt = Number(amount);
    if (!title.trim()) return Alert.alert("Title required", "Please enter a title.");
    if (!amount || isNaN(amt) || amt <= 0)
      return Alert.alert("Amount invalid", "Enter a positive number.");

    const payload = {
      title: title.trim(),
      amount: amt,
      category,
      note: note.trim(),
    };

    if (isEdit) update(item.id, payload);
    else add(payload);

    navigation.goBack();
  };

  const onDelete = () =>
    Alert.alert("Delete expense?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          remove(item.id);
          navigation.goBack();
        },
      },
    ]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1, backgroundColor: "#f7f8fb" }}
    >
      <SafeAreaView style={styles.safe}>
        {/* Tap anywhere to dismiss keyboard */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.form}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Grocery"
              style={styles.input}
              returnKeyType="next"
            />

            <Text style={styles.label}>Amount</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="e.g., 250"
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.chipsRow}>
              {CATEGORIES.map((c) => (
                <Chip key={c} label={c} active={c === category} onPress={() => setCategory(c)} />
              ))}
            </View>

            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="All the basic grocery"
              style={[styles.input, styles.noteInput]}
              multiline
              returnKeyType="default"
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={onSave} activeOpacity={0.9}>
              <Text style={styles.primaryBtnText}>{isEdit ? "Save Changes" : "Add Expense"}</Text>
            </TouchableOpacity>

            {isEdit && (
              <TouchableOpacity style={styles.dangerBtn} onPress={onDelete}>
                <Text style={styles.dangerBtnText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  form: { flex: 1, padding: 16 },
  label: { marginTop: 10, marginBottom: 6, color: "#111827", fontWeight: "700" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  noteInput: { height: 110, textAlignVertical: "top" },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 6 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#F1F5FF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: { backgroundColor: "#635BFF", borderColor: "#635BFF" },
  chipText: { color: "#4c51f7", fontWeight: "700" },
  chipTextActive: { color: "#fff" },

  primaryBtn: {
    marginTop: 16,
    backgroundColor: "#635BFF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  dangerBtn: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ef4444",
    backgroundColor: "#fff5f5",
  },
  dangerBtnText: { color: "#b91c1c", fontWeight: "800" },
});
