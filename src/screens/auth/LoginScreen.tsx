import { View, StyleSheet, Image } from 'react-native'
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper'
import { useState } from 'react'
import { supabase } from '../../services/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    try {
      setLoading(true)

      if (!email || !password) {
        alert('Preencha o email e a senha')
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text variant="headlineLarge" style={styles.title}>
          VulaStock
        </Text>

        <Text style={styles.subtitle}>
          Gestão inteligente de estoque
        </Text>
      </View>

      {/* FORMULÁRIO */}
      <View style={styles.form}>
        <TextInput
          label="Email"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          label="Senha"
          mode="outlined"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          disabled={loading}
          style={styles.button}
          contentStyle={{ height: 50 }}
        >
          {loading ? (
            <ActivityIndicator animating color="#fff" />
          ) : (
            'Entrar'
          )}
        </Button>
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    alignItems: 'center',
    marginTop: 70,
    marginBottom: 40
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: -20
  },
  title: {
    fontWeight: '700'
  },
  subtitle: {
    marginTop: 4,
    color: '#777',
    fontSize: 13
  },
  form: {
    paddingHorizontal: 8
  },
  input: {
    marginBottom: 14,
    backgroundColor: '#fff'
  },
  button: {
    marginTop: 10,
    borderRadius: 8
  }
})

