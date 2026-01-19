import { View, StyleSheet } from 'react-native'
import { Card, Text, Chip } from 'react-native-paper'

export default function StockItemCard({ item, onPress }: any) {
  const lowStock = item.quantity <= item.product.min_stock

  return (
    <Card style={styles.card} onPress={onPress}>
      <Text variant="titleMedium">{item.product.name}</Text>
      <Text>Categoria: {item.product.category}</Text>
      <Text>Quantidade: {item.quantity}</Text>

      {lowStock && (
        <Chip style={styles.alert} textStyle={{ color: '#fff' }}>
          Estoque Baixo
        </Chip>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    padding: 10
  },
  alert: {
    marginTop: 6,
    backgroundColor: '#d32f2f'
  }
})
