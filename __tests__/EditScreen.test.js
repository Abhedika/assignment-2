import React from 'react';
import { render } from '@testing-library/react-native';

// Theme safe defaults
jest.mock('../src/context/ThemeContext', () => ({
  useThemeContext: () => ({ mode: 'light', resolved: 'light', toggle: jest.fn() }),
}), { virtual: true });
jest.mock('../src/context', () => ({
  useThemeContext: () => ({ mode: 'light', resolved: 'light', toggle: jest.fn() }),
}), { virtual: true });

// Minimal DB mocks so EditScreen can render
jest.mock('../src/storage/db', () => ({
  addExpense: jest.fn(async () => 1),
  updateExpense: jest.fn(async () => {}),
  getExpenseById: jest.fn(async () => ({ id: 1, title: 'Tea', amount: 2.5, note: '' })),
}));
jest.mock('../src/db', () => ({
  addExpense: jest.fn(async () => 1),
  updateExpense: jest.fn(async () => {}),
  getExpenseById: jest.fn(async () => ({ id: 1, title: 'Tea', amount: 2.5, note: '' })),
}), { virtual: true });

const EditScreen = require('../src/screens/EditScreen').default;
const nav = { goBack: jest.fn() };

test('renders Edit screen', () => {
  render(<EditScreen navigation={nav} route={{}} />);
});
