import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Ctx = createContext();

export function SettingsProvider({ children }) {
  const [currency, setCurrency] = useState('NZD');
  const [theme, setTheme] = useState('system'); // 'light'|'dark'|'system'
  useEffect(()=>{ (async ()=>{
    const c = await AsyncStorage.getItem('currency'); if (c) setCurrency(c);
    const t = await AsyncStorage.getItem('theme'); if (t) setTheme(t);
  })(); }, []);
  useEffect(()=>{ AsyncStorage.setItem('currency', currency); },[currency]);
  useEffect(()=>{ AsyncStorage.setItem('theme', theme); },[theme]);

  const fmt = (n) => new Intl.NumberFormat(undefined, { style:'currency', currency }).format(Number(n||0));

  return <Ctx.Provider value={{ currency, setCurrency, theme, setTheme, fmt }}>{children}</Ctx.Provider>;
}
export const useSettings = () => useContext(Ctx);
