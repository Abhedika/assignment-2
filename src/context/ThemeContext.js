import React, { createContext, useMemo, useState, useEffect, useContext } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "prefs:theme"; // "system" | "light" | "dark"

const Ctx = createContext({
  mode: "system",
  setMode: () => {},
  toggle: () => {},
  resolved: "light"
});

export function ThemeProvider({ children }) {
  const sys = useColorScheme();          // "light" | "dark"
  const [mode, setMode] = useState("system");

  useEffect(() => { AsyncStorage.getItem(KEY).then(v => v && setMode(v)); }, []);
  useEffect(() => { AsyncStorage.setItem(KEY, mode).catch(()=>{}); }, [mode]);

  const resolved = mode === "system" ? (sys || "light") : mode;
  const toggle = () => setMode(m => (m === "light" ? "dark" : m === "dark" ? "system" : "light"));

  const value = useMemo(() => ({ mode, setMode, toggle, resolved }), [mode, resolved]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useThemeContext() {
  return useContext(Ctx);
}
