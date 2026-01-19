import { View, StyleSheet, Image, Animated, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../services/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [shake, setShake] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const shakeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start()
  }, [])

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start()
  }

  async function handleLogin() {
    try {
      setLoading(true)

      if (!email || !password) {
        triggerShake()
        alert('⚠️ Preencha o email e a senha')
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      })

      if (error) {
        triggerShake()
        throw error
      }
    } catch (err: any) {
      alert(`❌ ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    // Implementar recuperação de senha
    alert('Funcionalidade de recuperação de senha em desenvolvimento')
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* BACKGROUND GRADIENT */}
          <View style={styles.backgroundGradient} />

          <View style={styles.content}>
            {/* HEADER */}
            <Animated.View 
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../../assets/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <View style={styles.logoGlow} />
              </View>

              <Text variant="headlineLarge" style={styles.title}>
                VulaStock
              </Text>

              <Text style={styles.subtitle}>
                Gestão inteligente de estoque
              </Text>

              <View style={styles.taglineContainer}>
                <Text style={styles.tagline}>
                  Controle total do seu inventário
                </Text>
              </View>
            </Animated.View>

            {/* FORMULÁRIO */}
            <Animated.View 
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { translateX: shakeAnim }]
                }
              ]}
            >
              <View style={styles.form}>
                <Text style={styles.formTitle}>Acessar sua conta</Text>
                
                <TextInput
                  label="Email"
                  mode="outlined"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  textColor="#1f2937"
                  left={<TextInput.Icon icon="email" size={20} color="#7c3aed" />}
                  placeholder="seu@email.com"
                  placeholderTextColor="#9ca3af"
                />

                <TextInput
                  label="Senha"
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  textColor="#1f2937"
                  left={<TextInput.Icon icon="lock" size={20} color="#7c3aed" />}
                  right={
                    <TextInput.Icon 
                      icon={showPassword ? "eye-off" : "eye"} 
                      onPress={() => setShowPassword(!showPassword)}
                      color="#7c3aed"
                    />
                  }
                  placeholder="Sua senha"
                  placeholderTextColor="#9ca3af"
                />

                <View style={styles.forgotPasswordContainer}>
                  <Button
                    mode="text"
                    onPress={handleForgotPassword}
                    labelStyle={styles.forgotPasswordText}
                    compact
                  >
                    Esqueceu a senha?
                  </Button>
                </View>

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  disabled={loading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  icon={loading ? undefined : "login"}
                  labelStyle={styles.buttonLabel}
                >
                  {loading ? (
                    <ActivityIndicator animating color="#ffffff" size={24} />
                  ) : (
                    'Entrar'
                  )}
                </Button>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>ou</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  mode="outlined"
                  onPress={() => console.log('Cadastrar')}
                  style={styles.secondaryButton}
                  contentStyle={styles.secondaryButtonContent}
                  labelStyle={styles.secondaryButtonLabel}
                  icon="account-plus"
                >
                  Criar nova conta
                </Button>
              </View>
            </Animated.View>

            {/* FOOTER */}
            <Animated.View 
              style={[
                styles.footer,
                {
                  opacity: fadeAnim
                }
              ]}
            >
              <Text style={styles.footerText}>
                © 2024 VulaStock • v1.0.0
              </Text>
              <Text style={styles.footerSubtext}>
                Gestão de estoque simplificada
              </Text>
            </Animated.View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#7c3aed',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between'
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 8
  },
  logo: {
    width: 100,
    height: 100,
    zIndex: 2
  },
  logoGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 60,
    zIndex: 1
  },
  title: {
    fontWeight: '800',
    color: '#ffffff',
    fontSize: 36,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  subtitle: {
    marginTop: 4,
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '500'
  },
  taglineContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  tagline: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 32,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 28,
    textAlign: 'center'
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    fontSize: 16
  },
  inputOutline: {
    borderWidth: 2,
    borderRadius: 12,
    borderColor: '#e5e7eb'
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#7c3aed',
    fontWeight: '600'
  },
  button: {
    borderRadius: 14,
    backgroundColor: '#7c3aed',
    borderWidth: 0,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  buttonContent: {
    height: 56
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb'
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '600'
  },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#7c3aed'
  },
  secondaryButtonContent: {
    height: 52
  },
  secondaryButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7c3aed'
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4
  },
  footerSubtext: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500'
  }
})