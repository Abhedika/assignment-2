import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SettingsScreen from "../src/screens/SettingsScreen";
import { ThemeProvider } from "../src/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as RN from "react-native";

// ---------- Mocks ----------
// In-memory AsyncStorage
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

// Lock system theme to light so "system" is deterministic
jest.spyOn(RN, "useColorScheme").mockReturnValue("light");

// ---------- Helpers ----------
const renderWithProviders = (ui) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

// ---------- Tests ----------
test("renders settings without crashing", () => {
  const { getByText } = renderWithProviders(<SettingsScreen />);
  // sanity check: the three options are visible
  getByText("SYSTEM");
  getByText("LIGHT");
  getByText("DARK");
});

test("selecting DARK updates the stored preference", async () => {
  const { getByText } = renderWithProviders(<SettingsScreen />);
  fireEvent.press(getByText("DARK"));

  await waitFor(() => {
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  // Check the latest write
  const calls = AsyncStorage.setItem.mock.calls;
  const [key, value] = calls[calls.length - 1];

  expect(key).toBe("prefs:theme"); // the key used in ThemeContext
  expect(value).toBe("dark");
});
