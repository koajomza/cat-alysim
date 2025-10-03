
import { Text, View, Pressable } from 'react-native'

export default function Index() {
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', gap:8 }}>
      <Text style={{ fontSize:22, fontWeight:'700' }}>CAT-ALYSIM Mobile</Text>
      <Pressable onPress={() => { /* navigate to /verify with token via Linking in real app */ }}>
        <Text style={{ color:'#60a5fa' }}>เปิด Verify</Text>
      </Pressable>
    </View>
  )
}
