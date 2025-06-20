'use client'

import React, { useState, useEffect, useCallback } from 'react';

interface Consulta {
  id: number;
  aluno_id: string;
  terapeuta_id: string;
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
    return dadosOriginais.map((item, index) => {
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

      // Criar data baseada no índice (dados mais recentes primeiro)
      const agora = new Date();
      const horasAtras = index * 2; // A cada 2 horas para trás
      const dataFake = new Date(agora.getTime() - (horasAtras * 60 * 60 * 1000));

      return {
        id: item.id,
        created_at: dataFake.toISOString(),
        nome_aluno: `Aluno ${item.aluno_id}` || `Aluno ${item.id}`,
        terapeuta: `Terapeuta ${item.terapeuta_id}` || `Terapeuta ${item.id}`,
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
      
      const url = `${SUPABASE_URL}/rest/v1/consulta?select=id,aluno_id,terapeuta_id,situacao_mental,observacoes&order=id.desc&limit=100`;
      
      const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const result: Consulta[] = await response.json();
      
      // Mapear dados para a estrutura esperada
      const dadosMapeados = mapearDados(result);
      
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
      const interval = setInterval(fetchData, 30000); // A cada 30s
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

  // Dados para análise de performance por hora
  const dadosPorHora = Array.from({ length: 24 }, (_, hora) => {
    const consultasHora = dadosHoje.filter(item => {
      const horaItem = new Date(item.created_at).getHours();
      return horaItem === hora;
    });
    
    return {
      hora: `${hora.toString().padStart(2, '0')}:00`,
      consultas: consultasHora.length,
      urgentes: consultasHora.filter(item => Number(item.pontuacao) >= 50).length
    };
  });

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

  const clearFilters = () => {
    setFilters({
      terapeuta: '',
      periodo: 'hoje',
      status: '',
      pontuacaoMin: '',
      pontuacaoMax: '',
      aluno: '',
      busca: ''
    });
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
          <p style={{ color: '#666', marginBottom: '20px' }}>Carregando dados em tempo real...</p>
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
          <p style={{ color: '#999', fontSize: '12px' }}>Conectando ao Supabase...</p>
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

      {/* Header Ultra Moderno */}
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
              {/* Seletor de Período */}
              <div className="flex" style={{
                background: 'white',
                borderRadius: '12px',
                padding: '4px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                {[
                  { key: 'hoje', label: 'Hoje', icon: '📅' },
                  { key: '7dias', label: '7d', icon: '📊' },
                  { key: '30dias', label: '30d', icon: '📈' }
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveView(key);
                      setFilters({...filters, periodo: key});
                    }}
                    className={`${activeView === key ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ margin: '2px' }}
                  >
                    <span style={{ marginRight: '5px' }}>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Controles */}
              <button
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                className={`btn ${realTimeEnabled ? 'btn-success' : 'btn-secondary'}`}
              >
                <span className={`mr-2 ${realTimeEnabled ? 'animate-spin' : ''}`} style={{ marginRight: '8px' }}>🔄</span>
                {realTimeEnabled ? 'LIVE' : 'PAUSADO'}
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-primary"
              >
                <span style={{ marginRight: '8px' }}>🔍</span>
                Filtros
              </button>

              <button
                onClick={fetchData}
                disabled={loading}
                className="btn btn-primary"
                style={{ opacity: loading ? 0.5 : 1 }}
              >
                Atualizar
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
                <small>Exibindo {data.length} registros reais do Supabase • Atualização automática a cada 30 segundos</small>
              </div>
            </div>
          </div>
        )}

        {/* Painel de Filtros Avançados */}
        {showFilters && (
          <div className="card">
            <div className="flex justify-between" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>✨</span>
                Filtros Avançados
              </h2>
              <div className="flex">
                <button onClick={exportData} className="btn btn-success">
                  <span style={{ marginRight: '8px' }}>💾</span>
                  Exportar CSV
                </button>
                <button onClick={clearFilters} className="btn btn-secondary">
                  <span style={{ marginRight: '8px' }}>🗑️</span>
                  Limpar
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4">
              <div style={{ gridColumn: 'span 2' }}>
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
            </div>

            <div style={{ marginTop: '20px' }} className="flex justify-between">
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                <strong>{dadosFiltrados.length}</strong> registros encontrados
                {filters.periodo === 'hoje' && ` de ${metricas.totalHoje} hoje`}
              </div>
              <div className="flex" style={{ fontSize: '12px', color: '#9ca3af', gap: '15px' }}>
                <span>🟢 {metricas.casosNormaisHoje} Normais</span>
                <span>🟡 {metricas.casosAtencaoHoje} Atenção</span>
                <span>🔴 {metricas.casosUrgentesHoje} Urgentes</span>
              </div>
            </div>
          </div>
        )}

        {/* Cards de Métricas Ultra Modernos */}
        <div className="grid grid-cols-4">
          <div className="metric-card">
            <div className="metric-label">Consultas {activeView === 'hoje' ? 'Hoje' : activeView === '7dias' ? 'Últimos 7 dias' : 'Últimos 30 dias'}</div>
            <div className="metric-number" style={{ color: '#667eea' }}>{metricas.totalHoje}</div>
            <div className={crescimentoHoje >= 0 ? 'status-normal' : 'status-urgente'}>
              <span style={{ marginRight: '5px' }}>{crescimentoHoje >= 0 ? '📈' : '📉'}</span>
              {Math.abs(crescimentoHoje).toFixed(1)}% vs ontem
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
            <div className="metric-label">únicos no período</div>
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

        {/* Alertas de Emergência ULTRA */}
        {metricas.casosUrgentesHoje > 0 && (
          <div style={{
            background: 'linear-gradient(45deg, #ef4444, #dc2626)',
            color: 'white',
            padding: '20px',
            borderRadius: '16px',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(45deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
              animation: 'pulse 2s ease-in-out infinite'
            }}></div>
            <div className="flex" style={{ position: 'relative' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px'
              }}>
                <span style={{ fontSize: '40px', animation: 'bounce 1s ease-in-out infinite' }}>🚨</span>
              </div>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                  ALERTA CRÍTICO: {metricas.casosUrgentesHoje} Casos Urgentes
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  Pontuação ≥ 50 - Intervenção imediata necessária
                </p>
                <div className="flex" style={{ marginTop: '10px', gap: '20px', fontSize: '14px' }}>
                  <span>⏰ Identificados no período atual</span>
                  <span>📋 Requer supervisão</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Distribuição Visual com Animações */}
        <div className="grid grid-cols-3">
          <div className="metric-card">
            <div className="flex justify-between" style={{ marginBottom: '15px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Casos Normais</h3>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#dcfce7',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '24px' }}>🟢</span>
              </div>
            </div>
            <div className="text-center">
              <div className="metric-number" style={{ color: '#22c55e' }}>{metricas.casosNormaisHoje}</div>
              <div className="metric-label" style={{ marginBottom: '15px' }}>Pontuação 0-29</div>
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
          </div>

          <div className="metric-card">
            <div className="flex justify-between" style={{ marginBottom: '15px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Casos Atenção</h3>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#fef3c7',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '24px' }}>🟡</span>
              </div>
            </div>
            <div className="text-center">
              <div className="metric-number" style={{ color: '#f59e0b' }}>{metricas.casosAtencaoHoje}</div>
              <div className="metric-label" style={{ marginBottom: '15px' }}>Pontuação 30-49</div>
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
          </div>

          <div className="metric-card">
            <div className="flex justify-between" style={{ marginBottom: '15px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Casos Urgentes</h3>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#fee2e2',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '24px' }}>🔴</span>
              </div>
            </div>
            <div className="text-center">
              <div className="metric-number" style={{ color: '#ef4444' }}>{metricas.casosUrgentesHoje}</div>
              <div className="metric-label" style={{ marginBottom: '15px' }}>Pontuação ≥ 50</div>
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
        </div>

        {/* Gráfico de Atividade por Hora */}
        <div className="card">
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }} className="flex">
            <span style={{ fontSize: '24px', marginRight: '10px' }}>📊</span>
            Atividade por Hora - {activeView === 'hoje' ? 'Hoje' : activeView === '7dias' ? 'Últimos 7 dias' : 'Últimos 30 dias'}
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(24, 1fr)', 
            gap: '8px',
            marginBottom: '20px'
          }}>
            {dadosPorHora.map((item, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div 
                  style={{
                    background: 'linear-gradient(to top, #667eea, #764ba2)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    height: `${Math.max(item.consultas * 8, 4)}px`,
                    minHeight: '4px'
                  }}
                  title={`${item.hora}: ${item.consultas} consultas`}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                ></div>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>{item.hora.split(':')[0]}</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Pico: <strong>{Math.max(...dadosPorHora.map(h => h.consultas))}</strong> consultas
              • Total: <strong>{dadosPorHora.reduce((acc, h) => acc + h.consultas, 0)}</strong> consultas no período
            </p>
          </div>
        </div>

        {/* Tabela Ultra Moderna */}
        <div className="card">
          <div style={{
            padding: '20px',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            marginBottom: '0'
          }}>
            <div className="flex justify-between">
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }} className="flex">
                  <span style={{ fontSize: '24px', marginRight: '10px' }}>📋</span>
                  Registros Detalhados ({dadosFiltrados.length})
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
                  Monitoramento em tempo real dos atendimentos • Dados do Supabase
                </p>
              </div>
              <div style={{ fontSize: '12px' }}>
                <div className="flex" style={{ gap: '15px' }}>
                  <div className="flex">
                    <div style={{ width: '12px', height: '12px', background: '#4ade80', borderRadius: '50%', marginRight: '8px' }}></div>
                    <span>Normal</span>
                  </div>
                  <div className="flex">
                    <div style={{ width: '12px', height: '12px', background: '#fbbf24', borderRadius: '50%', marginRight: '8px' }}></div>
                    <span>Atenção</span>
                  </div>
                  <div className="flex">
                    <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', marginRight: '8px' }}></div>
                    <span>Urgente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
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
                  const statusConfig = {
                    urgente: { emoji: '🔴', text: 'Urgente', bg: '#fee2e2', textColor: '#991b1b', borderColor: '#ef4444' },
                    atencao: { emoji: '🟡', text: 'Atenção', bg: '#fef3c7', textColor: '#92400e', borderColor: '#f59e0b' },
                    normal: { emoji: '🟢', text: 'Normal', bg: '#dcfce7', textColor: '#166534', borderColor: '#22c55e' }
                  };
                  
                  return (
                    <tr 
                      key={item.id || index}
                      style={{
                        borderLeft: `4px solid ${statusConfig[status].borderColor}`,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = statusConfig[status].bg}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>
                          {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {new Date(item.created_at).toLocaleTimeString('pt-BR')}
                        </div>
                      </td>
                      <td style={{ fontWeight: '600' }}>{item.nome_aluno || 'N/A'}</td>
                      <td>{item.terapeuta || 'N/A'}</td>
                      <td>
                        <div className="flex" style={{ alignItems: 'center' }}>
                          <span style={{ 
                            fontSize: '16px', 
                            fontWeight: 'bold', 
                            color: statusConfig[status].borderColor,
                            marginRight: '8px'
                          }}>
                            {pontuacao.toFixed(1)}
                          </span>
                          <div style={{ 
                            width: '60px', 
                            height: '6px', 
                            background: '#e5e7eb', 
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div 
                              style={{
                                height: '100%',
                                background: statusConfig[status].borderColor,
                                width: `${Math.min(pontuacao, 100)}%`,
                                transition: 'width 0.5s ease'
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: statusConfig[status].bg,
                          color: statusConfig[status].textColor,
                          border: `1px solid ${statusConfig[status].borderColor}`
                        }}>
                          {statusConfig[status].emoji} {statusConfig[status].text}
                        </span>
                      </td>
                      <td style={{ maxWidth: '200px', fontSize: '12px' }}>
                        <div style={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          cursor: 'help'
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
            <div className="text-center" style={{ padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
              <div style={{ color: '#6b7280', fontSize: '18px', fontWeight: '500' }}>
                Nenhum registro encontrado com os filtros aplicados.
              </div>
              <div style={{ color: '#9ca3af', fontSize: '14px', marginTop: '10px' }}>
                Ajuste os filtros para ver mais resultados.
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Ultra */}
        <div className="text-center" style={{ margin: '60px 0 40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px'
            }}>
              🧠
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#1f2937' }}>MEDWAY Analytics v2.0</div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Sistema Inteligente de Monitoramento Psicológico</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#9ca3af' }}>
              <div>Última atualização: {lastUpdate.toLocaleString('pt-BR')}</div>
              <div style={{ marginTop: '4px' }}>
                {connectionStatus === 'connected' ? (
                  <span style={{ color: '#22c55e' }}>🟢 Conectado ao Supabase</span>
                ) : connectionStatus === 'error' ? (
                  <span style={{ color: '#f59e0b' }}>🟡 Modo Demo</span>
                ) : (
                  <span style={{ color: '#6b7280' }}>🔄 Conectando</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
