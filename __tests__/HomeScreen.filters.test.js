import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import HomeScreen from "../src/screens/HomeScreen";

// Freeze time so Today/Week/Month are deterministic
const NOW = new Date("2025-10-11T10:00:00.000Z");
jest.useFakeTimers().setSystemTime(NOW);
const iso = (d) => new Date(d).toISOString();

const items = [
  { id: "1", title: "Coffee", amount: 4, category: "Food", date: iso(NOW) }, // today
  { id: "2", title: "Bus", amount: 3, category: "Transport", date: iso(new Date(NOW - 2 * 864e5)) }, // this week
  { id: "3", title: "Shoes", amount: 50, category: "Shopping", date: iso(new Date(NOW - 15 * 864e5)) }, // older than a week
  { id: "4", title: "Very Old", amount: 8, category: "Other", date: iso(new Date(NOW - 45 * 864e5)) }, // way old
];

// ✅ Use a captured variable (mockApi) so Jest allows it inside the mock factory
const mockApi = {
  items,
  total: items.reduce((a, x) => a + x.amount, 0),
  isReady: true,
  add: jest.fn(),
  remove: jest.fn(),
};

jest.mock("../src/storage/db", () => ({
  useExpenses: () => mockApi,
}));

jest.mock("../src/context/ThemeContext", () => ({
  useThemeContext: () => ({ resolved: "light", mode: "light", toggle: jest.fn() }),
}));

describe("HomeScreen range + search", () => {
  afterAll(() => jest.useRealTimers());

  it("Week shows only recent items; search then narrows further", () => {
    render(<HomeScreen navigation={{ navigate: jest.fn() }} />);

    // Use "Week" to avoid multiple identical "Month" labels
    const [weekBtn] = screen.getAllByText("Week");
    fireEvent.press(weekBtn);

    // In week view we expect Coffee (today) and Bus (2 days ago)
    expect(screen.getByText("Coffee")).toBeTruthy();
    expect(screen.getByText("Bus")).toBeTruthy();

    // And we should NOT see older items
    expect(screen.queryByText("Shoes")).toBeNull();
    expect(screen.queryByText("Very Old")).toBeNull();

    // Now search inside week range
    fireEvent.changeText(
      screen.getByPlaceholderText(/Search expenses/i),
      "cof"
    );
    expect(screen.getByText("Coffee")).toBeTruthy();
    expect(screen.queryByText("Bus")).toBeNull();
  });
});
