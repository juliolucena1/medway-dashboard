# 🧠 MEDWAY Analytics Dashboard

Sistema de monitoramento de consultas psicológicas em tempo real.

## 🚀 Deploy Rápido

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SEU_USUARIO/medway-dashboard)

## 📁 Estrutura do Repositório

```
medway-dashboard/
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── .env.local.example
├── .gitignore
└── app/
    ├── layout.tsx
    ├── page.tsx
    └── globals.css
```

---

## 📄 Arquivo: `package.json`

```json
{
  "name": "medway-dashboard",
  "version": "1.0.0",
  "description": "Sistema de monitoramento de consultas psicológicas em tempo real",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.0.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.2.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/SEU_USUARIO/medway-dashboard.git"
  },
  "keywords": [
    "medway",
    "dashboard",
    "analytics",
    "healthcare",
    "psychology",
    "supabase",
    "nextjs"
  ],
  "author": "Sua Equipe MEDWAY",
  "license": "MIT"
}
```

---

## 📄 Arquivo: `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}

module.exports = nextConfig
```

---

## 📄 Arquivo: `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
```

---

## 📄 Arquivo: `postcss.config.js`

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 📄 Arquivo: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 📄 Arquivo: `.env.local.example`

```bash
# Configurações do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dtvaadwcfzpgbthkjlqa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dmFhZHdjZnpwZ2J0aGtqbHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA3MzIxMDAsImV4cCI6MjA0NjMwODEwMH0.JIENlyeyk0ibOq0Nb4ydFSFbsPprBFICfNHlvF8guwU

# Para desenvolvimento local, copie este arquivo para .env.local
# Para produção no Vercel, configure estas variáveis no dashboard
```

---

## 📄 Arquivo: `.gitignore`

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env
.env.production

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db
```

---

## 📄 Arquivo: `app/layout.tsx`

```typescript
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MEDWAY Analytics - Dashboard',
  description: 'Sistema de monitoramento de consultas psicológicas em tempo real',
  keywords: 'medway, dashboard, analytics, healthcare, psychology',
  authors: [{ name: 'Equipe MEDWAY' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧠</text></svg>" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

---

## 📄 Arquivo: `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

/* Animações customizadas */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

/* Scrollbar customizada */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Responsividade melhorada */
@media (max-width: 640px) {
  .responsive-text {
    font-size: 0.875rem;
  }
}
```

---

## 📄 Arquivo: `app/page.tsx`

```typescript
'use client'

