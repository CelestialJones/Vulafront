
import { NavigationContainer } from '@react-navigation/native'
import { Provider as PaperProvider, Portal } from 'react-native-paper'
import { useAuth } from './src/hooks/useAuth'
import AuthNavigator from './src/navigation/AuthNavigator'
import AppNavigator from './src/navigation/AppNavigator'
import Loading from './src/components/Loading'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) return <Loading />

  return (
    <PaperProvider>
      <Portal.Host>
        <NavigationContainer>
          {session ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </Portal.Host>
    </PaperProvider>
  )
}
