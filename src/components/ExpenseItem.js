// src/components/ExpenseItem.js
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ExpenseItem({ item, onPress, onLongPress }) {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          {item.category} · {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {!!item.note && <Text style={styles.note} numberOfLines={1}>{item.note}</Text>}
      </View>
      <Text style={styles.amount}>${Number(item.amount).toFixed(2)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff", padding: 14, borderRadius: 14,
    flexDirection: "row", alignItems: "center", marginBottom: 12, elevation: 2,
  },
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },
  meta: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  note: { fontSize: 12, color: "#374151", marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "800", color: "#635BFF" },
});
