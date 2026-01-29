import { Card, Text, Icon } from 'react-native-paper'
import { View, StyleSheet } from 'react-native'

interface Props {
  title?: string
  value: number | string
  icon?: string
  trend?: { value: string; positive: boolean }
  warning?: boolean
  gradient?: string[]
  subtitle?: string
  elevation?: number
}

export default function MetricCard({ title, value, icon, trend, warning, gradient, subtitle, elevation }: Props) {
  const cardStyle = [
    styles.card,
    warning && styles.warningCard,
    gradient && gradient.length > 0 ? { backgroundColor: gradient[0] } : null,
    elevation ? { elevation } : null
  ]

  return (
    <Card style={cardStyle}>
      <Card.Content>
        {icon && (
          <View style={styles.iconRow}>
            <Icon source={icon} size={18} color="#7c3aed" />
          </View>
        )}
        {title && <Text variant="titleSmall">{title}</Text>}
        <Text variant="headlineMedium">{value}</Text>
        {subtitle && <Text variant="bodyMedium" style={styles.subtitle}>{subtitle}</Text>}
        {trend && (
          <Text style={[styles.trendText, { color: trend.positive ? '#047857' : '#dc2626' }]}>
            {trend.value}
          </Text>
        )}
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { margin: 6, flex: 1 },
  warningCard: { borderWidth: 1, borderColor: '#f97316' },
  iconRow: { position: 'absolute', right: 12, top: 12 },
  trendText: { marginTop: 6, fontWeight: '700' },
  subtitle: { marginTop: 4, color: '#4b5563', fontWeight: '600' }
})
