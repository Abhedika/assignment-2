import { ScrollView, Pressable, Text } from 'react-native';
const CATS = ['All','General','Food','Transport','Bills','Shopping','Health','Fun'];
export default function CategoryFilter({ value='All', onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical:8 }}>
      {CATS.map(c=>{
        const active = value===c;
        return (
          <Pressable key={c} onPress={()=>onChange(c)}
            style={{ paddingHorizontal:12,paddingVertical:6,borderRadius:16,marginRight:8, backgroundColor:active?'#222':'#eee' }}>
            <Text style={{ color: active?'#fff':'#222' }}>{c}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
