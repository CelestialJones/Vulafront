import { createNativeStackNavigator } from '@react-navigation/native-stack'

import DashboardScreen from '../screens/dashboard/DashboardScreen'
import ProductListScreen from '../screens/products/ProductListScreen'
import ProductCreateScreen from '../screens/products/ProductCreateScreen'
import StockListScreen from '../screens/stock/StockListScreen'
import StockMovementScreen from '../screens/stock/StockMovementScreen'
import AlertsScreen from '../screens/alerts/AlertsScreen'

export type AppStackParamList = {
  Dashboard: undefined
  Products: undefined
  ProductCreate: undefined
  Stock: undefined
  StockMovement: undefined
  Alerts: undefined
}

const Stack = createNativeStackNavigator<AppStackParamList>()

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Products" component={ProductListScreen} />
      <Stack.Screen name="ProductCreate" component={ProductCreateScreen} />
      <Stack.Screen name="Stock" component={StockListScreen} />
      <Stack.Screen name="StockMovement" component={StockMovementScreen} />
      <Stack.Screen name="Alerts" component={AlertsScreen} />
    </Stack.Navigator>
  )
}
