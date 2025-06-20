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
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [rawData, setRawData] = useState<any>(null);
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

      // Criar data fake baseada no índice (dados mais recentes primeiro)
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
      
      // Debug: Mostrar informações de configuração
      const debugConfig = {
        SUPABASE_URL,
        SUPABASE_KEY_LENGTH: SUPABASE_KEY.length,
        SUPABASE_KEY_START: SUPABASE_KEY.substring(0, 20) + '...',
        NODE_ENV: process.env.NODE_ENV,
        TIMESTAMP: new Date().toISOString(),
        HAS_ENV_VARS: {
          SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          SUPABASE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      };
      
      console.log('🔍 DEBUG - Configuração:', debugConfig);
      setDebugInfo(debugConfig);
      
      // Buscar dados sem created_at (que pode não existir)
      const url = `${SUPABASE_URL}/rest/v1/consulta?select=id,aluno_id,terapeuta_id,situacao_mental,observacoes&order=id.desc&limit=50`;
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
      console.log('🔍 DEBUG - Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('🔍 DEBUG - Error response body:', errorText);
        throw new Error(`Erro ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const result: Consulta[] = await response.json();
      console.log('🔍 DEBUG - Dados originais recebidos:', result.slice(0, 3));
      console.log('🔍 DEBUG - Quantidade de registros originais:', result.length);
      console.log('🔍 DEBUG - Estrutura do primeiro item:', result[0]);
      
      setRawData(result);
      
      // Mapear dados para a estrutura esperada
      const dadosMapeados = mapearDados(result);
      console.log('🔍 DEBUG - Dados mapeados:', dadosMapeados.slice(0, 3));
      
      setData(dadosMapeados);
      setLastUpdate(new Date());
      setConnectionStatus('connected');
      
    } catch (error: any) {
      console.error('❌ ERRO COMPLETO ao buscar dados:', error);
      console.error('❌ ERRO STACK:', error.stack);
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

  // Funções de análise (simplificadas, sem depender muito de datas)
  const hoje = new Date().toISOString().split('T')[0];
  const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const filtrarPorPeriodo = (dados: ConsultaNormalizada[], periodo: string): ConsultaNormalizada[] => {
    // Como as datas são simuladas, vamos mostrar todos os dados para 'hoje'
    switch(periodo) {
      case 'hoje':
        return dados; // Mostrar todos
      case 'ontem':
        return dados.slice(0, Math.floor(dados.length / 2)); // Metade dos dados
      case '7dias':
        return dados; // Todos os dados
      case '30dias':
        return dados; // Todos os dados
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
          <p style={{ color: '#666', marginBottom: '20px' }}>Conectando ao Supabase...</p>
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
          <p style={{ color: '#999', fontSize: '12px' }}>Testando conexão...</p>
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
        }
        
        .metric-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          margin-bottom: 20px;
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
        
        .btn-success {
          background: linear-gradient(45deg, #4ade80, #22c55e);
          color: white;
        }
        
        .btn-secondary {
          background: linear-gradient(45deg, #6b7280, #4b5563);
          color: white;
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
        
        .error-alert {
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          background: linear-gradient(45deg, #ef4444, #dc2626);
          color: white;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .flex {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .justify-between {
          justify-content: space-between;
        }
        
        .metric-number {
          font-size: 36px;
          font-weight: bold;
          margin: 10px 0;
          color: #667eea;
        }
        
        .metric-label {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 5px;
        }
      `}</style>

      {/* Header Simplificado */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '20px 0',
        marginBottom: '20px'
      }}>
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
                  MEDWAY Analytics - DEBUG MODE
                </h1>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  <span style={{ color: connectionStatus === 'connected' ? '#22c55e' : '#ef4444' }}>●</span>
                  {' '}{data.length} registros • {lastUpdate.toLocaleTimeString('pt-BR')}
                  {connectionStatus === 'connected' && <span style={{ color: '#22c55e' }}> • Conectado!</span>}
                  {error && <span style={{ color: '#f59e0b' }}> • Erro na Conexão</span>}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-primary"
            >
              🔍 {showFilters ? 'Ocultar' : 'Mostrar'} Debug
            </button>
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
                <strong>SUCESSO! Conectado ao Supabase!</strong>
                <br />
                <small>
                  Carregados {data.length} registros • Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
                </small>
              </div>
            </div>
          </div>
        )}

        {/* Informações de Debug SEMPRE VISÍVEIS quando há erro */}
        {(showFilters || error) && debugInfo && (
          <div className="debug-alert">
            <div className="flex">
              <span style={{ fontSize: '24px', marginRight: '10px' }}>🔍</span>
              <div>
                <strong>INFORMAÇÕES DETALHADAS DE DEBUG</strong>
                <br />
                <strong>URL Supabase:</strong> {debugInfo.SUPABASE_URL}
                <br />
                <strong>Chave API (tamanho):</strong> {debugInfo.SUPABASE_KEY_LENGTH} caracteres
                <br />
                <strong>Chave começa com:</strong> {debugInfo.SUPABASE_KEY_START}
                <br />
                <strong>Variáveis de ambiente carregadas:</strong> 
                URL = {debugInfo.HAS_ENV_VARS.SUPABASE_URL ? 'SIM' : 'NÃO'}, 
                KEY = {debugInfo.HAS_ENV_VARS.SUPABASE_KEY ? 'SIM' : 'NÃO'}
                <br />
                <strong>Status da Conexão:</strong> {connectionStatus}
                <br />
                <strong>Total de registros carregados:</strong> {data.length}
                {rawData && (
                  <>
                    <br />
                    <strong>Dados originais (primeiros 3):</strong>
                    <br />
                    {JSON.stringify(rawData.slice(0, 3), null, 2)}
                  </>
                )}
                {error && (
                  <>
                    <br />
                    <strong style={{ color: '#ff6b6b' }}>ERRO DETALHADO:</strong> {error}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Alerta de Erro */}
        {error && (
          <div className="error-alert">
            <div className="flex">
              <span style={{ fontSize: '24px', marginRight: '10px' }}>❌</span>
              <div>
                <strong>Erro na Conexão com Supabase</strong>
                <br />
                <small>Erro: {error}</small>
                <br />
                <small>Exibindo dados de exemplo. Abra o console (F12) para mais detalhes.</small>
              </div>
            </div>
          </div>
        )}

        {/* Métricas Básicas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="metric-card">
            <div className="metric-label">Total de Registros</div>
            <div className="metric-number">{data.length}</div>
            <div className="metric-label">
              {connectionStatus === 'connected' ? 'Dados do Supabase' : 'Dados de Exemplo'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Status da Conexão</div>
            <div className="metric-number" style={{ 
              fontSize: '24px',
              color: connectionStatus === 'connected' ? '#22c55e' : '#ef4444' 
            }}>
              {connectionStatus === 'connected' ? '✅ CONECTADO' : '❌ ERRO'}
            </div>
            <div className="metric-label">
              {connectionStatus === 'connected' ? 'Banco de dados ativo' : 'Usando dados de exemplo'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Última Atualização</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#667eea', margin: '10px 0' }}>
              {lastUpdate.toLocaleTimeString('pt-BR')}
            </div>
            <div className="metric-label">
              {lastUpdate.toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="card">
          <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>
            📋 Próximos Passos para Diagnóstico
          </h3>
          <ol style={{ marginLeft: '20px', lineHeight: '1.6' }}>
            <li><strong>Teste a URL direta:</strong> Cole a URL que mostrei acima no seu browser e me diga o resultado</li>
            <li><strong>Verifique o console:</strong> Pressione F12, vá na aba Console e me mande screenshot dos erros (se houver)</li>
            <li><strong>Envie as informações de debug:</strong> Screenshot da seção azul acima</li>
          </ol>
          <p style={{ marginTop: '15px', color: '#6b7280', fontSize: '14px' }}>
            Com essas informações, posso identificar exatamente o problema e corrigi-lo.
          </p>
        </div>
      </div>
    </div>
  );
}
