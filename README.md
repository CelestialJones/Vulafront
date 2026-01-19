# 📦 VulaStock Mobile

<p align="center">
  <strong>Aplicativo móvel profissional para controle e gestão de estoque em armazéns</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-Expo-blue" />
  <img src="https://img.shields.io/badge/Backend-Supabase-success" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-blue" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-informational" />
  <img src="https://img.shields.io/badge/Status-Ativo-brightgreen" />
</p>

---

## 🧾 Sobre o Projeto

O **VulaStock Mobile** é um aplicativo desenvolvido para **automatizar e modernizar o controle de estoque em armazéns**, substituindo processos manuais por uma solução móvel, segura e em tempo real.

O sistema permite o cadastro completo de produtos, controle rigoroso de movimentações, alertas automáticos, auditoria de ações e um **dashboard profissional com gráficos**, tudo integrado a um backend robusto no **Supabase (PostgreSQL)**.

Este projeto foi desenvolvido com foco em **boas práticas, escalabilidade, segurança e uso acadêmico/profissional**, sendo ideal para **TFC, portfólio ou aplicação real**.

---

## 🚀 Tecnologias Utilizadas

### 📱 Frontend (Mobile)
- React Native
- Expo
- TypeScript
- React Navigation
- React Native Paper
- react-native-chart-kit

### ☁️ Backend (BaaS)
- Supabase
  - Supabase Auth (JWT)
  - PostgreSQL
  - Storage (imagens)
  - Row Level Security (RLS)

---

## 🏗️ Arquitetura do Sistema

```
React Native (Expo)
        ↓
Supabase SDK
        ↓
PostgreSQL (RLS + Policies)
```

O frontend comunica diretamente com o Supabase, que gerencia autenticação, API, banco de dados e segurança.

---

## 📁 Estrutura do Projeto

```
/mobile
 ├── src
 │   ├── components        # Componentes reutilizáveis
 │   ├── screens           # Telas do aplicativo
 │   │   ├── auth
 │   │   ├── dashboard
 │   │   ├── products
 │   │   ├── stock
 │   │   ├── alerts
 │   │   └── reports
 │   ├── navigation        # Stack / Tabs
 │   ├── services          # Supabase e regras de negócio
 │   ├── hooks             # Hooks personalizados
 │   ├── utils             # Utilitários
 │   └── types             # Tipagens globais
 └── App.tsx
```

---

## 🔐 Perfis de Acesso

O controle de acesso é feito **no backend via RLS**, garantindo segurança real.

| Perfil       | Permissões |
|--------------|------------|
| **Admin**    | Acesso total, usuários, relatórios |
| **Supervisor** | Produtos, movimentações, alertas |
| **Operator** | Entradas, saídas, consulta |

---

## ✨ Funcionalidades

### 📦 Gestão de Produtos
- Cadastro completo (SKU, categoria, imagem)
- Estoque mínimo configurável
- Upload de imagens

### 🔄 Movimentações de Estoque
- Entradas
- Saídas
- Transferências internas
- Controle por localização

### ⚠️ Alertas Automáticos
- Estoque abaixo do mínimo
- Validade próxima
- Alertas visíveis no dashboard

### 📊 Dashboard Profissional
- Total de produtos
- Itens em estoque
- Produtos com estoque baixo
- Gráficos por categoria
- Ações rápidas

### 🧾 Auditoria
- Log completo de ações
- Rastreabilidade total (audit_logs)

---

## 🛡️ Segurança

- Autenticação JWT
- Row Level Security (RLS)
- Controle por perfil
- Auditoria completa
- HTTPS

---

## ⚙️ Como Executar o Projeto

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/seu-usuario/vulastock-mobile.git
cd vulastock-mobile
```

### 2️⃣ Instalar dependências

```bash
npm install
```

### 3️⃣ Configurar variáveis de ambiente

Crie um arquivo `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 4️⃣ Executar o projeto

```bash
npx expo start
```

---

## 📸 Screenshots

> *(Adicione aqui imagens do aplicativo rodando)*

```
/screenshots
 ├── login.png
 ├── dashboard.png
 ├── products.png
 └── movements.png
```

---

## 📌 Status do Projeto

- ✅ Backend completo
- ✅ Frontend funcional
- ✅ Dashboard com gráficos
- ✅ Controle de acesso

### 🔄 Melhorias Futuras
- Notificações push
- Histórico avançado no dashboard
- Modo offline
- Exportação de relatórios

---

## 👨‍💻 Autor

**Celestial Jones**  
Desenvolvedor de Software

Projeto desenvolvido para fins acadêmicos e profissionais, com foco em qualidade, segurança e escalabilidade.

---

## 📄 Licença

Este projeto é de uso educacional e demonstrativo.

---

⭐ Se este projeto te ajudou, considere deixar uma estrela no repositório!

