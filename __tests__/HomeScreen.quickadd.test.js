import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react-native";
import HomeScreen from "../src/screens/HomeScreen";

// Use the special "mock" prefix so Jest allows capturing it in the mock factory
const mockApi = {
  items: [],
  total: 0,
  isReady: true,
  add: jest.fn(),
  remove: jest.fn(),
};

jest.mock("../src/storage/db", () => ({ useExpenses: () => mockApi }));

jest.mock("../src/context/ThemeContext", () => ({
  useThemeContext: () => ({ resolved: "light", mode: "light", toggle: jest.fn() }),
}));

it("opens Quick Add, submits new expense", async () => {
  render(<HomeScreen navigation={{ navigate: jest.fn() }} />);
  fireEvent.press(screen.getByText("➕"));
  fireEvent.changeText(screen.getByPlaceholderText("Title"), "Milk");
  fireEvent.changeText(screen.getByPlaceholderText("Amount"), "3.2");
  fireEvent.changeText(screen.getByPlaceholderText(/Category/i), "Grocery");
  fireEvent.press(screen.getByText("Add"));

  await waitFor(() =>
    expect(mockApi.add).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Milk", amount: 3.2, category: "Grocery" })
    )
  );
});
