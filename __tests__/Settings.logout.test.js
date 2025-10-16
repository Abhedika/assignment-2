import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SettingsScreen from "../src/screens/SettingsScreen";
import { ThemeProvider } from "../src/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// In-memory AsyncStorage mock (same shape as SettingsScreen.test)
jest.mock("@react-native-async-storage/async-storage", () => {
  const mem = new Map();
  return {
    setItem: jest.fn((k, v) => { mem.set(k, v); return Promise.resolve(); }),
    getItem: jest.fn((k) => Promise.resolve(mem.get(k) ?? null)),
    removeItem: jest.fn((k) => { mem.delete(k); return Promise.resolve(); }),
  };
});

const renderWithProviders = (ui, navigation) =>
  render(<ThemeProvider>{React.cloneElement(ui, { navigation })}</ThemeProvider>);

test("logout clears AsyncStorage and redirects to Login", async () => {
  const replace = jest.fn();
  const navigation = { replace, setOptions: jest.fn() }; // setOptions to satisfy useEffect

  const { getByText } = renderWithProviders(<SettingsScreen />, navigation);

  // Tap Logout
  fireEvent.press(getByText("Logout"));

  await waitFor(() => {
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("user");
  });

  expect(replace).toHaveBeenCalledWith("Login");
});
