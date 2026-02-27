# 📅 Escala Inteligente Pro

Aplicação desktop para **geração e gerenciamento automático de escalas de serviço**, desenvolvida com React + Vite e empacotada como aplicativo nativo com Electron. Os dados são sincronizados em tempo real com o Supabase, permitindo que múltiplas instâncias compartilhem a mesma base de dados.

---

## ✨ Funcionalidades

### 👥 Gerenciamento de Pessoas
- Cadastro de membros com nome e número de WhatsApp
- Edição de informações (nome e telefone) a qualquer momento
- Exclusão de membros com confirmação

### 🏷️ Gerenciamento de Funções
- Cadastro de funções/cargos personalizados (ex: Louvores, Oração, Palavra, etc.)
- Exclusão de funções com confirmação

### 🗓️ Escalas Inteligentes
- **Geração automática** de escalas com algoritmo inteligente que respeita as regras:
  - ❌ Nenhuma pessoa realiza a mesma função **duas vezes na mesma semana**
  - ❌ Nenhuma pessoa realiza **mais de uma função no mesmo dia**
  - ✅ Maximiza a distribuição — usa o **maior número possível de pessoas** por semana
  - ✅ Balanceia a carga de trabalho ao longo das semanas com base no histórico

- **Configuração flexível** ao criar uma escala:
  - Nome da escala
  - Número de semanas do ciclo
  - Dias da semana ativos (Dom, Seg, Ter, Qua, Qui, Sex, Sáb)
  - Seleção de quais pessoas e funções participam

- **Edição manual**: Cada atribuição pode ser modificada individualmente após a geração
- **Regeneração**: Gera um novo sorteio para a escala com os mesmos parâmetros
- **Impressão**: Suporte a impressão otimizada das escalas (CSS de impressão dedicado)
- **Exclusão** de escalas com confirmação

### 🔔 Notificações Diárias
- Configuração de notificações automáticas por escala
- Definição de **horário diário** de verificação
- **Modelo de mensagem personalizável** com variáveis dinâmicas:
  - `{person}` — Nome da pessoa escalada
  - `{role}` — Função que será desempenhada
  - `{day}` — Dia da escala
- Ativação/desativação das notificações por configuração
- Listagem e remoção das configurações ativas

---

## 🛠️ Stack Tecnológica

| Tecnologia | Uso |
|---|---|
| [React 19](https://react.dev/) | Interface de usuário |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática |
| [Vite](https://vitejs.dev/) | Build e dev server |
| [Electron](https://www.electronjs.org/) | Empacotamento desktop (Windows) |
| [Supabase](https://supabase.com/) | Banco de dados e sincronização em nuvem |
| [Tailwind CSS](https://tailwindcss.com/) | Estilização |
| [Lucide React](https://lucide.dev/) | Ícones |
| [date-fns](https://date-fns.org/) | Manipulação de datas |

---

## 🚀 Instalação e Execução

### Pré-requisitos
- [Node.js](https://nodejs.org/) v18 ou superior
- Conta no [Supabase](https://supabase.com/) com as tabelas configuradas

### 1. Clone o repositório

```bash
git clone https://github.com/LucasGabrielFR/EscalasSeminario.git
cd EscalasSeminario
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### 4. Configure o banco de dados (Supabase)

Execute os seguintes SQLs no **SQL Editor** do seu projeto Supabase:

```sql
-- Tabela de pessoas
CREATE TABLE people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT
);

-- Tabela de funções
CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- Tabela de escalas
CREATE TABLE schedules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  settings JSONB,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de configurações de notificações
CREATE TABLE notification_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id TEXT REFERENCES schedules(id) ON DELETE CASCADE,
  check_time TEXT NOT NULL,
  message_template TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE
);
```

---

## ▶️ Rodando o Projeto

### Modo Web (navegador)

```bash
npm run dev
```

Acesse em: `http://localhost:3000`

### Modo Desktop (Electron)

```bash
npm run electron:dev
```

Abre a aplicação como janela desktop nativa no Windows.

---

## 📦 Gerando o Executável

Para gerar um arquivo `.exe` para distribuição no Windows:

```bash
npm run electron:build
```

O executável será gerado na pasta `dist_electron/`. Basta compartilhar a pasta gerada — não é necessário instalar Node.js no computador do usuário final.

> **Nota:** As credenciais do Supabase são embutidas no build. Certifique-se de que o arquivo `.env.local` está configurado corretamente antes de gerar o executável.

---

## 📁 Estrutura do Projeto

```
escala-inteligente-pro/
├── components/         # Componentes reutilizáveis (Sidebar)
├── electron/           # Configuração do Electron (main.cjs)
├── hooks/              # Estado global da aplicação (useEscalaStore)
├── public/             # Assets públicos (ícone da aplicação)
├── services/           # Lógica de negócio e integração
│   ├── scheduleLogic.ts  # Algoritmo de geração de escalas
│   └── supabase.ts       # Cliente Supabase
├── views/              # Telas da aplicação
│   ├── PeopleView.tsx
│   ├── RolesView.tsx
│   ├── ScheduleListView.tsx
│   ├── ScheduleCreateView.tsx
│   ├── ScheduleEditView.tsx
│   └── NotificationSettingsView.tsx
├── types.ts            # Tipos TypeScript globais
├── App.tsx             # Componente raiz e roteamento de views
└── index.html          # HTML de entrada
```

---

## 📄 Licença

Projeto de uso interno. Todos os direitos reservados.
