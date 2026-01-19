import { FlatList, View } from 'react-native'
import { Text, Card } from 'react-native-paper'
import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import dayjs from 'dayjs'

export default function AuditLogScreen() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadLogs() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        id,
        action,
        table_name,
        record_id,
        created_at,
        ip_address,
        user_agent,
        profiles ( full_name, email )
      `)
      .order('created_at', { ascending: false })

    if (!error) setLogs(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadLogs()
  }, [])

  if (loading) {
    return <Text>Carregando auditoria...</Text>
  }

  return (
    <FlatList
      data={logs}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <Card style={{ margin: 8 }}>
          <Card.Content>
            <Text variant="titleMedium">{item.action}</Text>
            <Text>Tabela: {item.table_name}</Text>
            <Text>Registro: {item.record_id}</Text>

            <Text>
              Utilizador: {item.profiles?.full_name || item.profiles?.email}
            </Text>

            <Text>
              Data: {dayjs(item.created_at).format('DD/MM/YYYY HH:mm')}
            </Text>

            {item.ip_address && <Text>IP: {item.ip_address}</Text>}
          </Card.Content>
        </Card>
      )}
    />
  )
}
