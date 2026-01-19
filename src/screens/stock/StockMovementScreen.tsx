import { View, StyleSheet, ScrollView, Animated } from 'react-native'
import {
  TextInput,
  Button,
  Text,
  RadioButton,
  ActivityIndicator,
  Chip,
  Icon,
  Card
} from 'react-native-paper'
import { useEffect, useState, useRef } from 'react'
import { createStockMovement } from '../../services/stockMovement'
import { supabase } from '../../services/supabase'

export default function StockMovementScreen() {
  const [products, setProducts] = useState<any[]>([])
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [type, setType] = useState<'in' | 'out'>('in')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [stockInfo, setStockInfo] = useState<any>(null)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (productId) {
      loadProductDetails()
    } else {
      setSelectedProduct(null)
      setStockInfo(null)
    }
  }, [productId])

  useEffect(() => {
    if (products.length > 0 && !loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start()
    }
  }, [products, loading])

  async function loadProducts() {
    try {
      const { data } = await supabase
        .from('products')
        .select('id, name, category, sku')

      setProducts(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadProductDetails() {
    try {
      // Buscar informações do produto
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      setSelectedProduct(productData)

      // Buscar estoque atual
      const { data: stockData } = await supabase
        .from('stock')
        .select('quantity')
        .eq('product_id', productId)
        .single()

      setStockInfo(stockData)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSubmit() {
    try {
      if (!productId) {
        alert('⚠️ Selecione um produto')
        return
      }

      if (!quantity || Number(quantity) <= 0) {
        alert('⚠️ Informe uma quantidade válida')
        return
      }

      if (type === 'out' && stockInfo && Number(quantity) > stockInfo.quantity) {
        alert(`❌ Saída não permitida! Estoque atual: ${stockInfo.quantity}`)
        return
      }

      setSubmitting(true)

      await createStockMovement({
        productId,
        quantity: Number(quantity),
        type,
        reason
      })

      alert('✅ Movimentação registrada com sucesso!')

      // Reset form
      setQuantity('')
      setReason('')
      loadProductDetails() // Atualizar info do estoque

    } catch (err: any) {
      alert(`❌ ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickQuantity = (value: number) => {
    if (stockInfo) {
      if (type === 'in') {
        setQuantity(String(Number(quantity) + value))
      } else if (type === 'out' && stockInfo.quantity >= value) {
        setQuantity(String(Number(quantity) + value))
      }
    } else {
      setQuantity(String(Number(quantity) + value))
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={48} color="#7c3aed" />
        <Text style={styles.loadingText}>Carregando produtos...</Text>
        <Text style={styles.loadingSubtext}>Preparando o formulário</Text>
      </View>
    )
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Icon source="swap-horizontal" size={32} color="#7c3aed" />
          </View>
          <Text style={styles.title}>Movimentação de Estoque</Text>
          <Text style={styles.subtitle}>
            Registre entradas e saídas do seu inventário
          </Text>
        </View>

        {/* TIPO DE MOVIMENTAÇÃO */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Tipo de Movimentação</Text>
            <View style={styles.typeButtons}>
              <Chip
                selected={type === 'in'}
                onPress={() => setType('in')}
                style={[
                  styles.typeChip,
                  type === 'in' && styles.typeChipActiveIn
                ]}
                textStyle={[
                  styles.typeChipText,
                  type === 'in' && styles.typeChipTextActive
                ]}
                icon="arrow-down"
                showSelectedOverlay={false}
              >
                Entrada
              </Chip>
              <Chip
                selected={type === 'out'}
                onPress={() => setType('out')}
                style={[
                  styles.typeChip,
                  type === 'out' && styles.typeChipActiveOut
                ]}
                textStyle={[
                  styles.typeChipText,
                  type === 'out' && styles.typeChipTextActive
                ]}
                icon="arrow-up"
                showSelectedOverlay={false}
              >
                Saída
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* SELECIONAR PRODUTO */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Selecionar Produto</Text>
            <View style={styles.productSelector}>
             
              <View style={styles.selectorContent}>
                {!productId ? (
                  <>
                    <Text style={styles.selectorPlaceholder}>Toque para selecionar um produto</Text>
                    <Text style={styles.selectorSubtext}>
                      {products.length} produtos disponíveis
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.selectedProductName}>
                      {selectedProduct?.name || 'Carregando...'}
                    </Text>
                    <Text style={styles.selectedProductDetails}>
                      {selectedProduct?.sku} • {selectedProduct?.category || 'Sem categoria'}
                    </Text>
                  </>
                )}
              </View>
              <Icon source="chevron-down" size={20} color="#7c3aed" />
            </View>
          </Card.Content>
        </Card>

        {/* LISTA DE PRODUTOS */}
        {!productId && (
          <View style={styles.productsList}>
            {products.map((product) => (
              <Chip
                key={product.id}
                onPress={() => setProductId(product.id)}
                style={styles.productChip}
                textStyle={styles.productChipText}
                avatar={<Icon source="cube" size={16} color="#7c3aed" />}
              >
                {product.name}
              </Chip>
            ))}
          </View>
        )}

        {/* INFO DO PRODUTO SELECIONADO */}
        {selectedProduct && (
          <Card style={styles.productInfoCard}>
            <Card.Content>
              <View style={styles.productInfoHeader}>
                <Text style={styles.productInfoTitle}>Informações do Produto</Text>
                <Chip 
                  compact 
                  style={[
                    styles.stockChip,
                    { backgroundColor: stockInfo?.quantity <= selectedProduct.min_stock ? '#fee2e2' : '#dcfce7' }
                  ]}
                  textStyle={[
                    styles.stockChipText,
                    { color: stockInfo?.quantity <= selectedProduct.min_stock ? '#dc2626' : '#047857' }
                  ]}
                >
                  Estoque: {stockInfo?.quantity || 0}
                </Chip>
              </View>
              
              <View style={styles.stockDetails}>
                <View style={styles.stockDetail}>
                  <Icon source="alert" size={16} color="#f59e0b" />
                  <Text style={styles.stockDetailLabel}>Mínimo</Text>
                  <Text style={styles.stockDetailValue}>{selectedProduct.min_stock}</Text>
                </View>
                <View style={styles.stockDetail}>
                  <Icon source="shield-check" size={16} color="#3b82f6" />
                  <Text style={styles.stockDetailLabel}>Máximo</Text>
                  <Text style={styles.stockDetailValue}>
                    {selectedProduct.max_stock || 'Não definido'}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* QUANTIDADE */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Quantidade</Text>
            <TextInput
              label="Quantidade"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              left={<TextInput.Icon icon="calculator" size={20} color="#7c3aed" />}
              mode="outlined"
            />
            
            <View style={styles.quickQuantity}>
              <Text style={styles.quickQuantityLabel}>Quantidades rápidas:</Text>
              <View style={styles.quickButtons}>
                {[1, 5, 10, 25, 50].map((num) => (
                  <Chip
                    key={num}
                    onPress={() => handleQuickQuantity(num)}
                    style={styles.quickButton}
                    textStyle={styles.quickButtonText}
                  >
                    +{num}
                  </Chip>
                ))}
              </View>
            </View>

            {type === 'out' && stockInfo && quantity && (
              <View style={styles.stockWarning}>
                <Icon source="information" size={16} color="#f59e0b" />
                <Text style={styles.stockWarningText}>
                  Após esta saída: {stockInfo.quantity - Number(quantity)} unidades restantes
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* MOTIVO */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Motivo da Movimentação</Text>
            <TextInput
              label="Descreva o motivo (opcional)"
              value={reason}
              onChangeText={setReason}
              style={styles.textArea}
              outlineStyle={styles.inputOutline}
              multiline
              numberOfLines={3}
              mode="outlined"
              placeholder="Ex: Compra de fornecedor, Venda ao cliente, Ajuste de inventário..."
              placeholderTextColor="#9ca3af"
            />
          </Card.Content>
        </Card>

        {/* BOTÃO DE CONFIRMAÇÃO */}
        <Button
          mode="contained"
          loading={submitting}
          disabled={submitting || !productId || !quantity}
          onPress={handleSubmit}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          icon={submitting ? undefined : (type === 'in' ? 'check-circle' : 'alert-circle-check')}
          labelStyle={styles.submitButtonLabel}
        >
          {submitting ? (
            <ActivityIndicator animating color="#ffffff" />
          ) : type === 'in' ? (
            'Confirmar Entrada'
          ) : (
            'Confirmar Saída'
          )}
        </Button>

        {/* RESUMO DA MOVIMENTAÇÃO */}
        {productId && quantity && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryTitle}>Resumo da Movimentação</Text>
              <View style={styles.summaryContent}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Produto:</Text>
                  <Text style={styles.summaryValue}>{selectedProduct?.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tipo:</Text>
                  <View style={[
                    styles.typeBadge,
                    { backgroundColor: type === 'in' ? '#dcfce7' : '#fee2e2' }
                  ]}>
                    <Icon 
                      source={type === 'in' ? 'arrow-down' : 'arrow-up'} 
                      size={14} 
                      color={type === 'in' ? '#047857' : '#dc2626'} 
                    />
                    <Text style={[
                      styles.typeBadgeText,
                      { color: type === 'in' ? '#047857' : '#dc2626' }
                    ]}>
                      {type === 'in' ? 'Entrada' : 'Saída'}
                    </Text>
                  </View>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Quantidade:</Text>
                  <Text style={[
                    styles.summaryValue,
                    { color: type === 'in' ? '#047857' : '#dc2626', fontWeight: '700' }
                  ]}>
                    {type === 'in' ? '+' : '-'}{quantity}
                  </Text>
                </View>
                {stockInfo && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Novo estoque:</Text>
                    <Text style={[
                      styles.summaryValue,
                      { fontWeight: '800' }
                    ]}>
                      {type === 'in' 
                        ? stockInfo.quantity + Number(quantity) 
                        : stockInfo.quantity - Number(quantity)
                      } unidades
                    </Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        )}
      </Animated.View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  loadingText: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937'
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500'
  },
  header: {
    alignItems: 'center',
    marginBottom: 32
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ddd6fe'
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12
  },
  typeChip: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center'
  },
  typeChipActiveIn: {
    backgroundColor: '#dcfce7',
    borderColor: '#10b981'
  },
  typeChipActiveOut: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444'
  },
  typeChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280'
  },
  typeChipTextActive: {
    color: '#1f2937'
  },
  productSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb'
  },
  selectorIcon: {
    marginRight: 12
  },
  selectorContent: {
    flex: 1
  },
  selectorPlaceholder: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563'
  },
  selectorSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2
  },
  selectedProductName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937'
  },
  selectedProductDetails: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2
  },
  productsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20
  },
  productChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  productChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563'
  },
  productInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ddd6fe'
  },
  productInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  productInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937'
  },
  stockChip: {
    height: 28
  },
  stockChipText: {
    fontSize: 11,
    fontWeight: '700'
  },
  stockDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  stockDetail: {
    alignItems: 'center'
  },
  stockDetailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '600'
  },
  stockDetailValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
    marginTop: 2
  },
  input: {
    backgroundColor: '#ffffff',
    marginBottom: 16
  },
  inputOutline: {
    borderWidth: 2,
    borderRadius: 12,
    borderColor: '#e5e7eb'
  },
  quickQuantity: {
    marginTop: 8
  },
  quickQuantityLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 8
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  quickButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  quickButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563'
  },
  stockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#fde68a'
  },
  stockWarningText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1
  },
  textArea: {
    backgroundColor: '#ffffff',
    minHeight: 100
  },
  submitButton: {
    borderRadius: 16,
    backgroundColor: '#7c3aed',
    borderWidth: 0,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 8,
    marginBottom: 24
  },
  submitButtonContent: {
    height: 56
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ddd6fe',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 20
  },
  summaryContent: {
    gap: 12
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600'
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937'
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700'
  }
})