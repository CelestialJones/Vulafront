import { View, FlatList, StyleSheet } from 'react-native'
import {
  Text,
  Modal,
  Portal,
  Button,
  ActivityIndicator
} from 'react-native-paper'
import { useEffect, useState } from 'react'

import { getStockList, getStockHistory } from '../../services/stock'
import StockItemCard from '../../components/StockItemCard'

export default function StockListScreen() {
  const [stock, setStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [selected, setSelected] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    loadStock()
  }, [])

  async function loadStock() {
    try {
      const data = await getStockList()
      setStock(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function openHistory(item: any) {
    const data = await getStockHistory(item.product.id)
    setHistory(data || [])
    setSelected(item)
    setVisible(true)
  }

  /* 🔄 LOADING BONITO */
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Carregando estoque...</Text>
      </View>
    )
  }

  if (stock.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Nenhum item em estoque</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={stock}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10 }}
        renderItem={({ item }) => (
          <StockItemCard item={item} onPress={() => openHistory(item)} />
        )}
      />

      {/* 📜 MODAL HISTÓRICO */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleMedium" style={{ marginBottom: 10 }}>
            Histórico – {selected?.product.name}
          </Text>

          {history.length === 0 && (
            <Text>Sem movimentações registradas</Text>
          )}

          {history.map((h) => (
            <Text key={h.id} style={{ marginBottom: 4 }}>
              {h.type.toUpperCase()} • {h.quantity} •{' '}
              {new Date(h.created_at).toLocaleDateString()}
            </Text>
          ))}

          <Button
            mode="contained"
            style={{ marginTop: 15 }}
            onPress={() => setVisible(false)}
          >
            Fechar
          </Button>
        </Modal>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 12
  }
})
