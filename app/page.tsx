'use client'

import React, { useState, useEffect, useCallback } from 'react';

export default function MedwayDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [activeView, setActiveView] = useState('hoje');
  const [showFilters, setShowFilters] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [filters, setFilters] = useState({
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionStatus('connecting');
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/consulta?select=*&order=created_at.desc&limit=200`, {
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
      setConnectionStatus('connected');
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError(error.message);
      setConnectionStatus('error');
      
      // Dados de exemplo mais realistas
      const dadosExemplo = [
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
        },
        {
          id: 4,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          nome_aluno: 'Lucas Mendes',
          terapeuta: 'Dra. Maria Fernandes',
          pontuacao: 18,
          observacoes: 'Excelente evolução nas últimas sessões. Técnicas aplicadas estão funcionando.'
        },
        {
          id: 5,
          created_at: new Date(Date.now() - 9000000).toISOString(),
          nome_aluno: 'Ana Carolina',
          terapeuta: 'Dr. João Santos',
          pontuacao: 55,
          observacoes: 'Acompanhar de perto. Sinais de alerta identificados na sessão.'
        },
        {
          id: 6,
          created_at: new Date(Date.now() - 10800000).toISOString(),
          nome_aluno: 'Roberto Silva',
          terapeuta: 'Dra. Patricia Souza',
          pontuacao: 31,
          observacoes: 'Progresso lento mas consistente. Manter estratégia atual.'
        },
        {
          id: 7,
          created_at: new Date(Date.now() - 12600000).toISOString(),
          nome_aluno: 'Fernanda Lima',
          terapeuta: 'Dr. Carlos Rocha',
          pontuacao: 22,
          observacoes: 'Resposta positiva às técnicas de relaxamento aplicadas.'
        },
        {
          id: 8,
          created_at: new Date(Date.now() - 14400000).toISOString(),
          nome_aluno: 'Bruno Santos',
          terapeuta: 'Dra. Ana Lima',
          pontuacao: 47,
          observacoes: 'Necessita revisão do plano terapêutico. Resistência observada.'
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
      const interval = setInterval(fetchData, 15000); // Atualiza a cada 15s
      return () => clearInterval(interval);
    }
  }, [realTimeEnabled, fetchData]);

  // Funções de análise
  const hoje = new Date().toISOString().split('T')[0];
  const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const ultimos7Dias = new Date(Date.now() - 7 * 86400000);
  const ultimos30Dias = new Date(Date.now() - 30 * 86400000);

  const filtrarPorPeriodo = (dados, periodo) => {
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

  const dadosFiltrados = data.filter(item => {
    if (filters.periodo !== 'todos') {
      const dadosPeriodo = filtrarPorPeriodo([item], filters.periodo);
      if (dadosPeriodo.length === 0) return false;
    }
    
    if (filters.terapeuta && item.terapeuta !== filters.terapeuta) return false;
    if (filters.aluno && !item.nome_aluno?.toLowerCase().includes(filters.aluno.toLowerCase())) return false;
    if (filters.pontuacaoMin && parseFloat(item.pontuacao) < parseFloat(filters.pontuacaoMin)) return false;
    if (filters.pontuacaoMax && parseFloat(item.pontuacao) > parseFloat(filters.pontuacaoMax)) return false;
    if (filters.busca && !JSON.stringify(item).toLowerCase().includes(filters.busca.toLowerCase())) return false;
    
    if (filters.status) {
      const pontuacao = parseFloat(item.pontuacao) || 0;
      const status = pontuacao >= 50 ? 'urgente' : pontuacao >= 30 ? 'atencao' : 'normal';
      if (status !== filters.status) return false;
    }
    
    return true;
  });

  const dadosHoje = filtrarPorPeriodo(data, activeView);
  const dadosOntem = filtrarPorPeriodo(data, 'ontem');

  // Métricas principais
  const metricas = {
    totalHoje: dadosHoje.length,
    totalOntem: dadosOntem.length,
    terapeutasHoje: [...new Set(dadosHoje.map(item => item.terapeuta))].filter(Boolean).length,
    alunosHoje: [...new Set(dadosHoje.map(item => item.nome_aluno))].filter(Boolean).length,
    mediaPontuacaoHoje: dadosHoje.length > 0 
      ? (dadosHoje.reduce((acc, item) => acc + (parseFloat(item.pontuacao) || 0), 0) / dadosHoje.length)
      : 0,
    casosUrgentesHoje: dadosHoje.filter(item => parseFloat(item.pontuacao) >= 50).length,
    casosAtencaoHoje: dadosHoje.filter(item => parseFloat(item.pontuacao) >= 30 && parseFloat(item.pontuacao) < 50).length,
    casosNormaisHoje: dadosHoje.filter(item => parseFloat(item.pontuacao) < 30).length
  };

  const terapeutasUnicos = [...new Set(data.map(item => item.terapeuta))].filter(Boolean);
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
      urgentes: consultasHora.filter(item => parseFloat(item.pontuacao) >= 50).length
    };
  });

  const exportData = () => {
    try {
      const csv = [
        ['Data/Hora', 'Aluno', 'Terapeuta', 'Pontuação', 'Status', 'Observações'],
        ...dadosFiltrados.map(item => {
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl animate-pulse">🧠</span>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-ping"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">MEDWAY Analytics</h2>
          <p className="text-gray-600 mb-6">Conectando ao sistema...</p>
          <div className="flex justify-center space-x-1 mb-4">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <p className="text-xs text-gray-500">Carregando dados em tempo real...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header Ultra Moderno */}
      <div className="bg-white/80 backdrop-blur-xl shadow-2xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-4 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3">
                  <span className="text-3xl transform -rotate-3">🧠</span>
                </div>
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500 animate-ping' :
                  'bg-red-500'
                }`}></div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  MEDWAY Analytics
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="flex items-center">
                    {connectionStatus === 'connected' && <span className="text-green-500 mr-1">●</span>}
                    {connectionStatus === 'connecting' && <span className="text-yellow-500 mr-1">●</span>}
                    {connectionStatus === 'error' && <span className="text-red-500 mr-1">●</span>}
                    {data.length} registros
                  </span>
                  <span>•</span>
                  <span>{lastUpdate.toLocaleTimeString('pt-BR')}</span>
                  {error && <span className="text-orange-600">• Modo Demo</span>}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Seletor de Período */}
              <div className="flex bg-white rounded-xl p-1 shadow-lg border border-gray-200">
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
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                      activeView === key
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md transform scale-105'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Controles */}
              <button
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg ${
                  realTimeEnabled 
                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-200' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                <span className={`mr-2 ${realTimeEnabled ? 'animate-spin' : ''}`}>🔄</span>
                {realTimeEnabled ? 'LIVE' : 'PAUSADO'}
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg flex items-center"
              >
                <span className="mr-2">🔍</span>
                Filtros
              </button>

              <button
                onClick={fetchData}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg disabled:opacity-50"
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status de Conexão */}
        {error && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-xl p-4 mb-6 text-white">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <p className="font-bold">Modo Demonstração Ativo</p>
                <p className="text-yellow-100 text-sm">
                  Exibindo dados de exemplo. Configure as variáveis de ambiente para dados reais.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Painel de Filtros Avançados */}
        {showFilters && (
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 mb-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="text-2xl mr-3">✨</span>
                Filtros Avançados
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={exportData}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg flex items-center"
                >
                  <span className="mr-2">💾</span>
                  Exportar CSV
                </button>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all shadow-lg flex items-center"
                >
                  <span className="mr-2">🗑️</span>
                  Limpar
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Busca geral */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Busca Geral</label>
                <input
                  type="text"
                  value={filters.busca}
                  onChange={(e) => setFilters({...filters, busca: e.target.value})}
                  placeholder="Buscar em todos os campos..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Terapeuta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">👥 Terapeuta</label>
                <select
                  value={filters.terapeuta}
                  onChange={(e) => setFilters({...filters, terapeuta: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">Todos</option>
                  {terapeutasUnicos.map(terapeuta => (
                    <option key={terapeuta} value={terapeuta}>{terapeuta}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🚨 Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">Todos</option>
                  <option value="normal">🟢 Normal (0-29)</option>
                  <option value="atencao">🟡 Atenção (30-49)</option>
                  <option value="urgente">🔴 Urgente (50+)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <strong>{dadosFiltrados.length}</strong> registros encontrados
                {filters.periodo === 'hoje' && ` de ${metricas.totalHoje} hoje`}
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>🟢 {metricas.casosNormaisHoje} Normais</span>
                <span>🟡 {metricas.casosAtencaoHoje} Atenção</span>
                <span>🔴 {metricas.casosUrgentesHoje} Urgentes</span>
              </div>
            </div>
          </div>
        )}

        {/* Cards de Métricas Ultra Modernos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Hoje */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consultas Hoje</p>
                <p className="text-4xl font-bold text-indigo-600 my-2">{metricas.totalHoje}</p>
                <div className="flex items-center">
                  <div className={`text-sm flex items-center ${crescimentoHoje >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <span className={`mr-1 ${crescimentoHoje < 0 ? 'rotate-180' : ''}`}>📈</span>
                    {Math.abs(crescimentoHoje).toFixed(1)}% vs ontem
                  </div>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">📅</span>
              </div>
            </div>
          </div>

          {/* Terapeutas Ativos */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terapeutas Ativos</p>
                <p className="text-4xl font-bold text-green-600 my-2">{metricas.terapeutasHoje}</p>
                <p className="text-xs text-gray-500">de {terapeutasUnicos.length} total</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">👥</span>
              </div>
            </div>
          </div>

          {/* Alunos Atendidos */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alunos Atendidos</p>
                <p className="text-4xl font-bold text-purple-600 my-2">{metricas.alunosHoje}</p>
                <p className="text-xs text-gray-500">únicos hoje</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">🎓</span>
              </div>
            </div>
          </div>

          {/* Média de Pontuação */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Média Pontuação</p>
                <p className="text-4xl font-bold text-orange-600 my-2">{metricas.mediaPontuacaoHoje.toFixed(1)}</p>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    metricas.mediaPontuacaoHoje >= 50 ? 'bg-red-500' :
                    metricas.mediaPontuacaoHoje >= 30 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <p className="text-xs text-gray-500">
                    {metricas.mediaPontuacaoHoje >= 50 ? 'Alto risco' :
                     metricas.mediaPontuacaoHoje >= 30 ? 'Atenção' : 'Normal'}
                  </p>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">🎯</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas de Emergência ULTRA */}
        {metricas.casosUrgentesHoje > 0 && (
          <div className="bg-gradient-to-r from-red-500 via-pink-500 to-red-600 rounded-3xl shadow-2xl p-6 mb-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-pink-600/20 animate-pulse"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-4xl animate-bounce">🚨</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    ALERTA CRÍTICO: {metricas.casosUrgentesHoje} Casos Urgentes
                  </h3>
                  <p className="text-red-100">
                    Pontuação ≥ 50 - Intervenção imediata necessária
                  </p>
                  <div className="flex space-x-4 mt-2 text-sm">
                    <span>⏰ Identificados hoje</span>
                    <span>📋 Requer supervisão</span>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block">
                <button className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl transition-all font-medium">
                  Ver Detalhes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Distribuição Visual com Animações */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Status Normal */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Casos Normais</h3>
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🟢</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600 mb-3">{metricas.casosNormaisHoje}</div>
              <p className="text-sm text-gray-600 mb-4">Pontuação 0-29</p>
              <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${dadosHoje.length > 0 ? (metricas.casosNormaisHoje / dadosHoje.length) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {dadosHoje.length > 0 ? ((metricas.casosNormaisHoje / dadosHoje.length) * 100).toFixed(1) : 0}% do total
              </p>
            </div>
          </div>

          {/* Status Atenção */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Casos Atenção</h3>
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🟡</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-yellow-600 mb-3">{metricas.casosAtencaoHoje}</div>
              <p className="text-sm text-gray-600 mb-4">Pontuação 30-49</p>
              <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${dadosHoje.length > 0 ? (metricas.casosAtencaoHoje / dadosHoje.length) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {dadosHoje.length > 0 ? ((metricas.casosAtencaoHoje / dadosHoje.length) * 100).toFixed(1) : 0}% do total
              </p>
            </div>
          </div>

          {/* Status Urgente */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Casos Urgentes</h3>
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🔴</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-red-600 mb-3">{metricas.casosUrgentesHoje}</div>
              <p className="text-sm text-gray-600 mb-4">Pontuação ≥ 50</p>
              <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-400 to-red-600 h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${dadosHoje.length > 0 ? (metricas.casosUrgentesHoje / dadosHoje.length) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {dadosHoje.length > 0 ? ((metricas.casosUrgentesHoje / dadosHoje.length) * 100).toFixed(1) : 0}% do total
              </p>
            </div>
          </div>
        </div>

        {/* Gráfico de Atividade por Hora */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 mb-8 border border-white/20">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-3">📊</span>
            Atividade por Hora - {activeView === 'hoje' ? 'Hoje' : activeView === '7dias' ? 'Últimos 7 dias' : 'Últimos 30 dias'}
          </h3>
          <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-24 gap-2">
            {dadosPorHora.map((item, index) => (
              <div key={index} className="text-center">
                <div 
                  className="bg-gradient-to-t from-indigo-500 to-purple-500 rounded-lg mb-2 transition-all hover:scale-110"
                  style={{ 
                    height: `${Math.max(item.consultas * 8, 4)}px`,
                    minHeight: '4px'
                  }}
                  title={`${item.hora}: ${item.consultas} consultas`}
                ></div>
                <div className="text-xs text-gray-500">{item.hora.split(':')[0]}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Pico: {Math.max(...dadosPorHora.map(h => h.consultas))} consultas
              • Total: {dadosPorHora.reduce((acc, h) => acc + h.consultas, 0)} consultas
            </p>
          </div>
        </div>

        {/* Tabela Ultra Moderna */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="px-6 py-6 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center mb-2">
                  <span className="text-2xl mr-3">📋</span>
                  Registros Detalhados ({dadosFiltrados.length})
                </h3>
                <p className="text-indigo-100 text-sm">
                  Monitoramento em tempo real dos atendimentos
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                    <span>Normal</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                    <span>Atenção</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                    <span>Urgente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terapeuta</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pontuação</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {dadosFiltrados.slice(0, 50).map((item, index) => {
                  const pontuacao = parseFloat(item.pontuacao) || 0;
                  const status = pontuacao >= 50 ? 'urgente' : pontuacao >= 30 ? 'atencao' : 'normal';
                  const statusConfig = {
                    urgente: { emoji: '🔴', text: 'Urgente', bg: 'bg-red-50', textColor: 'text-red-800', borderColor: 'border-l-red-500' },
                    atencao: { emoji: '🟡', text: 'Atenção', bg: 'bg-yellow-50', textColor: 'text-yellow-800', borderColor: 'border-l-yellow-500' },
                    normal: { emoji: '🟢', text: 'Normal', bg: 'bg-green-50', textColor: 'text-green-800', borderColor: 'border-l-green-500' }
                  };
                  
                  return (
                    <tr 
                      key={item.id || index} 
                      className={`hover:${statusConfig[status].bg} transition-all duration-200 border-l-4 ${statusConfig[status].borderColor}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {new Date(item.created_at).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {new Date(item.created_at).toLocaleTimeString('pt-BR')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-medium text-gray-900">{item.nome_aluno || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.terapeuta || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <span className={`text-lg font-bold ${statusConfig[status].textColor}`}>
                            {pontuacao.toFixed(1)}
                          </span>
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                status === 'urgente' ? 'bg-red-500' :
                                status === 'atencao' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(pontuacao, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${statusConfig[status].bg} ${statusConfig[status].textColor} border`}>
                          {statusConfig[status].emoji} {statusConfig[status].text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                        <div className="truncate" title={item.observacoes}>
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
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <div className="text-gray-500">Nenhum registro encontrado com os filtros aplicados.</div>
            </div>
          )}
        </div>

        {/* Rodapé Ultra */}
        <div className="mt-16 text-center pb-8">
          <div className="inline-flex items-center space-x-4 bg-white/90 backdrop-blur-lg rounded-2xl px-8 py-4 shadow-2xl border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-gray-800">MEDWAY Analytics v2.0</p>
              <p className="text-sm text-gray-500">Sistema Inteligente de Monitoramento Psicológico</p>
            </div>
            <div className="text-right text-xs text-gray-400">
              <p>Última atualização: {lastUpdate.toLocaleString('pt-BR')}</p>
              <p>{connectionStatus === 'connected' ? '🟢 Conectado' : connectionStatus === 'error' ? '🟡 Modo Demo' : '🔄 Conectando'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
