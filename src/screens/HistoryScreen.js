import { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';
import { useExpenses } from '../context/ExpensesContext';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import ExpenseItem from '../components/ExpenseItem';

export default function HistoryScreen({ navigation }) {
  const { items } = useExpenses();
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [minA, setMinA] = useState(''); const [maxA, setMaxA] = useState('');
  const [from, setFrom] = useState(''); const [to, setTo] = useState(''); // YYYY-MM-DD

  const filtered = useMemo(()=>{
    return items.filter(x=>{
      if (cat!=='All' && x.category!==cat) return false;
      if (q && !(`${x.title} ${x.notes||''}`.toLowerCase().includes(q.toLowerCase()))) return false;
      const a = Number(x.amount||0);
      if (minA && a < Number(minA)) return false;
      if (maxA && a > Number(maxA)) return false;
      if (from && x.date < from) return false;
      if (to && x.date > to) return false;
      return true;
    });
  },[items,cat,q,minA,maxA,from,to]);

  return (
    <View style={{ flex:1, padding:16 }}>
      <SearchBar value={q} onChange={setQ} />
      <CategoryFilter value={cat} onChange={setCat} />
      <View style={{ flexDirection:'row', gap:8 }}>
        <TextInput placeholder="Min $" value={minA} onChangeText={setMinA}
                   keyboardType="decimal-pad" style={{ flex:1, borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:8 }}/>
        <TextInput placeholder="Max $" value={maxA} onChangeText={setMaxA}
                   keyboardType="decimal-pad" style={{ flex:1, borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:8 }}/>
      </View>
      <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
        <TextInput placeholder="From YYYY-MM-DD" value={from} onChangeText={setFrom}
                   style={{ flex:1, borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:8 }}/>
        <TextInput placeholder="To YYYY-MM-DD" value={to} onChangeText={setTo}
                   style={{ flex:1, borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:8 }}/>
      </View>

      <FlatList
        style={{ marginTop:12 }}
        data={filtered}
        keyExtractor={(x)=>x.id}
        renderItem={({item}) => <ExpenseItem item={item} onPress={()=>navigation.navigate('Edit',{id:item.id})}/>}
      />
    </View>
  );
}
