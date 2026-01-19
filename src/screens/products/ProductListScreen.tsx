import { FlatList, View, StyleSheet, RefreshControl, Animated } from 'react-native'
import { Text, Card, ActivityIndicator, IconButton, Chip, Button, Searchbar } from 'react-native-paper'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../services/supabase'

export default function ProductListScreen() {
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchQuery, selectedCategory, products])

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
      setFilteredProducts(data)
    }

    setLoading(false)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadProducts()
    setRefreshing(false)
  }

  const filterProducts = () => {
    let result = [...products]

    // Aplicar filtro de categoria
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory)
    }

    // Aplicar busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        (product.category && product.category.toLowerCase().includes(query))
      )
    }

    setFilteredProducts(result)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Eletrônicos': '#4338ca', // Azul mais escuro e vibrante
      'Vestuário': '#047857', // Verde mais escuro
      'Alimentos': '#b91c1c', // Vermelho mais intenso
      'Bebidas': '#c2410c', // Laranja mais forte
      'Limpeza': '#1d4ed8', // Azul mais vibrante
      'Outros': '#4b5563' // Cinza mais escuro
    }
    return colors[category] || colors['Outros']
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const getCategories = () => {
    const categories = products
      .map(p => p.category || 'Sem categoria')
      .filter((value, index, self) => self.indexOf(value) === index)
    
    return ['Todas', ...categories]
  }

  const getStats = () => {
    const totalProducts = products.length
    const withMaxStock = products.filter(p => p.max_stock !== null).length
    const noCategory = products.filter(p => !p.category || p.category === 'Outros').length
    
    return { totalProducts, withMaxStock, noCategory }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={48} color="#7c3aed" />
        <Text style={styles.loadingText}>Carregando produtos...</Text>
        <Text style={styles.loadingSubtext}>Preparando seu inventário</Text>
      </View>
    )
  }

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIllustration}>
          <IconButton
            icon="package-variant-plus"
            size={96}
            iconColor="#7c3aed"
            style={styles.emptyIcon}
          />
          <View style={styles.emptyHighlight} />
        </View>
        <Text style={styles.emptyTitle}>Catálogo vazio</Text>
        <Text style={styles.emptySubtitle}>
          Comece adicionando seus primeiros produtos
        </Text>
        <Button 
          mode="contained" 
          icon="plus"
          style={styles.emptyButton}
          contentStyle={styles.emptyButtonContent}
          onPress={() => console.log('Adicionar produto')}
        >
          Adicionar Produto
        </Button>
      </View>
    )
  }

  const stats = getStats()
  const categories = getCategories()

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
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#ede9fe' }]}>
              <IconButton
                icon="package"
                size={20}
                iconColor="#7c3aed"
                style={styles.statIcon}
              />
            </View>
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Produtos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#dcfce7' }]}>
              <IconButton
                icon="shield-check"
                size={20}
                iconColor="#10b981"
                style={styles.statIcon}
              />
            </View>
            <Text style={styles.statValue}>{stats.withMaxStock}</Text>
            <Text style={styles.statLabel}>Com limite</Text>
          </View>
        </View>

        <Searchbar
          placeholder="Buscar produtos..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#7c3aed"
          inputStyle={styles.searchInput}
          elevation={0}
        />

        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item }) => (
              <Chip
                selected={selectedCategory === (item === 'Todas' ? null : item)}
                onPress={() => setSelectedCategory(item === 'Todas' ? null : item)}
                style={[
                  styles.categoryChip,
                  selectedCategory === (item === 'Todas' ? null : item) && [
                    styles.categoryChipActive,
                    { backgroundColor: getCategoryColor(item === 'Todas' ? 'Outros' : item) }
                  ]
                ]}
                textStyle={[
                  styles.categoryChipText,
                  selectedCategory === (item === 'Todas' ? null : item) && styles.categoryChipTextActive
                ]}
                showSelectedOverlay={false}
              >
                {item}
              </Chip>
            )}
          />
        </View>
      </Animated.View>

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
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
          <View style={styles.listHeader}>
            <Text style={styles.resultsText}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
              {selectedCategory && ` em ${selectedCategory}`}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.noResults}>
            <IconButton
              icon="magnify-close"
              size={64}
              iconColor="#7c3aed"
            />
            <Text style={styles.noResultsText}>Nenhum produto encontrado</Text>
            <Text style={styles.noResultsSubtext}>
              {searchQuery ? 'Tente ajustar sua busca' : 'Tente selecionar outra categoria'}
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
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleContainer}>
                    <View style={styles.nameRow}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <View style={[
                        styles.categoryIndicator,
                        { backgroundColor: getCategoryColor(item.category || 'Outros') }
                      ]} />
                    </View>
                    <Text style={styles.productSku}>{item.sku}</Text>
                  </View>
                </View>

                <View style={styles.stockInfo}>
                  <View style={styles.stockItem}>
                    <View style={[styles.stockIconContainer, { backgroundColor: '#fee2e2' }]}>
                      <IconButton
                        icon="arrow-down"
                        size={16}
                        iconColor="#b91c1c"
                        style={styles.stockIcon}
                      />
                    </View>
                    <View>
                      <Text style={styles.stockLabel}>Mínimo</Text>
                      <Text style={styles.stockValue}>{item.min_stock}</Text>
                    </View>
                  </View>

                  <View style={styles.stockDivider} />

                  <View style={styles.stockItem}>
                    <View style={[styles.stockIconContainer, { backgroundColor: '#dcfce7' }]}>
                      <IconButton
                        icon="arrow-up"
                        size={16}
                        iconColor="#047857"
                        style={styles.stockIcon}
                      />
                    </View>
                    <View>
                      <Text style={styles.stockLabel}>Máximo</Text>
                      <Text style={[
                        styles.stockValue,
                        !item.max_stock && styles.stockValueEmpty
                      ]}>
                        {item.max_stock || 'Não definido'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.footerLeft}>
                    {item.category && (
                      <Chip
                        compact
                        style={[
                          styles.categoryTag,
                          { 
                            backgroundColor: getCategoryColor(item.category),
                            borderColor: getCategoryColor(item.category)
                          }
                        ]}
                        textStyle={[
                          styles.categoryTagText,
                          { color: '#ffffff' }
                        ]}
                      >
                        {item.category}
                      </Chip>
                    )}
                    <Text style={styles.dateText}>
                      {formatDate(item.created_at)}
                    </Text>
                  </View>
                  <IconButton
                    icon="chevron-right"
                    size={20}
                    iconColor="#7c3aed"
                    style={styles.arrowIcon}
                  />
                </View>
              </Card.Content>
            </Card>
          </Animated.View>
        )}
      />
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
  emptyIcon: {
    margin: 0
  },
  emptyHighlight: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
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
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4
  },
  statCard: {
    flex: 1,
    alignItems: 'center'
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  statIcon: {
    margin: 0
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20
  },
  searchbar: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    height: 52,
    borderWidth: 2,
    borderColor: '#e5e7eb'
  },
  searchInput: {
    fontSize: 15,
    fontWeight: '500'
  },
  categoriesContainer: {
    marginBottom: 4
  },
  categoriesList: {
    paddingVertical: 4
  },
  categoryChip: {
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginRight: 8,
    borderRadius: 24,
    height: 36
  },
  categoryChipActive: {
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563'
  },
  categoryChipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  listContent: {
    padding: 16,
    paddingTop: 8
  },
  listHeader: {
    marginBottom: 16
  },
  resultsText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  noResults: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  noResultsText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center'
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6
  },
  cardContent: {
    paddingVertical: 20,
    paddingHorizontal: 24
  },
  cardHeader: {
    marginBottom: 20
  },
  titleContainer: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  productName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    flex: 1,
    marginRight: 12,
    lineHeight: 26
  },
  categoryIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  productSku: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    letterSpacing: 0.8
  },
  stockInfo: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  stockItem: {
    flex: 1,
    alignItems: 'center'
  },
  stockIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  stockIcon: {
    margin: 0
  },
  stockLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6
  },
  stockValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b'
  },
  stockValueEmpty: {
    color: '#9ca3af',
    fontSize: 20,
    fontWeight: '600'
  },
  stockDivider: {
    width: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 24
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  categoryTag: {
    marginRight: 12,
    height: 30,
    borderWidth: 0
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600'
  },
  arrowIcon: {
    margin: 0,
    marginLeft: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8
  }
})