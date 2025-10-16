// src/screens/HomeScreen.js
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExpenses } from "../storage/db";
import ChartCard from "../components/ChartCard";
import DismissKeyboardView from "../components/DismissKeyboardView";
import theme from "../theme";
import { useThemeContext } from "../context/ThemeContext";

const ranges = ["Today", "Week", "Month", "All"];

// helpers
const toDate = (d) => (d instanceof Date ? d : new Date(String(d)));
const ymd = (d) => toDate(d).toISOString().slice(0, 10);
const isToday = (d) => ymd(d) === ymd(new Date());
const isThisWeek = (d) => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  const dt = toDate(d);
  return dt >= new Date(start.toDateString()) && dt <= now;
};
const isThisMonth = (d) => {
  const dt = toDate(d);
  const now = new Date();
  return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
};

export default function HomeScreen({ navigation }) {
  const exp = (typeof useExpenses === "function" ? useExpenses() : null) ?? {};
  const { items = [], add = () => {}, remove = () => {}, total = 0, isReady = true } = exp;

  const { resolved } = useThemeContext();
  const t = resolved === "dark" ? theme.dark : theme.light;

  const [q, setQ] = useState("");
  const [range, setRange] = useState("All");

  // KPIs
  const kpis = useMemo(() => {
    const sum = (arr) => arr.reduce((a, x) => a + Number(x.amount || 0), 0);
    const todaySum = sum(items.filter((x) => isToday(x.date)));
    const monthSum = sum(items.filter((x) => isThisMonth(x.date)));
    return { todaySum, monthSum, count: items.length, allSum: sum(items) };
  }, [items]);

  // Filters
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
        q ? `${x.title} ${x.notes || ""}`.toLowerCase().includes(q.toLowerCase()) : true
      );
  }, [items, q, range]);

  // Quick Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [qaTitle, setQaTitle] = useState("");
  const [qaAmount, setQaAmount] = useState("");
  const [qaCategory, setQaCategory] = useState("General");

  const submitQuickAdd = () => {
    const amt = Number(qaAmount);
    if (!qaTitle || !amt) return;
    const today = ymd(new Date());
    add({
      title: qaTitle.trim(),
      amount: amt,
      category: qaCategory.trim() || "General",
      date: today,
    });
    setQaTitle("");
    setQaAmount("");
    setQaCategory("General");
    setShowAdd(false);
  };

  const recent = filtered.slice(0, 10);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <DismissKeyboardView style={{ flex: 1, padding: 16 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.h, { color: t.text }]}>Expense Tracker</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={() => navigation.navigate("Settings")}
              style={[styles.iconBtn, { backgroundColor: t.card, borderColor: t.border }]}
            >
              <Text style={{ color: t.text }}>⚙️</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowAdd(true)}
              style={[styles.iconBtn, { backgroundColor: t.card, borderColor: t.border }]}
            >
              <Text style={{ color: t.text }}>➕</Text>
            </Pressable>
          </View>
        </View>

        {/* KPIs */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: t.card, borderColor: t.border }, t.shadow]}>
            <Text style={[styles.kpiLabel, { color: t.muted }]}>Today</Text>
            <Text style={[styles.kpiVal, { color: t.text }]}>{`$${kpis.todaySum.toFixed(2)}`}</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: t.card, borderColor: t.border }, t.shadow]}>
            <Text style={[styles.kpiLabel, { color: t.muted }]}>Month</Text>
            <Text style={[styles.kpiVal, { color: t.text }]}>{`$${kpis.monthSum.toFixed(2)}`}</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: t.card, borderColor: t.border }, t.shadow]}>
            <Text style={[styles.kpiLabel, { color: t.muted }]}>Items</Text>
            <Text style={[styles.kpiVal, { color: t.text }]}>{kpis.count}</Text>
          </View>
        </View>

        {/* Total */}
        <View style={[styles.totalCard, { backgroundColor: t.card, borderColor: t.border }, t.shadow]}>
          <Text style={[styles.totalLabel, { color: t.muted }]}>Total Spent (All)</Text>
          <Text style={[styles.totalValue, { color: t.text }]}>{`$${Number(total || 0).toFixed(2)}`}</Text>
        </View>

        {/* Search */}
        <TextInput
          placeholder="Search expenses…"
          value={q}
          onChangeText={setQ}
          style={[styles.search, { backgroundColor: t.card, borderColor: t.border, color: t.text }]}
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
                style={[styles.pill, { backgroundColor: on ? "#0a7" : t.card, borderColor: t.border }]}
              >
                <Text style={{ color: on ? "#fff" : t.text }}>{r}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Category Pie Chart */}
        <ChartCard title="Spending by Category" data={filtered} />

        {/* Recent header */}
        <View style={styles.sectionHeader}>
          <Text style={{ fontWeight: "bold", color: t.text }}>Recent</Text>
          <Pressable onPress={() => setShowAdd(true)}>
            <Text style={{ color: t.accent || "#0a7" }}>＋ Quick Add</Text>
          </Pressable>
        </View>

        {/* List */}
        {recent.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 10, color: t.muted }}>
            {isReady ? "No expenses match. Try changing filters." : "Loading…"}
          </Text>
        ) : (
          recent.map((e) => (
            <View
              key={e.id}
              style={[styles.rowItem, { backgroundColor: t.card, borderColor: t.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontWeight: "600" }}>{e.title}</Text>
                <Text style={{ color: t.muted, fontSize: 12 }}>
                  {e.category || "General"} • {ymd(e.date)}
                </Text>
              </View>
              <Text style={{ color: t.text }}>{`$${Number(e.amount).toFixed(2)}`}</Text>
              <Pressable onPress={() => remove(e.id)} style={styles.del}>
                <Text style={{ color: t.text }}>🗑️</Text>
              </Pressable>
            </View>
          ))
        )}

        {/* Quick Add Modal */}
        <Modal visible={showAdd} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: "#0008", justifyContent: "flex-end" }}>
            <View
              style={{
                backgroundColor: t.card,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: t.border,
                gap: 8,
              }}
            >
              <Text style={{ color: t.text, fontWeight: "bold", fontSize: 16 }}>Quick Add</Text>

              <TextInput
                placeholder="Title"
                value={qaTitle}
                onChangeText={setQaTitle}
                style={[styles.input, { backgroundColor: t.bg, borderColor: t.border, color: t.text }]}
                placeholderTextColor={t.muted}
              />
              <TextInput
                placeholder="Amount"
                value={qaAmount}
                onChangeText={setQaAmount}
                keyboardType="decimal-pad"
                style={[styles.input, { backgroundColor: t.bg, borderColor: t.border, color: t.text }]}
                placeholderTextColor={t.muted}
              />
              <TextInput
                placeholder="Category (e.g. Food)"
                value={qaCategory}
                onChangeText={setQaCategory}
                style={[styles.input, { backgroundColor: t.bg, borderColor: t.border, color: t.text }]}
                placeholderTextColor={t.muted}
              />

              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 16, marginTop: 4 }}>
                <Pressable onPress={() => setShowAdd(false)}>
                  <Text style={{ color: t.text }}>Cancel</Text>
                </Pressable>
                <Pressable onPress={submitQuickAdd}>
                  <Text style={{ color: t.accent || "#0a7", fontWeight: "bold" }}>Add</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </DismissKeyboardView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  h: { fontSize: 20, fontWeight: "bold" },
  iconBtn: { padding: 8, borderRadius: 10, borderWidth: 1 },

  kpiRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  kpiCard: { flex: 1, borderRadius: 12, padding: 12, borderWidth: 1, alignItems: "center" },
  kpiLabel: { fontSize: 12, fontWeight: "600" },
  kpiVal: { fontSize: 18, fontWeight: "bold" },

  totalCard: { borderRadius: 12, padding: 12, alignItems: "center", marginBottom: 8, borderWidth: 1 },
  totalLabel: { fontWeight: "600" },
  totalValue: { fontSize: 24, fontWeight: "bold" },

  search: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginVertical: 8 },
  pills: { flexDirection: "row", gap: 8, marginBottom: 6 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },

  sectionHeader: { marginTop: 8, marginBottom: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowItem: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10, borderWidth: 1, marginTop: 8, gap: 8 },
  del: { paddingHorizontal: 6, paddingVertical: 2 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
});
