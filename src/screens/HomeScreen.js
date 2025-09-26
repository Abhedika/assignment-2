// src/screens/HomeScreen.js
import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExpenses } from "../storage/db";
import ChartCard from "../components/ChartCard";
import DismissKeyboardView from "../components/DismissKeyboardView";
import theme from "../theme";
import { useThemeContext } from "../context/ThemeContext";

const ranges = ["Today", "Week", "Month", "All"];

// --- helpers for date filtering ---
const toDate = (d) => (d instanceof Date ? d : new Date(String(d)));
const ymd = (d) => toDate(d).toISOString().slice(0, 10);
const isToday = (d) => ymd(d) === ymd(new Date());
const isThisWeek = (d) => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6); // last 7 days inclusive
  const dt = toDate(d);
  return dt >= new Date(start.toDateString()) && dt <= now;
};
const isThisMonth = (d) => {
  const dt = toDate(d);
  const now = new Date();
  return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
};

export default function HomeScreen({ navigation }) {
  // ✅ null-safe: never crash even if provider isn't mounted yet
  const exp = (typeof useExpenses === "function" ? useExpenses() : null) ?? {};
  const {
    items = [],
    remove = () => {},
    total = 0,
    isReady = true,
  } = exp;

  const { resolved } = useThemeContext();
  const t = resolved === "dark" ? theme.dark : theme.light;

  const [q, setQ] = useState("");
  const [range, setRange] = useState("All");

  const filtered = useMemo(() => {
    const passesRange = (d) => {
      if (!d || range === "All") return true;
      if (range === "Today") return isToday(d);
      if (range === "Week") return isThisWeek(d);
      if (range === "Month") return isThisMonth(d);
      return true;
    };
    return (items || [])
      .filter((x) => passesRange(x.date))
      .filter((x) =>
        q ? x.title?.toLowerCase().includes(q.toLowerCase()) : true
      );
  }, [items, q, range]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <DismissKeyboardView style={{ flex: 1, padding: 16 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.h, { color: t.text }]}>Expense Tracker</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable onPress={() => navigation.navigate("Settings")} style={[styles.iconBtn, { backgroundColor: t.card, borderColor: t.border }]}>
              <Text style={{ color: t.text }}>⚙️</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate("Edit", { mode: "add" })} style={[styles.iconBtn, { backgroundColor: t.card, borderColor: t.border }]}>
              <Text style={{ color: t.text }}>➕</Text>
            </Pressable>
          </View>
        </View>

        {/* Total */}
        <View style={[styles.totalCard, { backgroundColor: t.card, borderColor: t.border }, t.shadow]}>
          <Text style={[styles.totalLabel, { color: t.muted }]}>Total Spent</Text>
          <Text style={[styles.totalValue, { color: t.text }]}>
            ${Number(total || 0).toFixed(2)}
          </Text>
        </View>

        {/* Search */}
        <TextInput
          placeholder="Search expenses…"
          value={q}
          onChangeText={setQ}
          style={[
            styles.search,
            { backgroundColor: t.card, borderColor: t.border, color: t.text },
          ]}
          placeholderTextColor={t.muted}
        />

        {/* Range pills */}
        <View style={styles.pills}>
          {ranges.map((r) => {
            const on = range === r;
            return (
              <Pressable
                key={r}
                onPress={() => setRange(r)}
                style={[
                  styles.pill,
                  { backgroundColor: on ? "#0a7" : t.card, borderColor: t.border },
                ]}
              >
                <Text style={{ color: on ? "#fff" : t.text }}>{r}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Chart */}
        <ChartCard data={filtered} />

        {/* List */}
        {filtered.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 10, color: t.muted }}>
            {isReady ? "No expenses match. Try changing filters." : "Loading…"}
          </Text>
        ) : (
          filtered.map((e) => (
            <View
              key={e.id}
              style={[
                styles.rowItem,
                { backgroundColor: t.card, borderColor: t.border },
              ]}
            >
              <Text style={{ flex: 1, color: t.text }}>{e.title}</Text>
              <Text style={{ color: t.text }}>${Number(e.amount).toFixed(2)}</Text>
              <Pressable onPress={() => remove(e.id)} style={styles.del}>
                <Text style={{ color: t.text }}>🗑️</Text>
              </Pressable>
            </View>
          ))
        )}
      </DismissKeyboardView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  h: { fontSize: 20, fontWeight: "bold" },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  totalCard: {
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
  },
  totalLabel: { fontWeight: "600" },
  totalValue: { fontSize: 24, fontWeight: "bold" },
  search: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 8,
  },
  pills: { flexDirection: "row", gap: 8, marginBottom: 6 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
    gap: 8,
  },
  del: { paddingHorizontal: 6, paddingVertical: 2 },
});
