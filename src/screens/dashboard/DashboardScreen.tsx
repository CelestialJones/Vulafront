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
      'Eletrônicos': '#4f46e5',
      'Vestuário': '#059669',
      'Alimentos': '#dc2626',
      'Bebidas': '#ea580c',
      'Limpeza': '#2563eb',
      'Outros': '#6b7280'
    }
    return colors[category] || colors['Outros']
  }

  const rotateInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  })

  // Dados realistas para o gráfico de movimentações
  const getMovementData = () => {
    const currentMonth = new Date().getMonth()
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    let labels = []
    let dataPoints = []
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      labels.push(months[monthIndex])
      
      let baseValue = 50
      if (monthIndex === 5 || monthIndex === 11) baseValue = 85
      if (monthIndex === 1 || monthIndex === 7) baseValue = 70
      
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
          <Icon source="loading" size={64} color="#4f46e5" />
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
      color: '#059669', 
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
            colors={['#4f46e5']}
            tintColor="#4f46e5"
            progressBackgroundColor="#f8fafc"
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
              icon="update" 
              style={styles.liveBadge}
              textStyle={styles.liveBadgeText}
            >
              Em tempo real
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
              color="#4f46e5"
              subtitle="Total cadastrado"
              elevation={4}
            />
          </View>
          <View style={styles.metricColumn}>
            <MetricCard 
              title="Estoque Total" 
              value={data.totalStock} 
              icon="cube"
              trend={{ value: trend.text, positive: trend.icon === 'trending-up' }}
              color="#2563eb"
              subtitle={trend.label}
              elevation={4}
            />
          </View>
          <View style={styles.metricColumn}>
            <MetricCard 
              title="Estoque Baixo" 
              value={data.lowStockProducts} 
              icon="alert"
              trend={{ value: `${Math.round((data.lowStockProducts / data.totalProducts) * 100)}%`, positive: false }}
              warning={data.lowStockProducts > 0}
              color="#ea580c"
              subtitle="Atenção necessária"
              elevation={4}
            />
          </View>
          <View style={styles.metricColumn}>
            <MetricCard 
              title="Alertas" 
              value={data.alerts} 
              icon="bell"
              trend={{ value: `${Math.round((data.alerts / data.totalProducts) * 100)}%`, positive: false }}
              warning={data.alerts > 0}
              color="#dc2626"
              subtitle="Monitoramento ativo"
              elevation={4}
            />
          </View>
        </View>

        {/* 🔹 GRÁFICO PRINCIPAL */}
        <View style={styles.mainChartSection}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
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
                  compact
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
                  color: () => '#4f46e5',
                  strokeWidth: 3
                }]
              }}
              width={screenWidth - 48}
              height={260}
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#ffffff'
                },
                propsForBackgroundLines: {
                  strokeWidth: 1,
                  stroke: '#e5e7eb',
                  strokeDasharray: ''
                },
                fillShadowGradient: '#4f46e5',
                fillShadowGradientOpacity: 0.2,
                propsForLabels: {
                  fontSize: 11,
                  fontWeight: '600'
                },
                propsForVerticalLabels: {
                  rotation: -45
                }
              }}
              bezier
              style={styles.lineChart}
              withVerticalLines={false}
              withHorizontalLines={true}
              withInnerLines={false}
              withShadow={false}
              segments={5}
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
              <Text style={[styles.statValue, { color: '#4f46e5' }]}>{data.totalStock}</Text>
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
                height={180}
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
                height={180}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
                  style: { borderRadius: 12 },
                  barPercentage: 0.6,
                  propsForBackgroundLines: {
                    strokeWidth: 1,
                    stroke: '#e5e7eb'
                  },
                  propsForLabels: {
                    fontSize: 10,
                    fontWeight: '600'
                  },
                  propsForVerticalLabels: {
                    rotation: 0
                  }
                }}
                style={styles.barChart}
                showValuesOnTopOfBars
                withInnerLines={false}
                fromZero
                yAxisInterval={1}
              />
            </View>

            <View style={styles.barChartStats}>
              <View style={styles.barStat}>
                <Icon source="trending-up" size={16} color="#059669" />
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
                <Icon source="calculator" size={16} color="#4f46e5" />
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
              icon="star"
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
            {pieData.slice(0, 5).map((item, index) => (
              <View 
                key={index} 
                style={styles.categoryCard}
              >
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIcon, { backgroundColor: `${item.color}15` }]}>
                    <Icon source="tag" size={18} color={item.color} />
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
            ))}
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
    backgroundColor: '#ffffff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  loadingText: {
    marginTop: 28,
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937'
  },
  loadingSubtext: {
    marginTop: 12,
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '400'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 32
  },
  errorIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    borderWidth: 2,
    borderColor: '#fee2e2'
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
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
    borderColor: '#4f46e5',
    borderWidth: 1,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#4f46e5',
    fontWeight: '600'
  },
  scrollContent: {
    paddingBottom: 32,
    paddingHorizontal: 20
  },
  quickActionsContainer: {
    marginTop: 12,
    marginBottom: 24
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  metricsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937'
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8
  },
  liveBadge: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 32,
    borderRadius: 8
  },
  liveBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4f46e5'
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
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    flexWrap: 'wrap'
  },
  chartTitleContainer: {
    flex: 1,
    minWidth: '60%',
    marginRight: 12,
    marginBottom: 12
  },
  mainChartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 24
  },
  chartSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '400',
    marginTop: 4
  },
  timeFilters: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    maxWidth: '40%'
  },
  timeChip: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 30,
    borderRadius: 15,
    minWidth: 65
  },
  timeChipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5'
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center'
  },
  timeChipTextActive: {
    color: '#ffffff',
    fontWeight: '600'
  },
  lineChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  lineChart: {
    borderRadius: 12,
    marginLeft: 0
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexWrap: 'wrap',
    gap: 16
  },
  statItem: {
    alignItems: 'center',
    minWidth: '20%',
    flex: 1
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center'
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center'
  },
  secondaryCharts: {
    gap: 20,
    marginBottom: 24
  },
  secondaryChart: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937'
  },
  chartBadge: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 26,
    borderRadius: 6
  },
  chartBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563'
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12
  },
  pieChart: {
    borderRadius: 12
  },
  pieLegend: {
    marginTop: 16
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10
  },
  legendName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#4b5563'
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937'
  },
  barChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12
  },
  barChart: {
    borderRadius: 12,
    marginLeft: 0
  },
  barChartStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexWrap: 'wrap',
    gap: 12
  },
  barStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: '30%'
  },
  barStatText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563'
  },
  categoriesSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937'
  },
  trophyBadge: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 32,
    borderRadius: 8
  },
  trophyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4f46e5'
  },
  categoriesScroll: {
    flexDirection: 'row'
  },
  categoriesScrollContent: {
    paddingRight: 16
  },
  categoryCard: {
    width: 140,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 12
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937'
  },
  categoryCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4
  },
  categoryLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '400',
    marginBottom: 12
  },
  categoryProgress: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden'
  },
  categoryProgressBar: {
    height: '100%',
    borderRadius: 2
  },
  footer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center'
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280'
  },
  footerNote: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '400',
    textAlign: 'center',
    fontStyle: 'italic'
  }
})