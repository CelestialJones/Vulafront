import { View, FlatList, StyleSheet, RefreshControl, Animated } from 'react-native'
import {
  Text,
  Modal,
  Portal,
  Button,
  ActivityIndicator,
  Chip,
  Divider,
  Icon,
  SegmentedButtons
} from 'react-native-paper'
import { useEffect, useState, useRef } from 'react'

import { getStockList, getStockHistory } from '../../services/stock'
import StockItemCard from '../../components/StockItemCard'

export default function StockListScreen() {
  const [stock, setStock] = useState<any[]>([])
  const [filteredStock, setFilteredStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')

  const [selected, setSelected] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [visible, setVisible] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  useEffect(() => {
    loadStock()
  }, [])

  useEffect(() => {
    filterStock()
  }, [filter, stock])

  useEffect(() => {
    if (stock.length > 0 && !loading) {
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
  }, [stock, loading])

  async function loadStock() {
    try {
      const data = await getStockList()
      setStock(data || [])
      setFilteredStock(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const filterStock = () => {
    let result = [...stock]

    // Aplicar filtro por status
    if (filter === 'low') {
      result = result.filter(item => item.quantity <= item.product.min_stock)
    } else if (filter === 'out') {
      result = result.filter(item => item.quantity === 0)
    } else if (filter === 'good') {
      result = result.filter(item => item.quantity > item.product.min_stock)
    }

    setFilteredStock(result)
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadStock()
  }

  async function openHistory(item: any) {
    setHistoryLoading(true)
    setSelected(item)
    setVisible(true)
    
    try {
      const data = await getStockHistory(item.product.id)
      setHistory(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setHistoryLoading(false)
    }
  }

  const getStockStatusColor = (current: number, min: number) => {
    if (current <= 0) return '#ef4444'
    if (current <= min) return '#f59e0b'
    return '#10b981'
  }

  const getStockStatusText = (current: number, min: number) => {
    if (current <= 0) return 'ESGOTADO'
    if (current <= min) return 'BAIXO'
    return 'NORMAL'
  }

  const getMovementIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'entrada': return 'arrow-down-circle'
      case 'saída': return 'arrow-up-circle'
      case 'ajuste': return 'swap-horizontal'
      default: return 'information'
    }
  }

  const getMovementColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'entrada': return '#10b981'
      case 'saída': return '#ef4444'
      case 'ajuste': return '#3b82f6'
      default: return '#64748b'
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR') + ' • ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const getFilterStats = () => {
    const totalItems = stock.reduce((sum, item) => sum + item.quantity, 0)
    const lowStockItems = stock.filter(item => item.quantity <= item.product.min_stock && item.quantity > 0).length
    const outOfStockItems = stock.filter(item => item.quantity === 0).length
    const goodStockItems = stock.filter(item => item.quantity > item.product.min_stock).length

    return { totalItems, lowStockItems, outOfStockItems, goodStockItems }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={48} color="#7c3aed" />
        <Text style={styles.loadingText}>Carregando estoque...</Text>
        <Text style={styles.loadingSubtext}>Aguarde um momento</Text>
      </View>
    )
  }

  if (stock.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIllustration}>
          <Icon source="package-variant-closed" size={96} color="#cbd5e1" />
          <View style={styles.emptyHighlight} />
        </View>
        <Text style={styles.emptyTitle}>Estoque vazio</Text>
        <Text style={styles.emptySubtitle}>
          Comece adicionando produtos ao seu inventário
        </Text>
        <Button 
          mode="contained" 
          icon="plus"
          style={styles.emptyButton}
          contentStyle={styles.emptyButtonContent}
          onPress={loadStock}
        >
          Adicionar Produto
        </Button>
      </View>
    )
  }

  const stats = getFilterStats()

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <Animated.View 
        style={[
          styles.headerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            {
              value: 'all',
              label: `Todos (${stock.length})`,
              style: { flex: 1 },
              icon: 'view-grid'
            },
            {
              value: 'good',
              label: `Normal (${stats.goodStockItems})`,
              style: { flex: 1 },
              icon: 'check-circle'
            },
            {
              value: 'low',
              label: `Baixo (${stats.lowStockItems})`,
              style: { flex: 1 },
              icon: 'alert-circle'
            },
            {
              value: 'out',
              label: `Esgotado (${stats.outOfStockItems})`,
              style: { flex: 1 },
              icon: 'close-circle'
            }
          ]}
          style={styles.segmentedButtons}
        />
      </Animated.View>

      <FlatList
        data={filteredStock}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7c3aed']}
            tintColor="#7c3aed"
            progressBackgroundColor="#f1f5f9"
          />
        }
        ListHeaderComponent={
          <View style={styles.statsHeader}>
            <View style={styles.statsCard}>
              <Icon source="package" size={20} color="#7c3aed" />
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{stats.totalItems}</Text>
                <Text style={styles.statLabel}>Total de itens</Text>
              </View>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsCard}>
              <Icon source="alert" size={20} color="#f59e0b" />
              <View style={styles.statContent}>
                <Text style={[styles.statValue, { color: stats.lowStockItems > 0 ? '#f59e0b' : '#64748b' }]}>
                  {stats.lowStockItems}
                </Text>
                <Text style={styles.statLabel}>Baixo estoque</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.noResults}>
            <Icon source="filter-remove" size={64} color="#cbd5e1" />
            <Text style={styles.noResultsText}>Nenhum produto encontrado</Text>
            <Text style={styles.noResultsSubtext}>
              Tente ajustar o filtro selecionado
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]
            }}
          >
            <StockItemCard 
              item={item} 
              onPress={() => openHistory(item)}
              statusColor={getStockStatusColor(item.quantity, item.product.min_stock)}
              statusText={getStockStatusText(item.quantity, item.product.min_stock)}
              delay={index * 100}
            />
          </Animated.View>
        )}
      />

      {/* 📜 MODAL HISTÓRICO */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
          theme={{
            colors: {
              backdrop: 'rgba(0, 0, 0, 0.6)'
            }
          }}
        >
          {selected && (
            <>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle} numberOfLines={2}>
                    {selected.product.name}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {selected.product.category || 'Sem categoria'} • SKU: {selected.product.sku}
                  </Text>
                </View>
                <View style={[
                  styles.quantityBadge,
                  { backgroundColor: getStockStatusColor(selected.quantity, selected.product.min_stock) }
                ]}>
                  <Text style={styles.quantityText}>{selected.quantity}</Text>
                  <Text style={styles.quantityLabel}>unidades</Text>
                </View>
              </View>

              <View style={styles.stockInfo}>
                <View style={styles.stockRange}>
                  <View style={styles.rangeItem}>
                    <Text style={styles.rangeLabel}>Mínimo</Text>
                    <Text style={styles.rangeValue}>{selected.product.min_stock}</Text>
                  </View>
                  <View style={styles.rangeDivider} />
                  <View style={styles.rangeItem}>
                    <Text style={styles.rangeLabel}>Máximo</Text>
                    <Text style={styles.rangeValue}>
                      {selected.product.max_stock || '—'}
                    </Text>
                  </View>
                </View>
              </View>

              <Divider style={styles.modalDivider} />

              <View style={styles.historySection}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Histórico de Movimentações</Text>
                    <Text style={styles.sectionSubtitle}>Últimas alterações no estoque</Text>
                  </View>
                  <Chip 
                    compact 
                    style={styles.countChip}
                    textStyle={styles.countChipText}
                  >
                    {history.length} mov.
                  </Chip>
                </View>

                {historyLoading ? (
                  <View style={styles.historyLoading}>
                    <ActivityIndicator size="small" color="#7c3aed" />
                    <Text style={styles.historyLoadingText}>Carregando histórico...</Text>
                  </View>
                ) : history.length === 0 ? (
                  <View style={styles.noHistory}>
                    <View style={styles.noHistoryIcon}>
                      <Icon source="timeline-clock" size={48} color="#cbd5e1" />
                    </View>
                    <Text style={styles.noHistoryText}>Nenhuma movimentação</Text>
                    <Text style={styles.noHistorySubtitle}>
                      As movimentações aparecerão aqui
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.historyItem}>
                        <View style={[
                          styles.historyIcon,
                          { backgroundColor: `${getMovementColor(item.type)}20` }
                        ]}>
                          <Icon 
                            source={getMovementIcon(item.type)} 
                            size={24} 
                            color={getMovementColor(item.type)} 
                          />
                        </View>
                        <View style={styles.historyContent}>
                          <View style={styles.historyHeader}>
                            <View style={styles.historyTypeContainer}>
                              <Text style={[
                                styles.historyType,
                                { color: getMovementColor(item.type) }
                              ]}>
                                {item.type.toUpperCase()}
                              </Text>
                              {item.user && (
                                <Text style={styles.historyUser}>• por {item.user.name}</Text>
                              )}
                            </View>
                            <Text style={[
                              styles.historyQuantity,
                              { color: getMovementColor(item.type) }
                            ]}>
                              {item.type.toLowerCase() === 'entrada' ? '+' : '-'}{item.quantity}
                            </Text>
                          </View>
                          <Text style={styles.historyDate}>
                            {formatDateTime(item.created_at)}
                          </Text>
                          {item.notes && (
                            <View style={styles.notesContainer}>
                              <Text style={styles.historyNotes} numberOfLines={2}>
                                {item.notes}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                    ItemSeparatorComponent={() => <Divider style={styles.historyDivider} />}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="contained"
                  icon="close"
                  style={styles.closeButton}
                  contentStyle={styles.closeButtonContent}
                  onPress={() => setVisible(false)}
                >
                  Fechar
                </Button>
              </View>
            </>
          )}
        </Modal>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  loadingText: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b'
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 32
  },
  emptyIllustration: {
    position: 'relative',
    marginBottom: 32
  },
  emptyHighlight: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: 80,
    zIndex: -1
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32
  },
  emptyButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  emptyButtonContent: {
    paddingHorizontal: 32,
    paddingVertical: 8
  },
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1
  },
  segmentedButtons: {
    marginBottom: 8
  },
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  statsCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  statContent: {
    marginLeft: 12
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500'
  },
  statsDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16
  },
  listContent: {
    padding: 16,
    paddingTop: 8
  },
  noResults: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center'
  },
  modal: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 40,
    borderRadius: 28,
    padding: 0,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 28,
    backgroundColor: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    position: 'relative'
  },
  modalTitleContainer: {
    flex: 1,
    marginRight: 16
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    lineHeight: 28
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500'
  },
  quantityBadge: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6
  },
  quantityText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 24
  },
  quantityLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    letterSpacing: 0.5
  },
  stockInfo: {
    paddingHorizontal: 28,
    paddingVertical: 20,
    backgroundColor: '#f8fafc'
  },
  stockRange: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  rangeItem: {
    flex: 1,
    alignItems: 'center'
  },
  rangeLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  rangeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b'
  },
  rangeDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16
  },
  modalDivider: {
    height: 8,
    backgroundColor: '#f1f5f9'
  },
  historySection: {
    padding: 28,
    flex: 1
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500'
  },
  countChip: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
    height: 32
  },
  countChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed'
  },
  historyLoading: {
    alignItems: 'center',
    padding: 48
  },
  historyLoadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500'
  },
  noHistory: {
    alignItems: 'center',
    padding: 48
  },
  noHistoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  noHistoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8
  },
  noHistorySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center'
  },
  historyItem: {
    flexDirection: 'row',
    paddingVertical: 16
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  historyContent: {
    flex: 1
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6
  },
  historyTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap'
  },
  historyType: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginRight: 6
  },
  historyUser: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500'
  },
  historyQuantity: {
    fontSize: 18,
    fontWeight: '800'
  },
  historyDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
    fontWeight: '500'
  },
  notesContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  historyNotes: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18
  },
  historyDivider: {
    backgroundColor: '#f1f5f9',
    marginLeft: 64
  },
  modalActions: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#f8fafc'
  },
  closeButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  closeButtonContent: {
    paddingVertical: 8
  }
})