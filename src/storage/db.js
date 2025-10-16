// src/storage/db.js
import React, { useEffect, useMemo, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "expenses:v1";

const defaultValue = {
  items: [],
  add: () => {},
  update: () => {},
  remove: () => {},
  total: 0,
  isReady: false,
};

const ExpensesContext = React.createContext(defaultValue);

export function useExpenses() {
  return useContext(ExpensesContext) ?? defaultValue;
}

export function ExpensesProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setItems(JSON.parse(raw));
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (isReady) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isReady]);

  const add = (e) => {
    const now = new Date();
    setItems((prev) => [
      {
        id: String(now.getTime()),
        createdAt: now.getTime(),
        date: now.toISOString().slice(0, 10), // used by filters
        ...e,
      },
      ...prev,
    ]);
  };

  const update = (id, patch) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const remove = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  const total = useMemo(
    () => items.reduce((sum, it) => sum + Number(it.amount || 0), 0),
    [items]
  );

  const value = { items, add, update, remove, total, isReady };
  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}
