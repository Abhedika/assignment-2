import React from 'react';
import { render } from '@testing-library/react-native';

// 1) Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  const mem = new Map();
  return {
    setItem: jest.fn((k, v) => { mem.set(k, v); return Promise.resolve(); }),
    getItem: jest.fn(k => Promise.resolve(mem.get(k) ?? null)),
    removeItem: jest.fn(k => { mem.delete(k); return Promise.resolve(); }),
  };
});

// 2) Force any useContext(theme) to return a safe object BEFORE we load the screen
import * as ReactModule from 'react';
jest.spyOn(ReactModule, 'useContext').mockReturnValue({
  mode: 'light',
  resolved: 'light',
  toggle: jest.fn(),
  theme: 'system',
  setTheme: jest.fn(),
});

// 3) Now import the screen
const SettingsScreen = require('../src/screens/SettingsScreen').default;

test('renders Settings screen', () => {
  render(<SettingsScreen />);
});
