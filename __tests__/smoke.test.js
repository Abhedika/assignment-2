import "react-native";
import React from "react";
import { render } from "@testing-library/react-native";

function Hello(){ return null; }

test("renders", () => {
  const { toJSON } = render(<Hello />);
  expect(toJSON()).toBeNull();
});
