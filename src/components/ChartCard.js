import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import theme from "../theme";

/** props.data = [{ amount:number, category?:string }] */
export default function ChartCard({ data = [] }) {
  const t = theme.light;

  // Aggregate by category and compute total
  const { rows, total } = useMemo(() => {
    const map = new Map();
    (data || []).forEach((e) => {
      const amt = Number(e?.amount) || 0;
      if (amt <= 0) return;
      const cat = (e?.category || "Other").trim();
      map.set(cat, (map.get(cat) || 0) + amt);
    });
    const rows = Array.from(map, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    const total = rows.reduce((s, r) => s + r.value, 0);
    return { rows, total };
  }, [data]);

  const hasData = rows.length > 0 && total > 0;

  const palette = [t.tint || "#0a7", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6", "#F472B6"];

  // Donut geometry
  const size = 240, cx = size / 2, cy = size / 2, r = 100, innerR = 64;

  const polar = (cx, cy, radius, angle) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  });

  const sectorPath = (cx, cy, radius, startAngle, endAngle) => {
    const start = polar(cx, cy, radius, startAngle);
    const end = polar(cx, cy, radius, endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  };

  let current = -Math.PI / 2; // 12 o'clock
  const segments = hasData
    ? rows.map((row, idx) => {
        const sweep = (row.value / total) * Math.PI * 2;
        const start = current;
        const end = current + sweep;
        current = end;
        return { ...row, color: palette[idx % palette.length], d: sectorPath(cx, cy, r, start, end) };
      })
    : [];

  return (
    <View style={[styles.card, { backgroundColor: t.card }, t.shadow]}>
      <Text style={styles.title}>Spending by Category</Text>

      {!hasData ? (
        <View style={styles.placeholderWrap}>
          <Svg width={120} height={120} viewBox="0 0 120 120">
            <Circle cx="60" cy="60" r="48" stroke="#EEF1FF" strokeWidth="16" fill="none" />
            <Circle cx="60" cy="60" r="48" stroke="#F5F6FA" strokeWidth="16" fill="none" strokeDasharray="300" strokeDashoffset="260" strokeLinecap="round" />
          </Svg>
          <Text style={{ color: t.muted, marginTop: 8 }}>No data yet</Text>
        </View>
      ) : (
        <>
          <View style={styles.chartWrap}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {segments.map((seg) => <Path key={seg.label} d={seg.d} fill={seg.color} />)}
              <Circle cx={cx} cy={cy} r={innerR} fill={t.card} />
            </Svg>
            <View pointerEvents="none" style={styles.centerLabel}>
              <Text style={{ color: t.muted, fontSize: 12 }}>TOTAL</Text>
              <Text style={{ color: t.text, fontWeight: "700", fontSize: 18 }}>${total.toFixed(2)}</Text>
            </View>
          </View>

          <View style={{ gap: 6, marginTop: 6 }}>
            {rows.map((row, idx) => (
              <View key={row.label} style={styles.legendRow}>
                <View style={[styles.swatch, { backgroundColor: palette[idx % palette.length] }]} />
                <Text style={[styles.cat, { color: t.text }]}>{row.label}</Text>
                <Text style={styles.val}>${row.value.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, marginBottom: 14 },
  title: { fontWeight: "700", fontSize: 15, marginBottom: 6 },
  placeholderWrap: { alignItems: "center", paddingVertical: 12 },
  chartWrap: { alignItems: "center", justifyContent: "center", width: 240, height: 240, alignSelf: "center" },
  centerLabel: { position: "absolute", alignItems: "center" },
  legendRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F0F1F5" },
  swatch: { width: 12, height: 12, borderRadius: 3, marginRight: 8 },
  cat: { fontWeight: "600" },
  val: { marginLeft: "auto", fontWeight: "700", color: "#111827" },
});
