import { View, Text, FlatList } from 'react-native';
import { useExpenses } from '../context/ExpensesContext';
import ChartCard from '../components/ChartCard';

export default function ReportsScreen() {
  const { items } = useExpenses();
  const month = new Date().toISOString().slice(0,7);
  const inMonth = items.filter(x => (x.date||'').startsWith(month));

  const byCatObj = inMonth.reduce((a,x)=>((a[x.category]=(a[x.category]||0)+Number(x.amount)),a),{});
  const byCat = Object.entries(byCatObj).map(([k,v])=>({ label:k, value:v }));

  // monthly trend (last 6 months)
  const months = [];
  for(let i=5;i>=0;i--){
    const d=new Date(); d.setMonth(d.getMonth()-i);
    const key = d.toISOString().slice(0,7);
    const sum = items.filter(x=> (x.date||'').startsWith(key)).reduce((a,b)=>a+Number(b.amount),0);
    months.push({ label:key, value:sum });
  }

  const tags = {};
  inMonth.forEach(x => (x.tags||[]).forEach(t => tags[t]=(tags[t]||0)+Number(x.amount)));
  const topTags = Object.entries(tags).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>({label:k,value:v}));

  return (
    <View style={{ flex:1, padding:16 }}>
      <ChartCard title="Spend by Category (This Month)" data={byCat}/>
      <ChartCard title="Monthly Trend (Last 6 months)" data={months}/>
      {!!topTags.length && (
        <>
          <Text style={{ fontWeight:'bold', marginTop:8 }}>Top Tags</Text>
          <FlatList data={topTags} keyExtractor={x=>x.label}
            renderItem={({item})=>(<View style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:6}}>
              <Text>#{item.label}</Text><Text>${item.value.toFixed(2)}</Text>
            </View>)}/>
        </>
      )}
    </View>
  );
}
