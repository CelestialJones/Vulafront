import { Card, Text } from 'react-native-paper'
import { View } from 'react-native'

interface Props {
  title: string
  value: number | string
}

export default function MetricCard({ title, value }: Props) {
  return (
    <Card style={{ margin: 6, flex: 1 }}>
      <Card.Content>
        <Text variant="titleSmall">{title}</Text>
        <Text variant="headlineMedium">{value}</Text>
      </Card.Content>
    </Card>
  )
}
