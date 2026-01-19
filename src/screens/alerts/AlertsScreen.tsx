import { View, FlatList, StyleSheet, RefreshControl, Animated } from 'react-native'
import { Text, ActivityIndicator, Chip, Icon, Button } from 'react-native-paper'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../services/supabase'
import AlertItem from '../../components/AlertItem'

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all') // 'all', 'active', 'resolved'

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  async function loadAlerts() {
    try {
      const { data } = await supabase
        .from('alerts')
        .select(`
          *,
          product:products (
            name,
            sku,
            category
          )
        `)
        .order('created_at', { ascending: false })

      setAlerts(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAlerts()

    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        loadAlerts
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (alerts.length > 0 && !loading) {
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
  }, [alerts, loading])

  const onRefresh = () => {
    setRefreshing(true)
    loadAlerts()
  }

  const getFilteredAlerts = () => {
    if (filter === 'all') return alerts
    if (filter === 'active') return alerts.filter(alert => !alert.resolved)
    return alerts.filter(alert => alert.resolved)
  }

  const getAlertStats = () => {
    const total = alerts.length
    const active = alerts.filter(alert => !alert.resolved).length
    const resolved = alerts.filter(alert => alert.resolved).length
    const critical = alerts.filter(alert => alert.severity === 'critical' && !alert.resolved).length

    return { total, active, resolved, critical }
  }

  const markAllAsResolved = async () => {
    const activeAlerts = alerts.filter(alert => !alert.resolved)
    if (activeAlerts.length === 0) return

    const updates = activeAlerts.map(alert => ({
      id: alert.id,
      resolved: true,
      resolved_at: new Date().toISOString()
    }))

    try {
      const { error } = await supabase
        .from('alerts')
        .upsert(updates)

      if (!error) {
        loadAlerts()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filteredAlerts = getFilteredAlerts()
  const stats = getAlertStats()

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={48} color="#7c3aed" />
        <Text style={styles.loadingText}>Carregando alertas...</Text>
        <Text style={styles.loadingSubtext}>Monitorando seu estoque</Text>
      </View>
    )
  }

  if (alerts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIllustration}>
          <Icon source="shield-check" size={96} color="#cbd5e1" />
          <View style={styles.emptyHighlight} />
        </View>
        <Text style={styles.emptyTitle}>Tudo sob controle!</Text>
        <Text style={styles.emptySubtitle}>
          Nenhum alerta ativo no momento
        </Text>
        <Text style={styles.emptyDescription}>
          O sistema monitorará automaticamente seu estoque
          e notificará sobre quaisquer problemas
        </Text>
      </View>
    )
  }

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
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
              <Icon source="alert" size={20} color="#d97706" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stats.active}</Text>
              <Text style={styles.statLabel}>Ativos</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#fee2e2' }]}>
              <Icon source="alert-octagram" size={20} color="#dc2626" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: stats.critical > 0 ? '#dc2626' : '#1e293b' }]}>
                {stats.critical}
              </Text>
              <Text style={styles.statLabel}>Críticos</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#d1fae5' }]}>
              <Icon source="check-circle" size={20} color="#059669" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stats.resolved}</Text>
              <Text style={styles.statLabel}>Resolvidos</Text>
            </View>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            textStyle={styles.filterChipText}
            showSelectedOverlay={false}
          >
            Todos ({stats.total})
          </Chip>
          <Chip
            selected={filter === 'active'}
            onPress={() => setFilter('active')}
            style={[styles.filterChip, filter === 'active' && styles.filterChipActive]}
            textStyle={styles.filterChipText}
            showSelectedOverlay={false}
          >
            Ativos ({stats.active})
          </Chip>
          <Chip
            selected={filter === 'resolved'}
            onPress={() => setFilter('resolved')}
            style={[styles.filterChip, filter === 'resolved' && styles.filterChipActive]}
            textStyle={styles.filterChipText}
            showSelectedOverlay={false}
          >
            Resolvidos ({stats.resolved})
          </Chip>
        </View>

        {stats.active > 0 && (
          <Button
            mode="outlined"
            icon="check-all"
            onPress={markAllAsResolved}
            style={styles.resolveAllButton}
            labelStyle={styles.resolveAllButtonLabel}
          >
            Resolver Todos
          </Button>
        )}
      </Animated.View>

      <FlatList
        data={filteredAlerts}
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
        ListEmptyComponent={
          <View style={styles.noAlertsContainer}>
            <Icon 
              source={filter === 'resolved' ? "shield-check" : "bell-off"} 
              size={64} 
              color="#cbd5e1" 
            />
            <Text style={styles.noAlertsText}>
              {filter === 'resolved' 
                ? 'Nenhum alerta resolvido' 
                : 'Nenhum alerta ativo'}
            </Text>
            <Text style={styles.noAlertsSubtext}>
              {filter === 'resolved'
                ? 'Todos os alertas ainda estão pendentes'
                : 'Todos os alertas foram resolvidos'}
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
            <AlertItem 
              alert={item} 
              onResolve={loadAlerts}
              delay={index * 100}
            />
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
    fontSize: 18,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 16
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300
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
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  statContent: {
    alignItems: 'center'
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8
  },
  filterChip: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20
  },
  filterChipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed'
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b'
  },
  resolveAllButton: {
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4
  },
  resolveAllButtonLabel: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 13
  },
  listContent: {
    padding: 16,
    paddingTop: 12
  },
  noAlertsContainer: {
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
  noAlertsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8
  },
  noAlertsSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center'
  }
})