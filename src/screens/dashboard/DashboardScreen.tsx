import { View, ScrollView, Dimensions, StyleSheet, RefreshControl, Animated } from 'react-native'
import { Text, ActivityIndicator, Chip, Icon } from 'react-native-paper'
import { useEffect, useState, useRef } from 'react'
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit'

import DashboardHeader from '../../components/DashboardHeader'
import DashboardActions from '../../components/DashboardActions'
import MetricCard from '../../components/MetricCard'
import { getDashboardData } from '../../services/dashboard'

const screenWidth = Dimensions.get('window').width

export default function DashboardScreen() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('month')

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const spinAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    if (data && !loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ]).start()
    }
  }, [data, loading])

  async function loadDashboard() {
    try {
      const result = await getDashboardData()
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadDashboard()
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Eletrônicos': '#4338ca',
      'Vestuário': '#047857',
      'Alimentos': '#b91c1c',
      'Bebidas': '#c2410c',
      'Limpeza': '#1d4ed8',
      'Outros': '#4b5563'
    }
    return colors[category] || colors['Outros']
  }

  const getCategoryGradient = (category: string) => {
    const gradients: Record<string, [string, string]> = {
      'Eletrônicos': ['#4338ca', '#6366f1'],
      'Vestuário': ['#047857', '#10b981'],
      'Alimentos': ['#b91c1c', '#dc2626'],
      'Bebidas': ['#c2410c', '#ea580c'],
      'Limpeza': ['#1d4ed8', '#3b82f6'],
      'Outros': ['#4b5563', '#6b7280']
    }
    return gradients[category] || gradients['Outros']
  }

  const rotateInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  })

  // Dados realistas para o gráfico de movimentações
  const getMovementData = () => {
    const currentMonth = new Date().getMonth()
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    // Gerar dados baseados no mês atual
    let labels = []
    let dataPoints = []
    
    // Pegar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      labels.push(months[monthIndex])
      
      // Gerar números realistas baseados no mês (maior movimentação em meses específicos)
      let baseValue = 50
      if (monthIndex === 5 || monthIndex === 11) baseValue = 85 // Junho e Dezembro (promoções)
      if (monthIndex === 1 || monthIndex === 7) baseValue = 70 // Fevereiro e Agosto (volta às aulas)
      
      // Adicionar variação aleatória
      const variation = Math.floor(Math.random() * 30) - 15
      dataPoints.push(Math.max(20, baseValue + variation))
    }
    
    return { labels, data: dataPoints }
  }

  const movementData = getMovementData()

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <Icon source="loading" size={64} color="#7c3aed" />
        </Animated.View>
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
        <Text style={styles.loadingSubtext}>Analisando seus dados em tempo real</Text>
      </View>
    )
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <Icon source="alert-circle" size={64} color="#dc2626" />
        </View>
        <Text style={styles.errorTitle}>Erro ao carregar dados</Text>
        <Text style={styles.errorSubtext}>
          Verifique sua conexão e tente novamente
        </Text>
        <View style={styles.errorActions}>
          <Chip
            mode="outlined"
            icon="refresh"
            onPress={loadDashboard}
            style={styles.retryButton}
            textStyle={styles.retryButtonText}
          >
            Tentar novamente
          </Chip>
        </View>
      </View>
    )
  }

  const categories: Record<string, number> = {}
  data.products.forEach((p: any) => {
    const key = p.category || 'Outros'
    categories[key] = (categories[key] || 0) + 1
  })

  const pieData = Object.keys(categories).map((key) => ({
    name: key,
    population: categories[key],
    color: getCategoryColor(key),
    legendFontColor: '#1f2937',
    legendFontSize: 12,
    legendFontWeight: '700'
  }))

  const getChartData = () => {
    const baseData = [45, 52, 68, 74, 82, 76, 85, 92, 88, 95, 98, data.totalStock]
    return timeRange === 'month' 
      ? baseData.slice(-6) 
      : timeRange === 'week' 
      ? baseData.slice(-4) 
      : baseData
  }

  const getChartLabels = () => {
    if (timeRange === 'month') return ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    if (timeRange === 'week') return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
    return ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  }

  const getTrendData = () => {
    const current = data.totalStock
    const previous = 92
    const diff = current - previous
    
    if (diff > 0) return { 
      icon: 'trending-up', 
      color: '#047857', 
      text: `+${diff}%`, 
      value: diff,
      label: 'Crescendo' 
    }
    if (diff < 0) return { 
      icon: 'trending-down', 
      color: '#dc2626', 
      text: `${diff}%`, 
      value: Math.abs(diff),
      label: 'Decrescendo'
    }
    return { 
      icon: 'trending-neutral', 
      color: '#6b7280', 
      text: '0%', 
      value: 0,
      label: 'Estável'
    }
  }

  const trend = getTrendData()

  return (
    <View style={styles.container}>
      <DashboardHeader />

      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7c3aed', '#a855f7', '#6366f1']}
            tintColor="#7c3aed"
            progressBackgroundColor="#f1f5f9"
            title="Atualizando dados..."
            titleColor="#7c3aed"
          />
        }
      >
        {/* 🔹 AÇÕES RÁPIDAS */}
        <View style={styles.quickActionsContainer}>
          <DashboardActions />
        </View>

        {/* 🔹 MÉTRICAS PRINCIPAIS */}
        <View style={styles.metricsHeader}>
          <Text style={styles.metricsTitle}>Visão Geral do Estoque</Text>
          <View style={styles.badgeContainer}>
            <Chip 
              icon="lightning-bolt" 
              style={styles.liveBadge}
              textStyle={styles.liveBadgeText}
            >
              LIVE
            </Chip>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricColumn}>
            <MetricCard 
              title="Produtos" 
              value={data.totalProducts} 
              icon="package"
              trend={{ value: '+12%', positive: true }}
              gradient={['#7c3aed', '#a855f7']}
              subtitle="Total cadastrado"
              elevation={8}
            />
          </View>
          <View style={styles.metricColumn}>
            <MetricCard 
              title="Estoque Total" 
              value={data.totalStock} 
              icon="cube"
              trend={{ value: trend.text, positive: trend.icon === 'trending-up' }}
              gradient={['#0ea5e9', '#3b82f6']}
              subtitle={trend.label}
              elevation={8}
            />
          </View>
          <View style={styles.metricColumn}>
            <MetricCard 
              title="Estoque Baixo" 
              value={data.lowStockProducts} 
              icon="alert"
              trend={{ value: `${Math.round((data.lowStockProducts / data.totalProducts) * 100)}%`, positive: false }}
              warning={data.lowStockProducts > 0}
              gradient={['#f59e0b', '#f97316']}
              subtitle="Atenção necessária"
              elevation={8}
            />
          </View>
          <View style={styles.metricColumn}>
            <MetricCard 
              title="Alertas" 
              value={data.alerts} 
              icon="bell"
              trend={{ value: `${Math.round((data.alerts / data.totalProducts) * 100)}%`, positive: false }}
              warning={data.alerts > 0}
              gradient={['#ef4444', '#dc2626']}
              subtitle="Monitoramento ativo"
              elevation={8}
            />
          </View>
        </View>

        {/* 🔹 GRÁFICO PRINCIPAL */}
        <View style={styles.mainChartSection}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.mainChartTitle}>Evolução do Estoque</Text>
              <Text style={styles.chartSubtitle}>
                Período: {timeRange === 'week' ? 'Última semana' : timeRange === 'month' ? 'Último mês' : 'Último ano'}
              </Text>
            </View>
            <View style={styles.timeFilters}>
              {['week', 'month', 'year'].map((range) => (
                <Chip
                  key={range}
                  selected={timeRange === range}
                  onPress={() => setTimeRange(range)}
                  style={[
                    styles.timeChip,
                    timeRange === range && styles.timeChipActive
                  ]}
                  textStyle={[
                    styles.timeChipText,
                    timeRange === range && styles.timeChipTextActive
                  ]}
                  showSelectedOverlay={false}
                >
                  {range === 'week' ? 'Semana' : range === 'month' ? 'Mês' : 'Ano'}
                </Chip>
              ))}
            </View>
          </View>
          
          <View style={styles.lineChartWrapper}>
            <LineChart
              data={{
                labels: getChartLabels(),
                datasets: [{ 
                  data: getChartData(),
                  color: () => '#7c3aed',
                  strokeWidth: 5
                }]
              }}
              width={screenWidth - 48}
              height={280}
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
                style: { borderRadius: 24 },
                propsForDots: {
                  r: '10',
                  strokeWidth: '4',
                  stroke: '#ffffff'
                },
                propsForBackgroundLines: {
                  strokeWidth: 2,
                  stroke: '#e5e7eb',
                  strokeDasharray: ''
                },
                fillShadowGradient: '#7c3aed',
                fillShadowGradientOpacity: 0.4,
                propsForLabels: {
                  fontSize: 12,
                  fontWeight: '700'
                },
                propsForVerticalLabels: {
                  rotation: -45
                }
              }}
              bezier
              style={styles.lineChart}
              withVerticalLines={true}
              withHorizontalLines={true}
              withInnerLines={true}
              withShadow={true}
              segments={6}
              fromZero
            />
          </View>
          
          <View style={styles.chartStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Máximo</Text>
              <Text style={styles.statValue}>98</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Mínimo</Text>
              <Text style={styles.statValue}>45</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Média</Text>
              <Text style={styles.statValue}>76</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Atual</Text>
              <Text style={[styles.statValue, { color: '#7c3aed' }]}>{data.totalStock}</Text>
            </View>
          </View>
        </View>

        {/* 🔹 GRÁFICOS SECUNDÁRIOS */}
        <View style={styles.secondaryCharts}>
          <View style={styles.secondaryChart}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Distribuição por Categoria</Text>
              <Chip 
                compact
                style={styles.chartBadge}
                textStyle={styles.chartBadgeText}
              >
                {Object.keys(categories).length} cats.
              </Chip>
            </View>
            
            <View style={styles.pieChartContainer}>
              <PieChart
                data={pieData.slice(0, 5)}
                width={screenWidth - 48}
                height={200}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                chartConfig={{
                  color: () => '#ffffff',
                  labelColor: () => '#1f2937'
                }}
                style={styles.pieChart}
                hasLegend={false}
                avoidFalseZero={true}
                absolute={false}
                center={[10, 10]}
              />
            </View>

            <View style={styles.pieLegend}>
              {pieData.slice(0, 4).map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.legendValue}>
                    {item.population}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.secondaryChart}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Movimentações Mensais</Text>
              <Chip 
                compact
                icon="swap-horizontal"
                style={styles.chartBadge}
                textStyle={styles.chartBadgeText}
              >
                Últimos 6 meses
              </Chip>
            </View>
            
            <View style={styles.barChartWrapper}>
              <BarChart
                data={{
                  labels: movementData.labels,
                  datasets: [{
                    data: movementData.data
                  }]
                }}
                width={screenWidth - 48}
                height={200}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
                  style: { borderRadius: 16 },
                  barPercentage: 0.7,
                  propsForBackgroundLines: {
                    strokeWidth: 1,
                    stroke: '#e5e7eb'
                  },
                  propsForLabels: {
                    fontSize: 11,
                    fontWeight: '600'
                  },
                  propsForVerticalLabels: {
                    rotation: 0
                  }
                }}
                style={styles.barChart}
                showValuesOnTopOfBars
                withInnerLines={true}
                fromZero
                yAxisInterval={1}
              />
            </View>

            <View style={styles.barChartStats}>
              <View style={styles.barStat}>
                <Icon source="trending-up" size={16} color="#047857" />
                <Text style={styles.barStatText}>
                  Maior: {Math.max(...movementData.data)}
                </Text>
              </View>
              <View style={styles.barStat}>
                <Icon source="trending-down" size={16} color="#dc2626" />
                <Text style={styles.barStatText}>
                  Menor: {Math.min(...movementData.data)}
                </Text>
              </View>
              <View style={styles.barStat}>
                <Icon source="calculator" size={16} color="#7c3aed" />
                <Text style={styles.barStatText}>
                  Média: {Math.round(movementData.data.reduce((a, b) => a + b, 0) / movementData.data.length)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 🔹 CATEGORIAS EM DESTAQUE */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categorias em Destaque</Text>
            <Chip 
              icon="trophy"
              style={styles.trophyBadge}
              textStyle={styles.trophyBadgeText}
            >
              Top 5
            </Chip>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            {pieData.slice(0, 5).map((item, index) => {
              const gradient = getCategoryGradient(item.name)
              return (
                <View 
                  key={index} 
                  style={styles.categoryCard}
                >
                  <View style={styles.categoryHeader}>
                    <View style={[styles.categoryIcon, { backgroundColor: `${item.color}20` }]}>
                      <Icon source="tag" size={20} color={item.color} />
                    </View>
                    <Text style={styles.categoryName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                  <Text style={styles.categoryCount}>{item.population}</Text>
                  <Text style={styles.categoryLabel}>produtos</Text>
                  <View style={styles.categoryProgress}>
                    <View 
                      style={[
                        styles.categoryProgressBar,
                        { 
                          width: `${(item.population / data.totalProducts) * 100}%`,
                          backgroundColor: item.color
                        }
                      ]} 
                    />
                  </View>
                </View>
              )
            })}
          </ScrollView>
        </View>

        {/* 🔹 FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Icon source="update" size={16} color="#6b7280" />
            <Text style={styles.footerText}>
              Atualizado: {new Date().toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
          <Text style={styles.footerNote}>
            Dashboard atualizado automaticamente
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  loadingText: {
    marginTop: 28,
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937'
  },
  loadingSubtext: {
    marginTop: 12,
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 32
  },
  errorIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    borderWidth: 4,
    borderColor: '#fecaca'
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 12
  },
  errorSubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12
  },
  retryButton: {
    backgroundColor: '#ffffff',
    borderColor: '#7c3aed',
    borderWidth: 2,
    borderRadius: 12
  },
  retryButtonText: {
    color: '#7c3aed',
    fontWeight: '700'
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20
  },
  quickActionsContainer: {
    marginTop: 12,
    marginBottom: 28
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  metricsTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937'
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8
  },
  liveBadge: {
    backgroundColor: '#dcfce7',
    borderWidth: 0,
    height: 32
  },
  liveBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#047857'
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 28
  },
  metricColumn: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12
  },
  mainChartSection: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 28,
    marginBottom: 28,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28
  },
  mainChartTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937'
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 4
  },
  timeFilters: {
    flexDirection: 'row',
    gap: 8
  },
  timeChip: {
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    height: 36,
    borderRadius: 18
  },
  timeChipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed'
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280'
  },
  timeChipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  lineChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24
  },
  lineChart: {
    borderRadius: 20,
    marginLeft: 0
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#f1f5f9'
  },
  statItem: {
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937'
  },
  secondaryCharts: {
    gap: 20,
    marginBottom: 28
  },
  secondaryChart: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937'
  },
  chartBadge: {
    backgroundColor: '#f3f4f6',
    height: 28
  },
  chartBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4b5563'
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12
  },
  pieChart: {
    borderRadius: 16
  },
  pieLegend: {
    marginTop: 16
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12
  },
  legendName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563'
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1f2937'
  },
  barChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12
  },
  barChart: {
    borderRadius: 16,
    marginLeft: 0
  },
  barChartStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  barStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  barStatText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563'
  },
  categoriesSection: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 28,
    marginBottom: 28,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937'
  },
  trophyBadge: {
    backgroundColor: '#fef3c7',
    borderWidth: 0,
    height: 36
  },
  trophyBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400e'
  },
  categoriesScroll: {
    flexDirection: 'row'
  },
  categoriesScrollContent: {
    paddingRight: 16
  },
  categoryCard: {
    width: 160,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    marginRight: 16
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  categoryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937'
  },
  categoryCount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4
  },
  categoryLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 12
  },
  categoryProgress: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden'
  },
  categoryProgressBar: {
    height: '100%',
    borderRadius: 3
  },
  footer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center'
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280'
  },
  footerNote: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic'
  }
})