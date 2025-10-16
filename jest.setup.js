import "@testing-library/jest-native/extend-expect";

// NativeAnimatedHelper (only if it exists for your RN version)
try {
  require.resolve("react-native/Libraries/Animated/NativeAnimatedHelper");
  jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper", () => ({}));
} catch { /* noop */ }

// Reanimated official mock
jest.mock("react-native-reanimated", () => {
  const ReanimatedMock = require("react-native-reanimated/mock");
  ReanimatedMock.default.call = () => {};
  return ReanimatedMock;
});

// Gesture Handler Jest setup
jest.mock("react-native-gesture-handler", () => {
  return require("react-native-gesture-handler/jestSetup");
});

// NOTE: Do NOT mock AsyncStorage here (it is mapped in package.json via moduleNameMapper)

// Expo modules that are ESM/native: mock lightly
jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(false),
  shareAsync: jest.fn(),
}));

jest.mock("expo-file-system", () => ({
  writeAsStringAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  documentDirectory: "/mock",
  getInfoAsync: jest.fn(),
}));

jest.mock("expo-local-authentication", () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
  authenticateAsync: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock("expo-notifications", () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  scheduleNotificationAsync: jest.fn(),
}));

// SQLite stub
jest.mock("expo-sqlite", () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn((cb) => {
      cb({
        executeSql: jest.fn((sql, params, onSuccess) => onSuccess?.({}, [])),
      });
    }),
  })),
}));

// DateTimePicker mock
jest.mock("@react-native-community/datetimepicker", () => "DateTimePicker");

// react-native-svg basic mock
jest.mock("react-native-svg", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Mock = (props) => React.createElement(View, props, props.children);
  Mock.Rect = Mock.Circle = Mock.Path = Mock.Text = Mock.G = Mock;
  return Mock;
});
