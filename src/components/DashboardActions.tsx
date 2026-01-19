import { View, StyleSheet } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'

export default function DashboardActions() {
  const navigation = useNavigation<any>()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ações Rápidas</Text>

      <View style={styles.buttons}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => navigation.navigate('ProductCreate')}
        >
          Novo Produto
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Products')}
        >
          Produtos
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Stock')}
        >
          Estoque
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('StockMovement')}
        >
          Movimentar
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Alerts')}
        >
          Alertas
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 12,
    elevation: 2
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between'
  }
})
