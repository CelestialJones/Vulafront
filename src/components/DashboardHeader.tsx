import { View } from 'react-native'
import { IconButton, Text } from 'react-native-paper'
import { supabase } from '../services/supabase'

export default function DashboardHeader() {
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10
      }}
    >
      <Text variant="headlineSmall">Dashboard</Text>

      <IconButton
        icon="logout"
        size={24}
        onPress={handleLogout}
      />
    </View>
  )
}
