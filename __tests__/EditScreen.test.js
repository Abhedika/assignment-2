import React from "react";
import { render } from "@testing-library/react-native";

// ✅ Theme mock (light mode)
jest.mock("../src/context/ThemeContext", () => ({
  useThemeContext: () => ({ mode: "light", resolved: "light", toggle: jest.fn() }),
}), { virtual: true });

// ✅ Minimal hook-based DB mock — matches EditScreen’s imports
jest.mock("../src/storage/db", () => ({
  useExpenses: () => ({
    items: [],
    add: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    isReady: true,
  }),
}));

// ✅ If EditScreen indirectly imports “../src/db”, keep this virtual stub
jest.mock("../src/db", () => ({
  useExpenses: () => ({
    items: [],
    add: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    isReady: true,
  }),
}), { virtual: true });

// ✅ Import after mocks
const EditScreen = require("../src/screens/EditScreen").default;

// ✅ Navigation mock includes setOptions (fixes the error)
const nav = { goBack: jest.fn(), setOptions: jest.fn() };

test("renders Edit screen", () => {
  render(<EditScreen navigation={nav} route={{}} />);
});
