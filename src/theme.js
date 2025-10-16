// default export to match existing imports like: import theme from "../theme"
const theme = {
  light: {
    bg: "#ffffff",
    card: "#ffffff",
    text: "#111827",
    muted: "#6b7280",
    border: "#e5e7eb",
    tint: "#0a7",
    shadow: { elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }
  },
  dark: {
    bg: "#0b0b0d",
    card: "#16181c",
    text: "#f3f4f6",
    muted: "#9ca3af",
    border: "#2a2d33",
    tint: "#4cc9f0",
    shadow: {}
  }
};

export default theme;
