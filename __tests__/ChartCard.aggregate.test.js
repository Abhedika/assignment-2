import React from "react";
import { render, screen } from "@testing-library/react-native";
import ChartCard from "../src/components/ChartCard";

// theme light/dark stub
jest.mock("../src/theme", () => ({
  default: {
    light: { card: "#fff", text: "#111", bg: "#f8", muted: "#777", border: "#eee", tint: "#0a7", shadow: {} },
    dark:  { card: "#000", text: "#fff", bg: "#111", muted: "#999", border: "#333", tint: "#0af", shadow: {} },
  }
}));

describe("ChartCard aggregation", () => {
  it("groups by category and shows TOTAL", () => {
    const data = [
      { amount: 10, category: "Food" },
      { amount: 5,  category: "Food" },
      { amount: 20, category: "Bills" }
    ];
    render(<ChartCard title="Spending by Category" data={data} />);
    expect(screen.getByText("Food")).toBeTruthy();
    expect(screen.getByText("$15.00")).toBeTruthy();
    expect(screen.getByText("Bills")).toBeTruthy();
    expect(screen.getByText("$20.00")).toBeTruthy();
    expect(screen.getByText("TOTAL")).toBeTruthy();
    expect(screen.getByText("$35.00")).toBeTruthy();
  });

  it("shows empty-state when there is no positive value", () => {
    render(<ChartCard data={[{ amount: 0, category: "X" }]} />);
    expect(screen.getByText(/No data/i)).toBeTruthy();
  });
});
