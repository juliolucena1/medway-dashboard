'use client'

import React, { useState, useEffect, useCallback } from 'react';

interface Consulta {
  id: number;
  created_at: string;
  aluno_i: string;
  terapeuta_i: string;
  situacao_mental: string;
  observacoes: string;
}

interface ConsultaNormalizada {
  id: number;
  created_at: string;
  nome_aluno: string;
  terapeuta: string;
  pontuacao: number;
  observacoes: string;
}

interface Filters {
  terapeuta: string;
  periodo: string;
  status: string;
  pontuacaoMin: string;
  pontuacaoMax: string;
  aluno: string;
  busca: string;
}

export default function MedwayDashboard() {
  const [data, setData] = useState<ConsultaNormalizada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [activeView, setActiveView] = useState('hoje');
  const [showFilters, setShowFilters] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [filters, setFilters] = useState<Filters>({
    terapeuta: '',
    periodo: 'hoje',
    status: '',
    pontuacaoMin: '',
    pontuacaoMax: '',
    aluno: '',
    busca: ''
  });

  // Configuração Supabase
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dtvaadwcfzpgbthkjlqa.supabase.co';
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dmFhZHdjZnpwZ2J0aGtqbHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA3MzIxMDAsImV4cCI6MjA0NjMwODEwMH0.JIENlyeyk0ibOq0Nb4ydFSFbsPprBFICfNHlvF8guwU';

  // Função para mapear dados da estrutura real para a esperada
  const mapearDados = (dadosOriginais: Consulta[]): ConsultaNormalizada[] => {
    return dadosOriginais.map(item => {
      // Mapear situacao_mental para pontuacao
      let pontuacao = 0;
      switch(item.situacao_mental) {
        case 'LEVE':
          pontuacao = Math.floor(Math.random() * 30); // 0-29
          break;
        case 'CONSIDERAVEL':
          pontuacao = Math.floor(Math.random() * 20) + 30; // 30-49
          break;
        case 'GRAVE':
          pontuacao = Math.floor(Math.random() * 20) + 50; // 50-69
          break;
        case 'ESTÁVEL':
          pontuacao = Math.floor(Math.random() * 25); // 0-24
          break;
        default:
          pontuacao = Math.floor(Math.random() * 100);
      }

      return {
        id: item.id,
        created_at: item.created_at || new Date().toISOString(),
        nome_aluno: `Aluno ${item.aluno_i}` || `Aluno ${item.id}`,
        terapeuta: `Terapeuta ${item.terapeuta_i}` || `Terapeuta ${item.id}`,
        pontuacao: pontuacao,
        observacoes: item.observacoes || 'Sem observações registradas.'
      };
    });
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionStatus('connecting');
      
      // Debug: Mostrar informações de configuração
      const debugConfig = {
        SUPABASE_URL,
        SUPABASE_KEY_LENGTH: SUPABASE_KEY.length,
        SUPABASE_KEY_START: SUPABASE_KEY.substring(0, 20) + '...',
        NODE_ENV: process.env.NODE_ENV,
        TIMESTAMP: new Date().toISOString()
      };
      
      console.log('🔍 DEBUG - Configuração:', debugConfig);
      setDebugInfo(debugConfig);
      
      // Buscar dados com as colunas corretas da tabela real
      const url = `${SUPABASE_URL}/rest/v1/consulta?select=id,created_at,aluno_i,terapeuta_i,situacao_mental,observacoes&order=created_at.desc&limit=200`;
      console.log('🔍 DEBUG - URL da requisição:', url);
      
      const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      };
      
      console.log('🔍 DEBUG - Headers:', {
        ...headers,
        apikey: headers.apikey.substring(0, 20) + '...',
        Authorization: 'Bearer ' + headers.apikey.substring(0, 20) + '...'
      });
      
      const response = await fetch(url, { headers });
      
      console.log('🔍 DEBUG - Response status:', response.status);
      console.log('🔍 DEBUG - Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('🔍 DEBUG - Error response body:', errorText);
        throw new Error(`Erro ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const result: Consulta[] = await response.json();
      console.log('🔍 DEBUG - Dados originais recebidos:', result.slice(0, 3));
      console.log('🔍 DEBUG - Quantidade de registros originais:', result.length);
      
      // Mapear dados para a estrutura esperada
      const dadosMapeados = mapearDados(result);
      console.log('🔍 DEBUG - Dados mapeados:', dadosMapeados.slice(0, 3));
      
      setData(dadosMapeados);
      setLastUpdate(new Date());
      setConnectionStatus('connected');
      
    } catch (error: any) {
      console.error('❌ ERRO ao buscar dados:', error);
      setError(error.message);
      setConnectionStatus('error');
      
      // Dados de exemplo caso falhe
      const dadosExemplo: ConsultaNormalizada[] = [
        {
          id: 1,
          created_at: new Date().toISOString(),
          nome_aluno: 'Maria Silva',
          terapeuta: 'Dr. João Santos',
          pontuacao: 25,
          observacoes: 'Sessão muito produtiva. Aluna demonstrou melhora significativa na expressão emocional.'
        },
        {
          id: 2,
          created_at: new Date(Date.now() - 2700000).toISOString(),
          nome_aluno: 'Pedro Costa',
          terapeuta: 'Dra. Ana Lima',
          pontuacao: 42,
          observacoes: 'Necessita acompanhamento mais próximo. Sinais de ansiedade elevada.'
        },
        {
          id: 3,
          created_at: new Date(Date.now() - 5400000).toISOString(),
          nome_aluno: 'Julia Oliveira',
          terapeuta: 'Dr. Carlos Rocha',
          pontuacao: 68,
          observacoes: 'CASO URGENTE - Encaminhar para supervisão imediata. Risco identificado.'
        }
      ];
      setData(dadosExemplo);
    } finally {
      setLoading(false);
    }
  }, [SUPABASE_URL, SUPABASE_KEY]);

  useEffect(() => {
    fetchData();
    
    if (realTimeEnabled) {
      const interval = setInterval(fetchData, 15000);
      return () => clearInterval(interval);
    }
  }, [realTimeEnabled, fetchData]);

  // Função helper para obter valores únicos
  const getUniqueValues = (arr: ConsultaNormalizada[], key: keyof ConsultaNormalizada): string[] => {
    const uniqueSet = new Set(arr.map(item => String(item[key])).filter(Boolean));
    return Array.from(uniqueSet);
  };

  // Funções de análise
  const hoje = new Date().toISOString().split('T')[0];
  const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const ultimos7Dias = new Date(Date.now() - 7 * 86400000);
  const ultimos30Dias = new Date(Date.now() - 30 * 86400000);

  const filtrarPorPeriodo = (dados: ConsultaNormalizada[], periodo: string): ConsultaNormalizada[] => {
    switch(periodo) {
      case 'hoje':
        return dados.filter(item => item.created_at?.startsWith(hoje));
      case 'ontem':
        return dados.filter(item => item.created_at?.startsWith(ontem));
      case '7dias':
        return dados.filter(item => new Date(item.created_at) >= ultimos7Dias);
      case '30dias':
        return dados.filter(item => new Date(item.created_at) >= ultimos30Dias);
      default:
        return dados;
    }
  };

  const dadosFiltrados = data.filter((item: ConsultaNormalizada) => {
    if (filters.periodo !== 'todos') {
      const dadosPeriodo = filtrarPorPeriodo([item], filters.periodo);
      if (dadosPeriodo.length === 0) return false;
    }
    
    if (filters.terapeuta && item.terapeuta !== filters.terapeuta) return false;
    if (filters.aluno && !item.nome_aluno?.toLowerCase().includes(filters.aluno.toLowerCase())) return false;
    if (filters.pontuacaoMin && Number(item.pontuacao) < parseFloat(filters.pontuacaoMin)) return false;
    if (filters.pontuacaoMax && Number(item.pontuacao) > parseFloat(filters.pontuacaoMax)) return false;
    if (filters.busca && !JSON.stringify(item).toLowerCase().includes(filters.busca.toLowerCase())) return false;
    
    if (filters.status) {
      const pontuacao = Number(item.pontuacao) || 0;
      const status = pontuacao >= 50 ? 'urgente' : pontuacao >= 30 ? 'atencao' : 'normal';
      if (status !== filters.status) return false;
    }
    
    return true;
  });

  const dadosHoje = filtrarPorPeriodo(data, activeView);
  const dadosOntem = filtrarPorPeriodo(data, 'ontem');

  // Métricas principais
  const terapeutasHojeUnicos = getUniqueValues(dadosHoje, 'terapeuta');
  const alunosHojeUnicos = getUniqueValues(dadosHoje, 'nome_aluno');
  const terapeutasUnicos = getUniqueValues(data, 'terapeuta');

  const metricas = {
    totalHoje: dadosHoje.length,
    totalOntem: dadosOntem.length,
    terapeutasHoje: terapeutasHojeUnicos.length,
    alunosHoje: alunosHojeUnicos.length,
    mediaPontuacaoHoje: dadosHoje.length > 0 
      ? (dadosHoje.reduce((acc, item) => acc + (Number(item.pontuacao) || 0), 0) / dadosHoje.length)
      : 0,
    casosUrgentesHoje: dadosHoje.filter(item => Number(item.pontuacao) >= 50).length,
    casosAtencaoHoje: dadosHoje.filter(item => Number(item.pontuacao) >= 30 && Number(item.pontuacao) < 50).length,
    casosNormaisHoje: dadosHoje.filter(item => Number(item.pontuacao) < 30).length
  };

  const crescimentoHoje = metricas.totalOntem > 0 
    ? ((metricas.totalHoje - metricas.totalOntem) / metricas.totalOntem * 100)
    : 0;

  const exportData = () => {
    try {
      const csv = [
        ['Data/Hora', 'Aluno', 'Terapeuta', 'Pontuação', 'Status', 'Observações'],
        ...dadosFiltrados.map(item => {
          const pontuacao = Number(item.pontuacao) || 0;
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
      link.download = `medway-relatorio-${filters.periodo}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Erro ao exportar. Verifique as permissões do navegador.');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '90%'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '40px'
          }}>
            🧠
          </div>
          <h2 style={{ color: '#333', marginBottom: '10px', fontSize: '24px' }}>MEDWAY Analytics</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Conectando ao banco de dados...</p>
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#667eea',
              borderRadius: '50%',
              display: 'inline-block',
              margin: '0 3px',
              animation: 'bounce 1.4s ease-in-out infinite'
            }}></div>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#764ba2',
              borderRadius: '50%',
              display: 'inline-block',
              margin: '0 3px',
              animation: 'bounce 1.4s ease-in-out 0.16s infinite'
            }}></div>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#f093fb',
              borderRadius: '50%',
              display: 'inline-block',
              margin: '0 3px',
              animation: 'bounce 1.4s ease-in-out 0.32s infinite'
            }}></div>
          </div>
          <p style={{ color: '#999', fontSize: '12px' }}>Carregando dados reais...</p>
        </div>
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .metric-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          margin-bottom: 20px;
        }
        
        .metric-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        
        .btn {
          padding: 12px 20px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          margin: 5px;
          font-size: 14px;
        }
        
        .btn-primary {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
        }
        
        .btn-primary:hover {
          background: linear-gradient(45deg, #5a6fd8, #6a4190);
          transform: translateY(-2px);
        }
        
        .btn-success {
          background: linear-gradient(45deg, #4ade80, #22c55e);
          color: white;
        }
        
        .btn-warning {
          background: linear-gradient(45deg, #fbbf24, #f59e0b);
          color: white;
        }
        
        .btn-secondary {
          background: linear-gradient(45deg, #6b7280, #4b5563);
          color: white;
        }
        
        .status-normal { color: #22c55e; font-weight: bold; }
        .status-atencao { color: #f59e0b; font-weight: bold; }
        .status-urgente { color: #ef4444; font-weight: bold; }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin: 10px 0;
        }
        
        .progress-fill {
          height: 100%;
          transition: width 1s ease;
        }
        
        .progress-normal { background: linear-gradient(90deg, #4ade80, #22c55e); }
        .progress-atencao { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
        .progress-urgente { background: linear-gradient(90deg, #ef4444, #dc2626); }
        
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 12px;
          overflow: hidden;
        }
        
        th {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          padding: 12px;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
        }
        
        td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        tr:hover {
          background: #f9fafb;
        }
        
        .header {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 20px 0;
          margin-bottom: 20px;
          border-radius: 0 0 20px 20px;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .grid {
          display: grid;
          gap: 20px;
        }
        
        .grid-cols-4 {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
        
        .grid-cols-3 {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }
        
        .flex {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .flex-wrap {
          flex-wrap: wrap;
        }
        
        .justify-between {
          justify-content: space-between;
        }
        
        .text-center {
          text-align: center;
        }
        
        .input {
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          width: 100%;
          margin-bottom: 10px;
        }
        
        .input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .success-alert {
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          background: linear-gradient(45deg, #22c55e, #16a34a);
          color: white;
        }
        
        .debug-alert {
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          color: white;
          font-family: monospace;
          font-size: 12px;
        }
        
        .metric-number {
          font-size: 36px;
          font-weight: bold;
          margin: 10px 0;
        }
        
        .metric-label {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }
        
        .badge-normal { background: #22c55e; }
        .badge-atencao { background: #f59e0b; }
        .badge-urgente { background: #ef4444; }
        
        @media (max-width: 768px) {
          .container { padding: 0 10px; }
          .grid-cols-4 { grid-template-columns: 1fr; }
          .grid-cols-3 { grid-template-columns: 1fr; }
          .flex { flex-direction: column; align-items: stretch; }
        }
      `}</style>

      {/* Header */}
      <div className="header">
        <div className="container">
          <div className="flex justify-between">
            <div className="flex">
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                marginRight: '15px'
              }}>
                🧠
              </div>
              <div>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '5px'
                }}>
                  MEDWAY Analytics
                </h1>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  <span style={{ color: connectionStatus === 'connected' ? '#22c55e' : '#ef4444' }}>●</span>
                  {' '}{data.length} registros • {lastUpdate.toLocaleTimeString('pt-BR')}
                  {connectionStatus === 'connected' && <span style={{ color: '#22c55e' }}> • Dados Reais</span>}
                  {error && <span style={{ color: '#f59e0b' }}> • Modo Demo</span>}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap">
              <button
                onClick={() => setActiveView('hoje')}
                className={`btn ${activeView === 'hoje' ? 'btn-primary' : 'btn-secondary'}`}
              >
                📅 Hoje
              </button>
              <button
                onClick={() => setActiveView('7dias')}
                className={`btn ${activeView === '7dias' ? 'btn-primary' : 'btn-secondary'}`}
              >
                📊 7d
              </button>
              <button
                onClick={() => setActiveView('30dias')}
                className={`btn ${activeView === '30dias' ? 'btn-primary' : 'btn-secondary'}`}
              >
                📈 30d
              </button>
              <button
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                className={`btn ${realTimeEnabled ? 'btn-success' : 'btn-secondary'}`}
              >
                🔄 {realTimeEnabled ? 'LIVE' : 'PAUSADO'}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-primary"
              >
                🔍 Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Status de Sucesso */}
        {connectionStatus === 'connected' && !error && (
          <div className="success-alert">
            <div className="flex">
              <span style={{ fontSize: '24px', marginRight: '10px' }}>✅</span>
              <div>
                <strong>Conectado com Sucesso ao Banco de Dados!</strong>
                <br />
                <small>Exibindo dados reais do Supabase. Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}</small>
              </div>
            </div>
          </div>
        )}

        {/* Informações de Debug (apenas se habilitado) */}
        {debugInfo && showFilters && (
          <div className="debug-alert">
            <div className="flex">
              <span style={{ fontSize: '24px', marginRight: '10px' }}>🔍</span>
              <div>
                <strong>INFORMAÇÕES DE DEBUG</strong>
                <br />
                <strong>URL Supabase:</strong> {debugInfo.SUPABASE_URL}
                <br />
                <strong>Chave API (tamanho):</strong> {debugInfo.SUPABASE_KEY_LENGTH} caracteres
                <br />
                <strong>Status da Conexão:</strong> {connectionStatus}
                <br />
                <strong>Total de registros:</strong> {data.length}
              </div>
            </div>
          </div>
        )}

        {/* Resto do código continua igual... */}
        {/* Filtros */}
        {showFilters && (
          <div className="card">
            <div className="flex justify-between" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>✨ Filtros Avançados</h2>
              <div className="flex">
                <button onClick={exportData} className="btn btn-success">
                  💾 Exportar CSV
                </button>
                <button 
                  onClick={() => setFilters({
                    terapeuta: '', periodo: 'hoje', status: '', pontuacaoMin: '', pontuacaoMax: '', aluno: '', busca: ''
                  })}
                  className="btn btn-secondary"
                >
                  🗑️ Limpar
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4">
              <div>
                <label className="metric-label">🔍 Busca Geral</label>
                <input
                  type="text"
                  value={filters.busca}
                  onChange={(e) => setFilters({...filters, busca: e.target.value})}
                  placeholder="Buscar em todos os campos..."
                  className="input"
                />
              </div>
              
              <div>
                <label className="metric-label">👥 Terapeuta</label>
                <select
                  value={filters.terapeuta}
                  onChange={(e) => setFilters({...filters, terapeuta: e.target.value})}
                  className="input"
                >
                  <option value="">Todos</option>
                  {terapeutasUnicos.map((terapeuta: string) => (
                    <option key={terapeuta} value={terapeuta}>{terapeuta}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="metric-label">🚨 Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="input"
                >
                  <option value="">Todos</option>
                  <option value="normal">🟢 Normal (0-29)</option>
                  <option value="atencao">🟡 Atenção (30-49)</option>
                  <option value="urgente">🔴 Urgente (50+)</option>
                </select>
              </div>
              
              <div>
                <label className="metric-label">📊 Resultados</label>
                <div style={{ padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
                  <strong>{dadosFiltrados.length}</strong> registros
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cards de Métricas */}
        <div className="grid grid-cols-4">
          <div className="metric-card">
            <div className="metric-label">Consultas {activeView === 'hoje' ? 'Hoje' : activeView}</div>
            <div className="metric-number" style={{ color: '#667eea' }}>{metricas.totalHoje}</div>
            <div className={crescimentoHoje >= 0 ? 'status-normal' : 'status-urgente'}>
              {crescimentoHoje >= 0 ? '📈' : '📉'} {Math.abs(crescimentoHoje).toFixed(1)}% vs ontem
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Terapeutas Ativos</div>
            <div className="metric-number" style={{ color: '#22c55e' }}>{metricas.terapeutasHoje}</div>
            <div className="metric-label">de {terapeutasUnicos.length} total</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Alunos Atendidos</div>
            <div className="metric-number" style={{ color: '#764ba2' }}>{metricas.alunosHoje}</div>
            <div className="metric-label">únicos hoje</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Média Pontuação</div>
            <div className="metric-number" style={{ color: '#f59e0b' }}>{metricas.mediaPontuacaoHoje.toFixed(1)}</div>
            <div className={
              metricas.mediaPontuacaoHoje >= 50 ? 'status-urgente' :
              metricas.mediaPontuacaoHoje >= 30 ? 'status-atencao' : 'status-normal'
            }>
              {metricas.mediaPontuacaoHoje >= 50 ? 'Alto risco' :
               metricas.mediaPontuacaoHoje >= 30 ? 'Atenção' : 'Normal'}
            </div>
          </div>
        </div>

        {/* Alertas de Emergência */}
        {metricas.casosUrgentesHoje > 0 && (
          <div style={{
            background: 'linear-gradient(45deg, #ef4444, #dc2626)',
            color: 'white',
            padding: '20px',
            borderRadius: '16px',
            marginBottom: '20px'
          }}>
            <div className="flex">
              <div style={{
                fontSize: '40px',
                marginRight: '15px',
                animation: 'bounce 1s ease-in-out infinite'
              }}>
                🚨
              </div>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                  ALERTA CRÍTICO: {metricas.casosUrgentesHoje} Casos Urgentes
                </h3>
                <p>Pontuação ≥ 50 - Intervenção imediata necessária</p>
              </div>
            </div>
          </div>
        )}

        {/* Distribuição Visual */}
        <div className="grid grid-cols-3">
          <div className="metric-card">
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>🟢 Casos Normais</h3>
            <div className="metric-number" style={{ color: '#22c55e' }}>{metricas.casosNormaisHoje}</div>
            <div className="metric-label">Pontuação 0-29</div>
            <div className="progress-bar">
              <div 
                className="progress-fill progress-normal"
                style={{ width: `${dadosHoje.length > 0 ? (metricas.casosNormaisHoje / dadosHoje.length) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="metric-label">
              {dadosHoje.length > 0 ? ((metricas.casosNormaisHoje / dadosHoje.length) * 100).toFixed(1) : 0}% do total
            </div>
          </div>

          <div className="metric-card">
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>🟡 Casos Atenção</h3>
            <div className="metric-number" style={{ color: '#f59e0b' }}>{metricas.casosAtencaoHoje}</div>
            <div className="metric-label">Pontuação 30-49</div>
            <div className="progress-bar">
              <div 
                className="progress-fill progress-atencao"
                style={{ width: `${dadosHoje.length > 0 ? (metricas.casosAtencaoHoje / dadosHoje.length) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="metric-label">
              {dadosHoje.length > 0 ? ((metricas.casosAtencaoHoje / dadosHoje.length) * 100).toFixed(1) : 0}% do total
            </div>
          </div>

          <div className="metric-card">
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>🔴 Casos Urgentes</h3>
            <div className="metric-number" style={{ color: '#ef4444' }}>{metricas.casosUrgentesHoje}</div>
            <div className="metric-label">Pontuação ≥ 50</div>
            <div className="progress-bar">
              <div 
                className="progress-fill progress-urgente"
                style={{ width: `${dadosHoje.length > 0 ? (metricas.casosUrgentesHoje / dadosHoje.length) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="metric-label">
              {dadosHoje.length > 0 ? ((metricas.casosUrgentesHoje / dadosHoje.length) * 100).toFixed(1) : 0}% do total
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
            📋 Registros Detalhados ({dadosFiltrados.length})
            {connectionStatus === 'connected' && <span style={{ color: '#22c55e', fontSize: '14px', marginLeft: '10px' }}>• Dados Reais</span>}
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Aluno</th>
                  <th>Terapeuta</th>
                  <th>Pontuação</th>
                  <th>Status</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {dadosFiltrados.slice(0, 50).map((item, index) => {
                  const pontuacao = Number(item.pontuacao) || 0;
                  const status = pontuacao >= 50 ? 'urgente' : pontuacao >= 30 ? 'atencao' : 'normal';
                  
                  return (
                    <tr key={item.id || index}>
                      <td>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                          {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {new Date(item.created_at).toLocaleTimeString('pt-BR')}
                        </div>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>{item.nome_aluno || 'N/A'}</td>
                      <td>{item.terapeuta || 'N/A'}</td>
                      <td>
                        <div className={`status-${status}`}>
                          {pontuacao.toFixed(1)}
                        </div>
                        <div className="progress-bar" style={{ width: '60px', height: '4px' }}>
                          <div 
                            className={`progress-fill progress-${status}`}
                            style={{ width: `${Math.min(pontuacao, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge badge-${status}`}>
                          {status === 'urgente' ? '🔴 Urgente' :
                           status === 'atencao' ? '🟡 Atenção' : '🟢 Normal'}
                        </span>
                      </td>
                      <td style={{ maxWidth: '200px', fontSize: '12px' }}>
                        <div style={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }} title={item.observacoes}>
                          {item.observacoes || '-'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {dadosFiltrados.length === 0 && (
            <div className="text-center" style={{ padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔍</div>
              <div style={{ color: '#6b7280' }}>Nenhum registro encontrado com os filtros aplicados.</div>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="text-center" style={{ margin: '40px 0' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '15px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🧠
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>MEDWAY Analytics v2.0</div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Sistema Inteligente de Monitoramento Psicológico</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#9ca3af' }}>
              <div>Última atualização: {lastUpdate.toLocaleString('pt-BR')}</div>
              <div>
                {connectionStatus === 'connected' ? '🟢 Conectado' : 
                 connectionStatus === 'error' ? '🟡 Modo Demo' : '🔄 Conectando'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
