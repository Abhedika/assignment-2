import { View, TextInput } from 'react-native';
export default function SearchBar({ value, onChange }) {
  return (
    <View style={{ padding:8, backgroundColor:'#eee', borderRadius:12, marginVertical:8 }}>
      <TextInput placeholder="Search..." value={value} onChangeText={onChange} />
    </View>
  );
}
