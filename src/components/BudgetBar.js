import { View, Text } from 'react-native';
export default function BudgetBar({ label, spent=0, limit=0 }) {
  const ratio = limit ? Math.min(1, spent/limit) : 0;
  const color = ratio<0.8 ? '#4caf50' : ratio<1 ? '#ff9800' : '#f44336';
  return (
    <View style={{ marginVertical:8 }}>
      <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
        <Text>{label}</Text><Text>${spent.toFixed(2)} / {limit?`$${limit}`:'—'}</Text>
      </View>
      <View style={{ height:10, backgroundColor:'#eee', borderRadius:8, marginTop:6 }}>
        <View style={{ width:`${ratio*100}%`, height:'100%', borderRadius:8, backgroundColor:color }} />
      </View>
    </View>
  );
}