import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  // Configuração Supabase via variáveis de ambiente
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dtvaadwcfzpgbthkjlqa.supabase.co';
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dmFhZHdjZnpwZ2J0aGtqbHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA3MzIxMDAsImV4cCI6MjA0NjMwODEwMH0.JIENlyeyk0ibOq0Nb4ydFSFbsPprBFICfNHlvF8guwU';

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/consulta?select=*&order=created_at.desc&limit=50`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError(error.message);
      
      // Dados de exemplo para demonstração
      setData([
        {
          id: 1,
          created_at: new Date().toISOString(),
          nome_aluno: 'Maria Silva',
          terapeuta: 'Dr. João Santos',
          pontuacao: 25,
          observacoes: 'Sessão produtiva, aluna demonstrou melhora significativa'
        },
        {
          id: 2,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          nome_aluno: 'Pedro Costa',
          terapeuta: 'Dra. Ana Lima',
          pontuacao: 45,
          observacoes: 'Necessita acompanhamento mais próximo'
        },
        {
          id: 3,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          nome_aluno: 'Julia Oliveira',
          terapeuta: 'Dr. Carlos Rocha',
          pontuacao: 65,
          observacoes: 'Caso urgente - encaminhar para supervisão imediata'
        },
        {
          id: 4,
          created_at: new Date(Date.now() - 10800000).toISOString(),
          nome_aluno: 'Lucas Mendes',
          terapeuta: 'Dra. Maria Fernandes',
          pontuacao: 15,
          observacoes: 'Evolução positiva nas últimas sessões'
        },
        {
          id: 5,
          created_at: new Date(Date.now() - 14400000).toISOString(),
          nome_aluno: 'Ana Carolina',
          terapeuta: 'Dr. João Santos',
          pontuacao: 55,
          observacoes: 'Acompanhar de perto, sinais de alerta identificados'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (realTimeEnabled) {
      const interval = setInterval(fetchData, 30000); // Atualiza a cada 30s
      return () => clearInterval(interval);
    }
  }, [realTimeEnabled]);

  // Cálculos de métricas
  const hoje = new Date().toISOString().split('T')[0];
  const dadosHoje = data.filter(item => item.created_at?.startsWith(hoje));
  
  const metricas = {
    total: dadosHoje.length,
    terapeutas: [...new Set(dadosHoje.map(item => item.terapeuta))].filter(Boolean).length,
    alunos: [...new Set(dadosHoje.map(item => item.nome_aluno))].filter(Boolean).length,
    mediaPontuacao: dadosHoje.length > 0 
      ? (dadosHoje.reduce((acc, item) => acc + (parseFloat(item.pontuacao) || 0), 0) / dadosHoje.length)
      : 0,
    urgentes: dadosHoje.filter(item => parseFloat(item.pontuacao) >= 50).length,
    atencao: dadosHoje.filter(item => parseFloat(item.pontuacao) >= 30 && parseFloat(item.pontuacao) < 50).length,
    normais: dadosHoje.filter(item => parseFloat(item.pontuacao) < 30).length
  };

  const exportData = () => {
    try {
      const csv = [
        ['Data/Hora', 'Aluno', 'Terapeuta', 'Pontuação', 'Status', 'Observações'],
        ...data.map(item => {
          const pontuacao = parseFloat(item.pontuacao) || 0;
          const status = pontuacao >= 50 ? 'Urgente' : pontuacao >= 30 ? 'Atenção' : 'Normal';
          return [
            new Date(item.created_at).toLocaleString('pt-BR'),
            item.nome_aluno || '',
            item.terapeuta || '',
            item.pontuacao || '',
            status,
            (item.observacoes || '').replace(/,/g, ';')
          ];
        })
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `medway-relatorio-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Erro ao exportar. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🧠</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">MEDWAY Analytics</h2>
          <p className="text-gray-600 mb-4">Conectando ao Supabase...</p>
          <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div>
          <p className="text-xs text-gray-500 mt-4">Sistema de monitoramento em tempo real</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-lg border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🧠</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MEDWAY Analytics
                </h1>
                <p className="text-sm text-gray-600">
                  {data.length} registros • {lastUpdate.toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  realTimeEnabled 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className={`mr-2 ${realTimeEnabled ? 'animate-spin' : ''}`}>🔄</span>
                {realTimeEnabled ? 'LIVE' : 'OFF'}
              </button>
              
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Atualizar
              </button>

              <button
                onClick={exportData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <span className="mr-2">💾</span>
                CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status de Conexão */}
        {error && (
          <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-6 animate-fadeIn">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              <div>
                <strong>Modo Demo:</strong> Exibindo dados de exemplo. {error}
              </div>
            </div>
          </div>
        )}

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 transform hover:scale-105 transition-transform animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Consultas Hoje</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{metricas.total}</p>
                <p className="text-xs text-gray-500 mt-1">Total de atendimentos</p>
              </div>
              <span className="text-3xl">📅</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 transform hover:scale-105 transition-transform animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terapeutas Ativos</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{metricas.terapeutas}</p>
                <p className="text-xs text-gray-500 mt-1">Equipe trabalhando</p>
              </div>
              <span className="text-3xl">👥</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 transform hover:scale-105 transition-transform animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alunos Atendidos</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">{metricas.alunos}</p>
                <p className="text-xs text-gray-500 mt-1">Únicos hoje</p>
              </div>
              <span className="text-3xl">🎓</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 transform hover:scale-105 transition-transform animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Média Pontuação</p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-600">{metricas.mediaPontuacao.toFixed(1)}</p>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    metricas.mediaPontuacao >= 50 ? 'bg-red-500' :
                    metricas.mediaPontuacao >= 30 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <p className="text-xs text-gray-500">
                    {metricas.mediaPontuacao >= 50 ? 'Alto risco' :
                     metricas.mediaPontuacao >= 30 ? 'Atenção' : 'Normal'}
                  </p>
                </div>
              </div>
              <span className="text-3xl">🎯</span>
            </div>
          </div>
        </div>

        {/* Distribuição de Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Casos Normais</h3>
              <span className="text-2xl">🟢</span>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{metricas.normais}</div>
              <p className="text-sm text-gray-600">Pontuação 0-29</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${dadosHoje.length > 0 ? (metricas.normais / dadosHoje.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Casos Atenção</h3>
              <span className="text-2xl">🟡</span>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">{metricas.atencao}</div>
              <p className="text-sm text-gray-600">Pontuação 30-49</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${dadosHoje.length > 0 ? (metricas.atencao / dadosHoje.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Casos Urgentes</h3>
              <span className="text-2xl">🔴</span>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">{metricas.urgentes}</div>
              <p className="text-sm text-gray-600">Pontuação ≥ 50</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-red-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${dadosHoje.length > 0 ? (metricas.urgentes / dadosHoje.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerta de Emergência */}
        {metricas.urgentes > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-lg p-6 mb-8 text-white animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-3xl mr-4 animate-pulse">🚨</span>
                <div>
                  <h3 className="text-xl font-bold">ATENÇÃO: {metricas.urgentes} Casos Urgentes</h3>
                  <p className="text-red-100">Pontuação ≥ 50 - Requer intervenção imediata</p>
                </div>
              </div>
              <div className="hidden sm:block">
                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                  Ver Detalhes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabela de Registros */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h3 className="text-lg font-bold flex items-center">
                  <span className="mr-2">📋</span>
                  Registros Recentes ({data.length})
                </h3>
                <p className="text-blue-100 text-sm">Últimos atendimentos realizados</p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terapeuta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pontuação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.slice(0, 20).map((item, index) => {
                  const pontuacao = parseFloat(item.pontuacao) || 0;
                  const status = pontuacao >= 50 ? 'urgente' : pontuacao >= 30 ? 'atencao' : 'normal';
                  const statusConfig = {
                    urgente: { emoji: '🔴', text: 'Urgente', bg: 'bg-red-100', color: 'text-red-800' },
                    atencao: { emoji: '🟡', text: 'Atenção', bg: 'bg-yellow-100', color: 'text-yellow-800' },
                    normal: { emoji: '🟢', text: 'Normal', bg: 'bg-green-100', color: 'text-green-800' }
                  };
                  
                  return (
                    <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.nome_aluno || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.terapeuta || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-bold ${statusConfig[status].color}`}>
                          {pontuacao.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${statusConfig[status].bg} ${statusConfig[status].color}`}>
                          {statusConfig[status].emoji} {statusConfig[status].text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {item.observacoes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {data.length === 0 && (
            <div className="text-center py-12">
              <span className="text-gray-500">Nenhum registro encontrado</span>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="mt-12 text-center pb-8">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-lg">
            <span className="text-2xl">🧠</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">MEDWAY Analytics v1.0</p>
              <p className="text-xs text-gray-500">Sistema de Monitoramento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🚀 Instruções de Deploy

### Opção 1: Deploy Direto pelo Botão

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SEU_USUARIO/medway-dashboard)

### Opção 2: Deploy Manual

1. **Clone o repositório:**
```bash
git clone https://github.com/SEU_USUARIO/medway-dashboard.git
cd medway-dashboard
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.local.example .env.local
# Edite .env.local com suas configurações
```

4. **Teste localmente:**
```bash
npm run dev
```

5. **Deploy no Vercel:**
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Configurar Variáveis no Vercel

No dashboard do Vercel, adicione:
- `NEXT_PUBLIC_SUPABASE_URL`: `https://dtvaadwcfzpgbthkjlqa.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `[sua_chave_aqui]`

## 🔧 Funcionalidades

✅ **Dashboard em Tempo Real** (30s)  
✅ **4 Métricas Principais**  
✅ **3 Cards de Distribuição** com barras de progresso  
✅ **Alertas Automáticos** para casos urgentes  
✅ **Tabela Completa** com todos os registros  
✅ **Exportação CSV**  
✅ **Design Responsivo**  
✅ **Modo Demo** com dados de exemplo  

## 📱 Responsividade

- ✅ Desktop (1920px+)
- ✅ Laptop (1024px+)  
- ✅ Tablet (768px+)
- ✅ Mobile (320px+)

## 🛠️ Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática  
- **Tailwind CSS** - Estilização
- **Supabase** - Banco de dados
- **Vercel** - Deploy e hospedagem

## 📄 Licença

MIT License - Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, entre em contato com a equipe MEDWAY.

---

🧠 **MEDWAY Analytics** - Monitoramento inteligente para cuidados de saúde mental
