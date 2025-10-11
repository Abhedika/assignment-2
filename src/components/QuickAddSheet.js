import { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable } from 'react-native';
import { useExpenses } from '../context/ExpensesContext';

export default function QuickAddSheet({ visible, onClose }) {
  const { add } = useExpenses();
  const [title,setTitle]=useState(''); const [amount,setAmount]=useState('');
  const [category,setCategory]=useState('General');

  const submit=()=>{
    if(!title || !Number(amount)) return;
    add({ title, amount:Number(amount), category });
    setTitle(''); setAmount(''); setCategory('General'); onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex:1, backgroundColor:'#0008', justifyContent:'flex-end' }}>
        <View style={{ backgroundColor:'#fff', padding:16, borderTopLeftRadius:16, borderTopRightRadius:16 }}>
          <Text style={{ fontWeight:'bold', fontSize:16, marginBottom:8 }}>Quick Add</Text>
          <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:8, marginBottom:8 }}/>
          <TextInput placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:8, marginBottom:8 }}/>
          <TextInput placeholder="Category (e.g. Food)" value={category} onChangeText={setCategory} style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:8, marginBottom:8 }}/>
          <View style={{ flexDirection:'row', justifyContent:'flex-end', gap:12 }}>
            <Pressable onPress={onClose}><Text>Cancel</Text></Pressable>
            <Pressable onPress={submit}><Text style={{ fontWeight:'bold' }}>Add</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
