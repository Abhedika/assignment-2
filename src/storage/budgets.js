import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY = 'budgets:v1'; // { [category]: number }

export async function getBudgets(){ const raw=await AsyncStorage.getItem(KEY); return raw?JSON.parse(raw):{}; }
export async function setBudget(category, limit){
  const all = await getBudgets(); all[category] = Number(limit)||0;
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
  return all;
}
