import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable } from 'react-native';
import { getBudgets, setBudget } from '../storage/budgets';
import { useExpenses } from '../context/ExpensesContext';
import BudgetBar from '../components/BudgetBar';

const CATS = ['General','Food','Transport','Bills','Shopping','Health','Fun'];

export default function BudgetsScreen() {
  const { items } = useExpenses();
  const [budgets, setBudgets] = useState({});
  useEffect(()=>{ getBudgets().then(setBudgets); },[]);
  const month = new Date().toISOString().slice(0,7);

  const spentByCat = useMemo(()=>{
    const o={}; items.filter(x=>(x.date||'').startsWith(month)).forEach(x=>{
      o[x.category]=(o[x.category]||0)+Number(x.amount||0);
    }); return o;
  },[items,month]);

  const rows = CATS.map(c => ({ cat:c, limit: budgets[c]||0, spent: spentByCat[c]||0 }));

  return (
    <View style={{ flex:1, padding:16 }}>
      <FlatList
        data={rows}
        keyExtractor={x=>x.cat}
        renderItem={({item})=>(
          <View style={{ marginBottom:16 }}>
            <BudgetBar label={item.cat} spent={item.spent} limit={item.limit}/>
            <View style={{ flexDirection:'row', gap:8, marginTop:6 }}>
              <TextInput placeholder="Set limit $" defaultValue={String(item.limit||'')}
                         keyboardType="decimal-pad" style={{ flex:1, borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:8 }}
                         onEndEditing={async (e)=> setBudgets(await setBudget(item.cat, e.nativeEvent.text)) }/>
              <Pressable onPress={async ()=> setBudgets(await setBudget(item.cat, 0))}><Text>Clear</Text></Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}
