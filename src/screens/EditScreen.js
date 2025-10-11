// src/screens/EditScreen.js
import React, { useEffect, useMemo, useState } from "react";
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
  Image,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useExpenses } from "../storage/db";

// Helpers
const toDate = (d) => (d instanceof Date ? d : new Date(String(d)));
const ymd = (d) => toDate(d).toISOString().slice(0, 10);

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
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function EditScreen({ route, navigation }) {
  const { mode, item } = route.params || { mode: "add" };
  const isEdit = mode === "edit";
  const { add, update, remove } = useExpenses();

  // Base fields
  const [title, setTitle] = useState(item?.title ?? "");
  const [amount, setAmount] = useState(item?.amount ? String(item.amount) : "");
  const [category, setCategory] = useState(item?.category ?? "General");
  const [note, setNote] = useState(item?.note ?? "");

  // Date (YYYY-MM-DD)
  const [date, setDate] = useState(item?.date ? toDate(item.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Photo
  const [photoUri, setPhotoUri] = useState(item?.photoUri ?? null);

  // Recurring
  const initialEvery = item?.recurring?.every ?? "none"; // 'none' | 'week' | 'month'
  const [every, setEvery] = useState(initialEvery);
  // For weekly, dayOfWeek: 0-6 (Sun-Sat). For monthly, dayOfMonth: 1-28 (safe).
  const [dayOfWeek, setDayOfWeek] = useState(
    typeof item?.recurring?.day === "number" && initialEvery === "week"
      ? item.recurring.day
      : new Date().getDay()
  );
  const [dayOfMonth, setDayOfMonth] = useState(
    typeof item?.recurring?.day === "number" && initialEvery === "month"
      ? Math.min(Math.max(item.recurring.day, 1), 28)
      : Math.min(new Date().getDate(), 28)
  );

  // Due date (optional)
  const [hasDue, setHasDue] = useState(!!item?.dueAt);
  const [dueAt, setDueAt] = useState(item?.dueAt ? toDate(item.dueAt) : new Date());
  const [showDuePicker, setShowDuePicker] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? "Edit Expense" : "Add Expense" });
  }, [isEdit, navigation]);

  const recurringPayload = useMemo(() => {
    if (every === "none") return null;
    return {
      every, // 'week' | 'month'
      day: every === "week" ? dayOfWeek : dayOfMonth,
    };
  }, [every, dayOfWeek, dayOfMonth]);

  const onSave = () => {
    const amt = Number(amount);
    if (!title.trim())
      return Alert.alert("Title required", "Please enter a title.");
    if (!amount || isNaN(amt) || amt <= 0)
      return Alert.alert("Amount invalid", "Enter a positive number.");

    const payload = {
      title: title.trim(),
      amount: amt,
      category,
      note: note.trim(),
      date: ymd(date), // persist as ISO YYYY-MM-DD
      photoUri: photoUri || null,
      recurring: recurringPayload,
      dueAt: hasDue ? new Date(dueAt).toISOString() : null,
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

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo library access to attach a receipt.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  }

  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1, backgroundColor: "#f7f8fb" }}
    >
      <SafeAreaView style={styles.safe}>
        {/* Tap anywhere to dismiss keyboard */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.form}>

            {/* Title */}
            <Text style={styles.label}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Grocery"
              style={styles.input}
              returnKeyType="next"
            />

            {/* Amount */}
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

            {/* Date */}
            <Text style={styles.label}>Date</Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={[styles.input, styles.pressableField]}
            >
              <Text style={styles.pressableText}>{ymd(date)}</Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(e, sel) => {
                  setShowDatePicker(false);
                  if (sel) setDate(sel);
                }}
                maximumDate={new Date()}
              />
            )}

            {/* Category */}
            <Text style={styles.label}>Category</Text>
            <View style={styles.chipsRow}>
              {CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  active={c === category}
                  onPress={() => setCategory(c)}
                />
              ))}
            </View>

            {/* Note */}
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="e.g., Fruit, milk, bread..."
              style={[styles.input, styles.noteInput]}
              multiline
              returnKeyType="default"
            />

            {/* Photo */}
            <Text style={styles.label}>Photo (receipt, optional)</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <TouchableOpacity style={styles.outlineBtn} onPress={pickPhoto}>
                <Text style={styles.outlineBtnText}>Add Photo</Text>
              </TouchableOpacity>
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: 54, height: 54, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb" }}
                />
              ) : null}
            </View>

            {/* Recurring */}
            <Text style={styles.label}>Recurring</Text>
            <View style={styles.chipsRow}>
              {["none", "week", "month"].map((opt) => (
                <Chip
                  key={opt}
                  label={opt === "none" ? "None" : opt === "week" ? "Weekly" : "Monthly"}
                  active={every === opt}
                  onPress={() => setEvery(opt)}
                />
              ))}
            </View>

            {every === "week" && (
              <>
                <Text style={[styles.smallLabel]}>Day of week</Text>
                <View style={styles.chipsRow}>
                  {WEEKDAYS.map((d, idx) => (
                    <Chip
                      key={d}
                      label={d}
                      active={dayOfWeek === idx}
                      onPress={() => setDayOfWeek(idx)}
                    />
                  ))}
                </View>
              </>
            )}

            {every === "month" && (
              <>
                <Text style={[styles.smallLabel]}>Day of month (1–28)</Text>
                <TextInput
                  value={String(dayOfMonth)}
                  onChangeText={(txt) => {
                    const n = Math.max(1, Math.min(28, Number(txt) || 1));
                    setDayOfMonth(n);
                  }}
                  keyboardType="number-pad"
                  placeholder="1-28"
                  style={styles.input}
                />
              </>
            )}

            {/* Due date */}
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Due date (optional)</Text>
              <Switch value={hasDue} onValueChange={setHasDue} />
            </View>

            <Pressable
              disabled={!hasDue}
              onPress={() => setShowDuePicker(true)}
              style={[
                styles.input,
                styles.pressableField,
                !hasDue && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.pressableText}>
                {hasDue ? new Date(dueAt).toLocaleString() : "No due date"}
              </Text>
            </Pressable>
            {showDuePicker && (
              <DateTimePicker
                value={dueAt}
                mode="datetime"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(e, sel) => {
                  setShowDuePicker(false);
                  if (sel) setDueAt(sel);
                }}
                minimumDate={new Date()} // due is future by default
              />
            )}

            {/* Actions */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onSave}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryBtnText}>
                {isEdit ? "Save Changes" : "Add Expense"}
              </Text>
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
  label: { marginTop: 12, marginBottom: 6, color: "#111827", fontWeight: "700" },
  smallLabel: { marginTop: 8, marginBottom: 6, color: "#374151", fontWeight: "600" },

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

  pressableField: {
    justifyContent: "center",
  },
  pressableText: { color: "#111827", fontWeight: "600" },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },

  outlineBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  outlineBtnText: { color: "#111827", fontWeight: "700" },

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
