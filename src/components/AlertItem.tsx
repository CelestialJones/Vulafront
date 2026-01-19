import { View } from 'react-native'
import { Text, Chip } from 'react-native-paper'

export default function AlertItem({ alert }: any) {
  return (
    <View style={{ padding: 10 }}>
      <Text>{alert.message}</Text>
      <Chip>{alert.type}</Chip>
      <Chip>{alert.priority}</Chip>
    </View>
  )
}
