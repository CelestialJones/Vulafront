import { FlatList, View, StyleSheet } from 'react-native'
import { Text, Card, ActivityIndicator } from 'react-native-paper'
import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'

export default function ProductListScreen() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        sku,
        category,
        min_stock,
        max_stock,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProducts(data)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Carregando produtos...</Text>
      </View>
    )
  }

  if (products.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Nenhum produto cadastrado</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={products}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">{item.name}</Text>

            <View style={styles.row}>
              <Text style={styles.label}>SKU:</Text>
              <Text>{item.sku}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Categoria:</Text>
              <Text>{item.category || '—'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Estoque mínimo:</Text>
              <Text>{item.min_stock}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Estoque máximo:</Text>
              <Text>
                {item.max_stock !== null ? item.max_stock : '—'}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    padding: 12
  },
  card: {
    marginBottom: 10,
    borderRadius: 10
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  label: {
    fontWeight: 'bold'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
