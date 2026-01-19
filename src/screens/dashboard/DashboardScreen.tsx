import { View, ScrollView, Dimensions, StyleSheet } from 'react-native'
import { Text, ActivityIndicator } from 'react-native-paper'
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
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text>Carregando dashboard...</Text>
      </View>
    )
  }

  if (!data) {
    return <Text style={styles.loading}>Erro ao carregar dados</Text>
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
    color: `hsl(${index * 60}, 70%, 60%)`,
    legendFontColor: '#444',
    legendFontSize: 12
  }))

  return (
    <View style={styles.container}>
      <DashboardHeader />

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* 🔹 AÇÕES */}
        <DashboardActions />

        {/* 🔹 MÉTRICAS */}
        <View style={styles.row}>
          <MetricCard title="Produtos" value={data.totalProducts} />
          <MetricCard title="Itens em Estoque" value={data.totalStock} />
        </View>

        <View style={styles.row}>
          <MetricCard title="Estoque Baixo" value={data.lowStockProducts} />
          <MetricCard title="Alertas Ativos" value={data.alerts} />
        </View>

        {/* 🔹 GRÁFICOS */}
        <Text style={styles.sectionTitle}>Evolução do Estoque</Text>

        <LineChart
          data={{
            labels: ['Atual'],
            datasets: [{ data: [data.totalStock] }]
          }}
          width={screenWidth - 20}
          height={220}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: () => '#6200ee',
            labelColor: () => '#555'
          }}
          style={styles.chart}
        />

        <Text style={styles.sectionTitle}>Produtos por Categoria</Text>

        <PieChart
          data={pieData}
          width={screenWidth - 20}
          height={220}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          chartConfig={{ color: () => '#000' }}
          style={styles.chart}
        />
      </ScrollView>
    </View>
  )
}

/* ===============================
   STYLES
=============================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2'
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row'
  },
  sectionTitle: {
    margin: 12,
    fontWeight: 'bold',
    fontSize: 16
  },
  chart: {
    marginHorizontal: 10,
    borderRadius: 12
  }
})
