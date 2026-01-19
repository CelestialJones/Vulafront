import { View, ScrollView, Dimensions, StyleSheet, RefreshControl } from 'react-native'
import { Text, ActivityIndicator, Chip, Icon } from 'react-native-paper'
import { useEffect, useState } from 'react'
import { LineChart, PieChart } from 'react-native-chart-kit'

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

  useEffect(() => {
    loadDashboard()
  }, [])

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={48} color="#7c3aed" />
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
        <Text style={styles.loadingSubtext}>Analisando seus dados</Text>
      </View>
    )
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Icon source="alert-circle" size={48} color="#dc2626" />
        <Text style={styles.errorTitle}>Erro ao carregar dados</Text>
        <Text style={styles.errorSubtext}>
          Verifique sua conexão e tente novamente
        </Text>
      </View>
    )
  }

  /* ===============================
     GRÁFICO DE CATEGORIAS
  =============================== */
  const categories: Record<string, number> = {}
  data.products.forEach((p: any) => {
    const key = p.category || 'Outros'
    categories[key] = (categories[key] || 0) + 1
  })

  const pieData = Object.keys(categories).map((key, index) => ({
    name: key,
    population: categories[key],
    color: getCategoryColor(key),
    legendFontColor: '#1f2937',
    legendFontSize: 12,
    legendFontWeight: '600'
  }))

  // Dados simulados para o gráfico de linha
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

  const getTrendArrow = () => {
    const current = data.totalStock
    const previous = 92 // Valor simulado do mês anterior
    const diff = current - previous
    if (diff > 0) return { icon: 'trending-up', color: '#047857', text: `${diff}%` }
    if (diff < 0) return { icon: 'trending-down', color: '#dc2626', text: `${Math.abs(diff)}%` }
    return { icon: 'trending-neutral', color: '#6b7280', text: '0%' }
  }

  const trend = getTrendArrow()

  return (
    <View style={styles.container}>
      <DashboardHeader />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7c3aed']}
            tintColor="#7c3aed"
            progressBackgroundColor="#f1f5f9"
          />
        }
      >
        {/* 🔹 AÇÕES */}
        <DashboardActions />

        {/* 🔹 MÉTRICAS */}
        <View style={styles.metricsContainer}>
          <View style={styles.row}>
            <View style={styles.metricWrapper}>
              <MetricCard 
         //       title="Produtos" 
                value={data.totalProducts} 
                icon="package"
                trend={{ value: '+12%', positive: true }}
              />
            </View>
            <View style={styles.metricWrapper}>
              <MetricCard 
                title="Itens em Estoque" 
                value={data.totalStock} 
             //   icon="cube"
              //  trend={{ value: trend.text, positive: trend.icon === 'trending-up' }}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.metricWrapper}>
              <MetricCard 
                title="Estoque Baixo" 
                value={data.lowStockProducts} 
                //icon="alert"
              //  trend={{ value: `${Math.round((data.lowStockProducts / data.totalProducts) * 100)}%`, positive: false }}
              //  warning={data.lowStockProducts > 0}
              />
            </View>
            <View style={styles.metricWrapper}>
              <MetricCard 
                title="Alertas Ativos" 
                value={data.alerts} 
              //  icon="bell"
               // trend={{ value: `${Math.round((data.alerts / data.totalProducts) * 100)}%`, positive: false }}
              //  warning={data.alerts > 0}
              />
            </View>
          </View>
        </View>

        {/* 🔹 RESUMO */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Resumo do Estoque</Text>
            <Chip 
              icon="information" 
              style={styles.infoChip}
              textStyle={styles.infoChipText}
            >
              Atualizado agora
            </Chip>
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Icon source={trend.icon} size={20} color={trend.color} />
              <Text style={[styles.summaryText, { color: trend.color }]}>
                {trend.icon === 'trending-up' ? 'Crescendo' : trend.icon === 'trending-down' ? 'Decrescendo' : 'Estável'}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Icon source="clock" size={20} color="#6b7280" />
              <Text style={styles.summaryText}>
                {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </Text>
            </View>
          </View>
        </View>

        {/* 🔹 GRÁFICO DE LINHA */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Evolução do Estoque</Text>
            <View style={styles.timeFilters}>
              <Chip
                selected={timeRange === 'week'}
                onPress={() => setTimeRange('week')}
                style={[styles.timeChip, timeRange === 'week' && styles.timeChipActive]}
                textStyle={styles.timeChipText}
              >
                Semana
              </Chip>
              <Chip
                selected={timeRange === 'month'}
                onPress={() => setTimeRange('month')}
                style={[styles.timeChip, timeRange === 'month' && styles.timeChipActive]}
                textStyle={styles.timeChipText}
              >
                Mês
              </Chip>
              <Chip
                selected={timeRange === 'year'}
                onPress={() => setTimeRange('year')}
                style={[styles.timeChip, timeRange === 'year' && styles.timeChipActive]}
                textStyle={styles.timeChipText}
              >
                Ano
              </Chip>
            </View>
          </View>
          
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: getChartLabels(),
                datasets: [{ 
                  data: getChartData(),
                  color: () => '#7c3aed',
                  strokeWidth: 4
                }]
              }}
              width={screenWidth - 48}
              height={240}
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: () => '#7c3aed',
                labelColor: () => '#4b5563',
                style: { borderRadius: 20 },
                propsForDots: {
                  r: '8',
                  strokeWidth: '3',
                  stroke: '#ffffff'
                },
                propsForBackgroundLines: {
                  strokeWidth: 1,
                  stroke: '#e5e7eb',
                  strokeDasharray: ''
                },
                fillShadowGradient: '#7c3aed',
                fillShadowGradientOpacity: 0.3,
                propsForLabels: {
                  fontSize: 11,
                  fontWeight: '600'
                }
              }}
              bezier
              style={styles.chart}
              withVerticalLines={true}
              withHorizontalLines={true}
              withInnerLines={true}
              withShadow={true}
              segments={6}
            />
          </View>
          
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#7c3aed' }]} />
              <Text style={styles.legendText}>Total de Itens</Text>
            </View>
          </View>
        </View>

        {/* 🔹 GRÁFICO DE PIZZA */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Distribuição por Categoria</Text>
            <Chip 
              icon="chart-pie"
              style={styles.categoryChip}
              textStyle={styles.categoryChipText}
            >
              {Object.keys(categories).length} categorias
            </Chip>
          </View>
          
          <View style={styles.chartContainer}>
            <PieChart
              data={pieData}
              width={screenWidth - 48}
              height={240}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: () => '#1f2937'
              }}
              style={styles.chart}
              hasLegend={false}
              avoidFalseZero={true}
              absolute={false}
              center={[0, 0]}
            />
          </View>
          
          <View style={styles.categoryLegend}>
            {pieData.slice(0, 4).map((item, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                <Text style={styles.categoryName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.categoryValue}>
                  {item.population}
                </Text>
              </View>
            ))}
          </View>
          
          {pieData.length > 4 && (
            <View style={styles.moreCategories}>
              <Icon source="dots-horizontal" size={16} color="#6b7280" />
              <Text style={styles.moreCategoriesText}>
                +{pieData.length - 4} categorias
              </Text>
            </View>
          )}
        </View>

        {/* 🔹 FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Última atualização: {new Date().toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 32
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 8
  },
  errorSubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24
  },
  scrollContent: {
    paddingBottom: 32,
    paddingHorizontal: 20
  },
  metricsContainer: {
    marginTop: 8,
    marginBottom: 24
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  metricWrapper: {
    flex: 1,
    marginHorizontal: 6
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937'
  },
  infoChip: {
    backgroundColor: '#f3f4f6',
    borderWidth: 0,
    height: 32
  },
  infoChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280'
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  summaryText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb'
  },
  chartSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937'
  },
  timeFilters: {
    flexDirection: 'row',
    gap: 8
  },
  timeChip: {
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    height: 32
  },
  timeChipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed'
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280'
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24
  },
  chart: {
    borderRadius: 16
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  legendText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563'
  },
  categoryChip: {
    backgroundColor: '#ede9fe',
    borderWidth: 0,
    height: 32
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed'
  },
  categoryLegend: {
    marginTop: 16
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937'
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1f2937',
    marginLeft: 8
  },
  moreCategories: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  moreCategoriesText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 6
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500'
  }
})