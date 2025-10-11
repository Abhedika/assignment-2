import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadExpenses, saveExpenses, makeExpense } from '../storage/expenses';

const Ctx = createContext();
export function ExpensesProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => { (async () => { setItems(await loadExpenses()); setReady(true); })(); }, []);
  useEffect(() => { if (ready) saveExpenses(items); }, [items, ready]);

  const add = (exp) => setItems(prev => [{...makeExpense(exp)}, ...prev]);
  const update = (id, patch) => setItems(prev => prev.map(x => x.id===id ? {...x, ...patch} : x));
  const remove = (id) => setItems(prev => prev.filter(x => x.id !== id));

  const totals = useMemo(() => {
    const today = new Date().toISOString().slice(0,10);
    const month = today.slice(0,7);
    const sum = (arr) => arr.reduce((a,x)=>a + Number(x.amount||0), 0);
    return {
      month: sum(items.filter(x => (x.date||'').startsWith(month))),
      today: sum(items.filter(x => x.date===today)),
      all:   sum(items),
      count: items.length
    };
  }, [items]);

  return <Ctx.Provider value={{ ready, items, add, update, remove, totals }}>{children}</Ctx.Provider>;
}
export const useExpenses = () => useContext(Ctx);
