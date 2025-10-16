import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY = 'expenses:v1';

export async function loadExpenses() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : []; // array of Expense
}
export async function saveExpenses(list) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export function makeExpense(partial = {}) {
  const nowISO = new Date().toISOString().slice(0,10);
  return {
    id: String(Date.now()),
    title: '',
    amount: 0,
    date: nowISO,            // "YYYY-MM-DD"
    category: 'General',
    notes: '',
    photoUri: null,
    recurring: null,         // { every:'week'|'month', day:number }
    dueAt: null,             // ISO datetime
    tags: [],
    ...partial
  };
}
