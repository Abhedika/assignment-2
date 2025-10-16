import React from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import { ExpensesProvider, useExpenses } from "../src/storage/db";
import { Text } from "react-native";

// Give the provider a bit more time (AsyncStorage init, etc.)
jest.setTimeout(15000);

function Probe() {
  const { items, total, add, update, remove, isReady } = useExpenses();
  return (
    <>
      <Text testID="ready">{String(!!isReady)}</Text>
      <Text testID="count">{String(items.length)}</Text>
      <Text testID="total">{String(total)}</Text>
      <Text
        testID="add"
        onPress={() =>
          add({
            title: "Test",
            amount: 2.5,
            category: "General",
            date: new Date().toISOString(),
          })
        }
      >
        +
      </Text>
      <Text
        testID="update"
        onPress={() => items[0] && update(items[0].id, { amount: 99 })}
      >
        u
      </Text>
      <Text testID="remove" onPress={() => items[0] && remove(items[0].id)}>
        x
      </Text>
    </>
  );
}

it("recomputes totals on add → update → remove", async () => {
  const tree = render(
    <ExpensesProvider>
      <Probe />
    </ExpensesProvider>
  );
  const get = (id) => tree.getByTestId(id);

  // wait until provider finished loading (prevents early reads)
  await waitFor(() => expect(get("ready").props.children).toBe("true"));

  const c0 = Number(get("count").props.children);
  const t0 = Number(get("total").props.children);

  await act(async () => {
    fireEvent.press(get("add"));
  });

  await waitFor(() => expect(Number(get("count").props.children)).toBe(c0 + 1));
  const c1 = Number(get("count").props.children);
  const t1 = Number(get("total").props.children);
  expect(t1).toBeGreaterThanOrEqual(t0 + 2.5);

  await act(async () => {
    fireEvent.press(get("update"));
  });

  await waitFor(() =>
    expect(Number(get("total").props.children)).toBeGreaterThanOrEqual(99)
  );

  await act(async () => {
    fireEvent.press(get("remove"));
  });

  await waitFor(() =>
    expect(Number(get("count").props.children)).toBe(c1 - 1)
  );
});
