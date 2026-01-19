import { View, Image, StyleSheet, ScrollView, Alert } from 'react-native'
import {
  TextInput,
  Button,
  Text,
  Card,
  ActivityIndicator,
  Portal,
  Modal
} from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { supabase } from '../../services/supabase'
import { uploadProductImage } from '../../services/storage'

export default function ProductCreateScreen() {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState('')
  const [minStock, setMinStock] = useState('10')
  const [maxStock, setMaxStock] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'], // ✅ SDK 54
    allowsEditing: true,
    quality: 0.7
  })

  if (!result.canceled) {
    const uri = result.assets[0].uri

    // Validar JPG / PNG
    if (!uri.match(/\.(jpg|jpeg|png)$/i)) {
      alert('Apenas imagens JPG ou PNG são permitidas')
      return
    }

    setImage(uri)
  }
}


  async function handleSave() {
    try {
      if (!name || !sku) {
        Alert.alert('Erro', 'Preencha o nome e o SKU')
        return
      }

      if (maxStock && Number(maxStock) < Number(minStock)) {
        Alert.alert('Erro', 'Estoque máximo não pode ser menor que o mínimo')
        return
      }

      setLoading(true)

      let imageUrl: string | null = null

      if (image) {
        imageUrl = await uploadProductImage(
          image,
          `product-${Date.now()}.jpg`
        )
      }

      const { error } = await supabase.from('products').insert({
        name,
        sku,
        category,
        min_stock: Number(minStock),
        max_stock: maxStock ? Number(maxStock) : null,
        image_url: imageUrl
      })

      if (error) throw error

      Alert.alert('Sucesso', 'Produto cadastrado com sucesso')

      // 🔄 Reset
      setName('')
      setSku('')
      setCategory('')
      setMinStock('10')
      setMaxStock('')
      setImage(null)
    } catch (err: any) {
      Alert.alert('Erro', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Text variant="headlineSmall" style={styles.title}>
            Novo Produto
          </Text>

          <TextInput
            label="Nome do Produto"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <TextInput
            label="SKU"
            value={sku}
            onChangeText={setSku}
            style={styles.input}
          />

          <TextInput
            label="Categoria"
            value={category}
            onChangeText={setCategory}
            style={styles.input}
          />

          <View style={styles.row}>
            <TextInput
              label="Estoque Mínimo"
              value={minStock}
              onChangeText={setMinStock}
              keyboardType="numeric"
              style={[styles.input, styles.half]}
            />

            <TextInput
              label="Estoque Máximo"
              value={maxStock}
              onChangeText={setMaxStock}
              keyboardType="numeric"
              style={[styles.input, styles.half]}
            />
          </View>

          <Button
            mode="outlined"
            onPress={pickImage}
            style={{ marginTop: 10 }}
          >
            Selecionar Imagem
          </Button>

          {image && (
            <Image
              source={{ uri: image }}
              style={styles.image}
            />
          )}

          <Button
            mode="contained"
            onPress={handleSave}
            disabled={loading}
            style={{ marginTop: 20 }}
          >
            Salvar Produto
          </Button>
        </Card>
      </ScrollView>

      {/* 🔥 LOADING CENTRALIZADO */}
      <Portal>
        <Modal visible={loading} dismissable={false}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 12 }}>
              Salvando produto...
            </Text>
          </View>
        </Modal>
      </Portal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16
  },
  card: {
    padding: 16,
    borderRadius: 12,
    elevation: 4
  },
  title: {
    textAlign: 'center',
    marginBottom: 16
  },
  input: {
    marginBottom: 10
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  half: {
    width: '48%'
  },
  image: {
    height: 150,
    marginTop: 15,
    borderRadius: 8
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 30,
    marginHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center'
  }
})
//teste