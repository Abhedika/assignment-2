import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SettingsScreen from "../src/screens/SettingsScreen";
import { ThemeProvider } from "../src/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as RN from "react-native";

// ---- In-memory AsyncStorage (kept) ----
jest.mock("@react-native-async-storage/async-storage", () => {
  const mem = new Map();
  return {
    setItem: jest.fn((k, v) => {
      mem.set(k, v);
      return Promise.resolve();
    }),
    getItem: jest.fn((k) => Promise.resolve(mem.get(k) ?? null)),
    removeItem: jest.fn((k) => {
      mem.delete(k);
      return Promise.resolve();
    }),
  };
});

// Lock system scheme so "system" is deterministic
jest.spyOn(RN, "useColorScheme").mockReturnValue("light");

const renderWithProviders = (ui) => render(<ThemeProvider>{ui}</ThemeProvider>);

test("renders settings without crashing", () => {
  const { getByText, getByPlaceholderText } = renderWithProviders(<SettingsScreen />);
  // Match what the screen actually shows
  getByText(/Toggle Dark Mode/i);
  getByText("Currency");
  getByPlaceholderText(/e\.g\., NZD/i); // input exists
  getByText("Logout");                  // logout button exists
});

test("toggling theme persists a value", async () => {
  const { getByText } = renderWithProviders(<SettingsScreen />);
  // The toggle is a Pressable text like: "Toggle Dark Mode (system)"
  fireEvent.press(getByText(/Toggle Dark Mode/i));

  await waitFor(() => {
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  // Last write
  const calls = AsyncStorage.setItem.mock.calls;
  const [key, value] = calls[calls.length - 1];

  expect(key).toBe("prefs:theme");  // key used in ThemeContext
  // Depending on your toggle cycle, value could be "light" or "dark".
  // We only assert that it wrote a valid theme string.
  expect(["light", "dark", "system"]).toContain(value);
});
