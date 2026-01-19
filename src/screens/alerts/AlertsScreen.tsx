import { View, FlatList, StyleSheet } from 'react-native'
import { Text, ActivityIndicator } from 'react-native-paper'
import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import AlertItem from '../../components/AlertItem'

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadAlerts() {
    try {
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })

      setAlerts(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()

    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        loadAlerts
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  /* 🔄 LOADING CENTRALIZADO */
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Carregando alertas...</Text>
      </View>
    )
  }

  if (alerts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Nenhum alerta no momento</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={alerts}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 10 }}
      renderItem={({ item }) => <AlertItem alert={item} />}
    />
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
