import { View, StyleSheet } from 'react-native'
import {
  TextInput,
  Button,
  Text,
  RadioButton,
  ActivityIndicator
} from 'react-native-paper'
import { useEffect, useState } from 'react'
import { Picker } from '@react-native-picker/picker'
import { createStockMovement } from '../../services/stockMovement'
import { supabase } from '../../services/supabase'

export default function StockMovementScreen() {
  const [products, setProducts] = useState<any[]>([])
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [type, setType] = useState<'in' | 'out'>('in')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true) // 🔄 loading inicial
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const { data } = await supabase
        .from('products')
        .select('id, name')

      setProducts(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    try {
      if (!productId) {
        alert('Selecione um produto')
        return
      }

      if (!quantity || Number(quantity) <= 0) {
        alert('Informe uma quantidade válida')
        return
      }

      setSubmitting(true)

      await createStockMovement({
        productId,
        quantity: Number(quantity),
        type,
        reason
      })

      alert('Movimentação registrada com sucesso')

      setQuantity('')
      setReason('')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  /* 🔄 LOADING CENTRALIZADO */
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Carregando produtos...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={{ marginBottom: 10 }}>
        Movimentação de Estoque
      </Text>

      <RadioButton.Group
        value={type}
        onValueChange={v => setType(v as any)}
      >
        <RadioButton.Item label="Entrada" value="in" />
        <RadioButton.Item label="Saída" value="out" />
      </RadioButton.Group>

      {/* SELECT DE PRODUTO */}
      <Text style={{ marginTop: 10 }}>Produto</Text>
      <Picker
        selectedValue={productId}
        onValueChange={value => setProductId(value)}
      >
        <Picker.Item label="Selecione um produto" value="" />
        {products.map(p => (
          <Picker.Item key={p.id} label={p.name} value={p.id} />
        ))}
      </Picker>

      <TextInput
        label="Quantidade"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
        style={{ marginBottom: 10 }}
      />

      <TextInput
        label="Motivo"
        value={reason}
        onChangeText={setReason}
      />

      <Button
        mode="contained"
        loading={submitting}
        disabled={submitting}
        onPress={handleSubmit}
        style={{ marginTop: 15 }}
      >
        Confirmar
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
