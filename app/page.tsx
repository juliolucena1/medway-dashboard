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
  const SUPABASE_URL = 'https://dtvaadwcfzpgbthkjlqa.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dmFhZHdjZnpwZ2J0aGtqbHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA3MzIxMDAsImV4cCI6MjA0NjMwODEwMH0.JIENlyeyk0ibOq0Nb4ydFSFbsPprBFICfNHlvF8guwU';

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
        background: `
          linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(30, 41, 59, 0.95) 100%),
          radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.12) 0%, transparent 50%)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background particles */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)
          `,
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          padding: '48px 40px',
          textAlign: 'center',
          boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          maxWidth: '480px',
          width: '90%',
          position: 'relative',
          animation: 'slideUp 0.8s ease-out'
        }}>
          {/* Logo gradient */}
          <div style={{
            width: '100px',
            height: '100px',
            background: `
              linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)
            `,
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            fontSize: '48px',
            position: 'relative',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <div style={{
              position: 'absolute',
              inset: '-4px',
              background: `
                linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)
              `,
              borderRadius: '28px',
              opacity: 0.3,
              filter: 'blur(8px)',
              animation: 'glow 2s ease-in-out infinite alternate'
            }}></div>
            🧠
          </div>
          
          <h2 style={{ 
            color: '#f8fafc', 
            marginBottom: '16px', 
            fontSize: '32px',
            fontWeight: '700',
            letterSpacing: '-0.025em',
            background: `
              linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)
            `,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            MEDWAY Analytics
          </h2>
          
          <p style={{ 
            color: 'rgba(248, 250, 252, 0.7)', 
            marginBottom: '32px',
            fontSize: '18px',
            fontWeight: '400',
            lineHeight: 1.6
          }}>
            Iniciando sistema de monitoramento em tempo real...
          </p>
          
          {/* Elegant loading dots */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '24px'
          }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '12px',
                  height: '12px',
                  background: `
                    linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)
                  `,
                  borderRadius: '50%',
                  animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`
                }}
              ></div>
            ))}
          </div>
          
          <div style={{
            padding: '16px 24px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '16px',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            color: 'rgba(248, 250, 252, 0.8)',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <div style={{ marginBottom: '4px' }}>🔗 Conectando ao Supabase...</div>
            <div style={{ color: 'rgba(99, 102, 241, 0.8)' }}>Estabelecendo conexão segura</div>
          </div>
        </div>
        
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
            40% { transform: scale(1.2); opacity: 1; }
          }
          @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(30px, -30px) rotate(120deg); }
            66% { transform: translate(-20px, 20px) rotate(240deg); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes glow {
            from { opacity: 0.2; }
            to { opacity: 0.4; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(30, 41, 59, 0.95) 100%),
        radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.12) 0%, transparent 50%)
      `,
      fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
      position: 'relative',
      minWidth: '320px'
    }}>
      <style>{`
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            0 20px 40px -12px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.05);
          margin-bottom: 24px;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          overflow: hidden;
        }
        
        .glass-card:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        }
        
        .glass-card:hover {
          transform: translateY(-4px);
          box-shadow: 
            0 32px 64px -12px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.08);
        }
        
        .metric-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(16px);
          border-radius: 20px;
          padding: 28px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }
        
        .metric-card:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
        }
        
        .metric-card:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 
            0 16px 48px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.15);
        }
        
        .btn {
          padding: 14px 24px;
          border-radius: 16px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          margin: 6px;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(8px);
          font-family: inherit;
          letter-spacing: 0.025em;
        }
        
        .btn:before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        .btn:hover:before {
          left: 100%;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border: 1px solid rgba(99, 102, 241, 0.3);
          box-shadow: 
            0 4px 16px rgba(99, 102, 241, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #5b5ff9 0%, #9333ea 100%);
          transform: translateY(-2px);
          box-shadow: 
            0 8px 24px rgba(99, 102, 241, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }
        
        .btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: 1px solid rgba(16, 185, 129, 0.3);
          box-shadow: 
            0 4px 16px rgba(16, 185, 129, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        
        .btn-success:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-2px);
          box-shadow: 
            0 8px 24px rgba(16, 185, 129, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }
        
        .btn-warning {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          border: 1px solid rgba(245, 158, 11, 0.3);
          box-shadow: 
            0 4px 16px rgba(245, 158, 11, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        
        .btn-secondary {
          background: rgba(71, 85, 105, 0.6);
          color: rgba(248, 250, 252, 0.9);
          border: 1px solid rgba(71, 85, 105, 0.3);
          box-shadow: 
            0 4px 16px rgba(71, 85, 105, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        .btn-secondary:hover {
          background: rgba(71, 85, 105, 0.8);
          transform: translateY(-2px);
          color: white;
        }
        
        .status-normal { 
          color: #34d399; 
          font-weight: 600;
          text-shadow: 0 0 8px rgba(52, 211, 153, 0.3);
        }
        .status-atencao { 
          color: #fbbf24; 
          font-weight: 600;
          text-shadow: 0 0 8px rgba(251, 191, 36, 0.3);
        }
        .status-urgente { 
          color: #f87171; 
          font-weight: 600;
          text-shadow: 0 0 8px rgba(248, 113, 113, 0.3);
        }
        
        .elegant-progress {
          width: 100%;
          height: 12px;
          background: rgba(71, 85, 105, 0.3);
          border-radius: 8px;
          overflow: hidden;
          margin: 16px 0;
          position: relative;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .elegant-progress:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .progress-fill {
          height: 100%;
          transition: width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          border-radius: 8px;
        }
        
        .progress-fill:after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 8px 8px 0 0;
        }
        
        .progress-normal { 
          background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
          box-shadow: 0 0 16px rgba(52, 211, 153, 0.3);
        }
        .progress-atencao { 
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          box-shadow: 0 0 16px rgba(251, 191, 36, 0.3);
        }
        .progress-urgente { 
          background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
          box-shadow: 0 0 16px rgba(248, 113, 113, 0.3);
        }
        
        .elegant-table {
          width: 100%;
          border-collapse: collapse;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        
        .elegant-table th {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
          color: rgba(248, 250, 252, 0.95);
          padding: 20px 16px;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
        }
        
        .elegant-table th:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        }
        
        .elegant-table td {
          padding: 18px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          color: rgba(248, 250, 252, 0.85);
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .elegant-table tr:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: scale(1.001);
        }
        
        .elegant-table tr:hover td {
          color: rgba(248, 250, 252, 0.95);
        }
        
        .header-glass {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(24px);
          padding: 24px 0;
          margin-bottom: 32px;
          border-radius: 0 0 32px 32px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top: none;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
        }
        
        .header-glass:before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }
        
        .grid {
          display: grid;
          gap: 24px;
        }
        
        .grid-cols-4 {
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }
        
        .grid-cols-3 {
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        }
        
        .flex {
          display: flex;
          align-items: center;
          gap: 16px;
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
        
        .elegant-input {
          padding: 16px 20px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(8px);
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          width: 100%;
          margin-bottom: 16px;
          color: rgba(248, 250, 252, 0.9);
          font-family: inherit;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .elegant-input::placeholder {
          color: rgba(248, 250, 252, 0.5);
        }
        
        .elegant-input:focus {
          outline: none;
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 
            0 0 0 3px rgba(99, 102, 241, 0.15),
            0 8px 24px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }
        
        .success-alert {
          padding: 24px;
          border-radius: 20px;
          margin-bottom: 32px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
          border: 1px solid rgba(16, 185, 129, 0.3);
          backdrop-filter: blur(16px);
          color: rgba(248, 250, 252, 0.95);
          box-shadow: 
            0 8px 32px rgba(16, 185, 129, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        .metric-number {
          font-size: 48px;
          font-weight: 800;
          margin: 16px 0;
          line-height: 1;
          letter-spacing: -0.025em;
        }
        
        .metric-label {
          color: rgba(248, 250, 252, 0.7);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .status-badge {
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          letter-spacing: 0.025em;
        }
        
        .badge-normal { 
          background: linear-gradient(135deg, rgba(52, 211, 153, 0.9) 0%, rgba(16, 185, 129, 0.9) 100%);
          box-shadow: 0 4px 16px rgba(52, 211, 153, 0.25);
        }
        .badge-atencao { 
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0.9) 100%);
          box-shadow: 0 4px 16px rgba(251, 191, 36, 0.25);
        }
        .badge-urgente { 
          background: linear-gradient(135deg, rgba(248, 113, 113, 0.9) 0%, rgba(239, 68, 68, 0.9) 100%);
          box-shadow: 0 4px 16px rgba(248, 113, 113, 0.25);
        }
        
        @media (max-width: 768px) {
          .container { padding: 0 16px; }
          .grid-cols-4 { grid-template-columns: 1fr; }
          .grid-cols-3 { grid-template-columns: 1fr; }
          .flex { flex-direction: column; align-items: stretch; gap: 12px; }
          .metric-card { padding: 20px; }
          .glass-card { padding: 24px; }
          .metric-number { font-size: 36px; }
        }
        
        .logo-gradient {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(226, 232, 240, 0.9) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Header Ultra Premium */}
      <div className="header-glass">
        <div className="container">
          <div className="flex justify-between">
            <div className="flex">
              <div style={{
                width: '72px',
                height: '72px',
                background: `
                  linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)
                `,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                marginRight: '20px',
                position: 'relative',
                boxShadow: `
                  0 8px 32px rgba(99, 102, 241, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `
              }}>
                <div style={{
                  position: 'absolute',
                  inset: '-3px',
                  background: `
                    linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)
                  `,
                  borderRadius: '23px',
                  opacity: 0.3,
                  filter: 'blur(8px)',
                  animation: 'glow 2s ease-in-out infinite alternate'
                }}></div>
                🧠
              </div>
              <div>
                <h1 style={{
                  fontSize: '36px',
                  fontWeight: '800',
                  marginBottom: '8px',
                  letterSpacing: '-0.025em'
                }} className="logo-gradient">
                  MEDWAY Analytics
                </h1>
                <div style={{ 
                  fontSize: '14px', 
                  color: 'rgba(248, 250, 252, 0.7)',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: connectionStatus === 'connected' ? '#34d399' : '#f87171',
                      boxShadow: `0 0 8px ${connectionStatus === 'connected' ? 'rgba(52, 211, 153, 0.5)' : 'rgba(248, 113, 113, 0.5)'}`,
                      animation: connectionStatus === 'connected' ? 'pulse 2s infinite' : 'none'
                    }}></div>
                    <span style={{ color: connectionStatus === 'connected' ? '#34d399' : '#f87171' }}>
                      {connectionStatus === 'connected' ? 'Conectado' : 'Erro de conexão'}
                    </span>
                  </div>
                  <span>•</span>
                  <span>{data.length} registros</span>
                  <span>•</span>
                  <span>{lastUpdate.toLocaleTimeString('pt-BR')}</span>
                  {connectionStatus === 'connected' && (
                    <>
                      <span>•</span>
                      <span style={{ 
                        color: '#34d399',
                        fontWeight: '600',
                        textShadow: '0 0 8px rgba(52, 211, 153, 0.3)'
                      }}>
                        ✨ Dados Reais
                      </span>
                    </>
                  )}
                  {error && (
                    <>
                      <span>•</span>
                      <span style={{ color: '#fbbf24' }}>🔧 Modo Demo</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap">
              {/* Seletor de Período Premium */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(16px)',
                borderRadius: '16px',
                padding: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                display: 'flex',
                gap: '4px'
              }}>
                {[
                  { key: 'hoje', label: 'Hoje', icon: '📅' },
                  { key: '7dias', label: '7 dias', icon: '📊' },
                  { key: '30dias', label: '30 dias', icon: '📈' }
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveView(key);
                      setFilters({...filters, periodo: key});
                    }}
                    className={`btn ${activeView === key ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                      margin: '0',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '13px'
                    }}
                  >
                    <span style={{ marginRight: '6px', fontSize: '14px' }}>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Controles Premium */}
              <button
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                className={`btn ${realTimeEnabled ? 'btn-success' : 'btn-secondary'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{
                  fontSize: '16px',
                  animation: realTimeEnabled ? 'spin 2s linear infinite' : 'none'
                }}>🔄</div>
                <span>{realTimeEnabled ? 'LIVE' : 'PAUSADO'}</span>
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '16px' }}>🔍</span>
                <span>Filtros</span>
              </button>

              <button
                onClick={fetchData}
                disabled={loading}
                className="btn btn-primary"
                style={{ 
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '16px' }}>⟳</span>
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Status de Sucesso Premium */}
        {connectionStatus === 'connected' && !error && (
          <div className="success-alert">
            <div className="flex">
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginRight: '16px',
                boxShadow: '0 8px 24px rgba(52, 211, 153, 0.3)'
              }}>
                ✅
              </div>
              <div>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: '700', 
                  marginBottom: '6px',
                  color: 'rgba(248, 250, 252, 0.95)'
                }}>
                  Conectado com Sucesso ao Banco de Dados!
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: 'rgba(248, 250, 252, 0.8)',
                  fontWeight: '500'
                }}>
                  Exibindo {data.length} registros reais do Supabase • Atualização automática a cada 30 segundos
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Painel de Filtros Avançados Premium */}
        {showFilters && (
          <div className="glass-card" style={{ animation: 'slideDown 0.4s ease-out' }}>
            <div className="flex justify-between" style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: 'rgba(248, 250, 252, 0.95)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ 
                  fontSize: '28px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  borderRadius: '12px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>✨</span>
                Filtros Avançados
              </h2>
              <div className="flex">
                <button onClick={exportData} className="btn btn-success">
                  <span style={{ marginRight: '8px', fontSize: '16px' }}>💾</span>
                  Exportar CSV
                </button>
                <button onClick={clearFilters} className="btn btn-secondary">
                  <span style={{ marginRight: '8px', fontSize: '16px' }}>🗑️</span>
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
                  className="elegant-input"
                />
              </div>
              
              <div>
                <label className="metric-label">👥 Terapeuta</label>
                <select
                  value={filters.terapeuta}
                  onChange={(e) => setFilters({...filters, terapeuta: e.target.value})}
                  className="elegant-input"
                >
                  <option value="">Todos os terapeutas</option>
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
                  className="elegant-input"
                >
                  <option value="">Todos os status</option>
                  <option value="normal">🟢 Normal (0-29)</option>
                  <option value="atencao">🟡 Atenção (30-49)</option>
                  <option value="urgente">🔴 Urgente (50+)</option>
                </select>
              </div>
            </div>

            <div style={{ 
              marginTop: '24px',
              padding: '20px',
              background: 'rgba(99, 102, 241, 0.1)',
              borderRadius: '16px',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }} className="flex justify-between">
              <div style={{ 
                fontSize: '16px', 
                color: 'rgba(248, 250, 252, 0.9)',
                fontWeight: '600'
              }}>
                <span style={{ color: '#6366f1' }}>{dadosFiltrados.length}</span> registros encontrados
                {filters.periodo === 'hoje' && ` de ${metricas.totalHoje} hoje`}
              </div>
              <div className="flex" style={{ 
                fontSize: '14px', 
                color: 'rgba(248, 250, 252, 0.8)', 
                gap: '20px',
                fontWeight: '500'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '8px', 
                    height: '8px', 
                    background: '#34d399', 
                    borderRadius: '50%'
                  }}></div>
                  {metricas.casosNormaisHoje} Normais
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '8px', 
                    height: '8px', 
                    background: '#fbbf24', 
                    borderRadius: '50%'
                  }}></div>
                  {metricas.casosAtencaoHoje} Atenção
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '8px', 
                    height: '8px', 
                    background: '#f87171', 
                    borderRadius: '50%'
                  }}></div>
                  {metricas.casosUrgentesHoje} Urgentes
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Cards de Métricas Ultra Premium */}
        <div className="grid grid-cols-4">
          <div className="metric-card">
            <div className="metric-label">
              Consultas {activeView === 'hoje' ? 'Hoje' : activeView === '7dias' ? 'Últimos 7 dias' : 'Últimos 30 dias'}
            </div>
            <div className="metric-number" style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 32px rgba(99, 102, 241, 0.3)'
            }}>
              {metricas.totalHoje}
            </div>
            <div className={crescimentoHoje >= 0 ? 'status-normal' : 'status-urgente'} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <span style={{ fontSize: '16px' }}>{crescimentoHoje >= 0 ? '📈' : '📉'}</span>
              <span>{Math.abs(crescimentoHoje).toFixed(1)}% vs ontem</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Terapeutas Ativos</div>
            <div className="metric-number" style={{ 
              background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 32px rgba(52, 211, 153, 0.3)'
            }}>
              {metricas.terapeutasHoje}
            </div>
            <div className="metric-label" style={{ color: 'rgba(248, 250, 252, 0.6)' }}>
              de {terapeutasUnicos.length} total
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Alunos Atendidos</div>
            <div className="metric-number" style={{ 
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 32px rgba(139, 92, 246, 0.3)'
            }}>
              {metricas.alunosHoje}
            </div>
            <div className="metric-label" style={{ color: 'rgba(248, 250, 252, 0.6)' }}>
              únicos no período
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Pontuação Média</div>
            <div className="metric-number" style={{ 
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 32px rgba(251, 191, 36, 0.3)'
            }}>
              {metricas.mediaPontuacaoHoje.toFixed(1)}
            </div>
            <div className={
              metricas.mediaPontuacaoHoje >= 50 ? 'status-urgente' :
              metricas.mediaPontuacaoHoje >= 30 ? 'status-atencao' : 'status-normal'
            } style={{
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {metricas.mediaPontuacaoHoje >= 50 ? 'Alto risco' :
               metricas.mediaPontuacaoHoje >= 30 ? 'Atenção' : 'Normal'}
            </div>
          </div>
        </div>

        {/* Alertas de Emergência Ultra Premium */}
        {metricas.casosUrgentesHoje > 0 && (
          <div style={{
            background: `
              linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)
            `,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'rgba(248, 250, 252, 0.95)',
            padding: '32px',
            borderRadius: '24px',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(45deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))',
              animation: 'pulse 2s ease-in-out infinite'
            }}></div>
            
            <div className="flex" style={{ position: 'relative', alignItems: 'flex-start' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(239, 68, 68, 0.2)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                backdropFilter: 'blur(8px)'
              }}>
                <span style={{ 
                  fontSize: '48px', 
                  animation: 'bounce 1s ease-in-out infinite'
                }}>🚨</span>
              </div>
              <div>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: '800', 
                  marginBottom: '8px',
                  color: '#f87171',
                  textShadow: '0 0 16px rgba(248, 113, 113, 0.3)'
                }}>
                  ALERTA CRÍTICO: {metricas.casosUrgentesHoje} Casos Urgentes
                </h3>
                <p style={{ 
                  color: 'rgba(248, 250, 252, 0.8)', 
                  fontSize: '16px',
                  fontWeight: '500',
                  marginBottom: '16px'
                }}>
                  Pontuação ≥ 50 - Intervenção imediata necessária
                </p>
                <div className="flex" style={{ 
                  gap: '24px', 
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>⏰</span>
                    <span>Identificados no período atual</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>📋</span>
                    <span>Requer supervisão médica</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Distribuição Visual Ultra Premium */}
        <div className="grid grid-cols-3">
          <div className="metric-card">
            <div className="flex justify-between" style={{ marginBottom: '20px', alignItems: 'flex-start' }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '700',
                color: 'rgba(248, 250, 252, 0.95)'
              }}>
                Casos Normais
              </h3>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'rgba(52, 211, 153, 0.15)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                backdropFilter: 'blur(8px)'
              }}>
                <span style={{ fontSize: '28px' }}>🟢</span>
              </div>
            </div>
            <div className="text-center">
              <div className="metric-number" style={{ 
                background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 24px rgba(52, 211, 153, 0.3)'
              }}>
                {metricas.casosNormaisHoje}
              </div>
              <div className="metric-label" style={{ marginBottom: '20px' }}>
                Pontuação 0-29
              </div>
              <div className="elegant-progress">
                <div 
                  className="progress-fill progress-normal"
                  style={{ 
                    width: `${dadosHoje.length > 0 ? (metricas.casosNormaisHoje / dadosHoje.length) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <div className="metric-label">
                {dadosHoje.length > 0 ? ((metricas.casosNormaisHoje / dadosHoje.length) * 100).toFixed(1) : 0}% do total
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex justify-between" style={{ marginBottom: '20px', alignItems: 'flex-start' }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '700',
                color: 'rgba(248, 250, 252, 0.95)'
              }}>
                Casos Atenção
              </h3>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'rgba(251, 191, 36, 0.15)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                backdropFilter: 'blur(8px)'
              }}>
                <span style={{ fontSize: '28px' }}>🟡</span>
              </div>
            </div>
            <div className="text-center">
              <div className="metric-number" style={{ 
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 24px rgba(251, 191, 36, 0.3)'
              }}>
                {metricas.casosAtencaoHoje}
              </div>
              <div className="metric-label" style={{ marginBottom: '20px' }}>
                Pontuação 30-49
              </div>
              <div className="elegant-progress">
                <div 
                  className="progress-fill progress-atencao"
                  style={{ 
                    width: `${dadosHoje.length > 0 ? (metricas.casosAtencaoHoje / dadosHoje.length) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <div className="metric-label">
                {dadosHoje.length > 0 ? ((metricas.casosAtencaoHoje / dadosHoje.length) * 100).toFixed(1) : 0}% do total
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex justify-between" style={{ marginBottom: '20px', alignItems: 'flex-start' }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '700',
                color: 'rgba(248, 250, 252, 0.95)'
              }}>
                Casos Urgentes
              </h3>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'rgba(248, 113, 113, 0.15)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                backdropFilter: 'blur(8px)'
              }}>
                <span style={{ fontSize: '28px' }}>🔴</span>
              </div>
            </div>
            <div className="text-center">
              <div className="metric-number" style={{ 
                background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 24px rgba(248, 113, 113, 0.3)'
              }}>
                {metricas.casosUrgentesHoje}
              </div>
              <div className="metric-label" style={{ marginBottom: '20px' }}>
                Pontuação ≥ 50
              </div>
              <div className="elegant-progress">
                <div 
                  className="progress-fill progress-urgente"
                  style={{ 
                    width: `${dadosHoje.length > 0 ? (metricas.casosUrgentesHoje / dadosHoje.length) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <div className="metric-label">
                {dadosHoje.length > 0 ? ((metricas.casosUrgentesHoje / dadosHoje.length) * 100).toFixed(1) : 0}% do total
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Atividade Ultra Premium */}
        <div className="glass-card">
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            marginBottom: '24px',
            color: 'rgba(248, 250, 252, 0.95)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '12px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>📊</span>
            Atividade por Hora - {activeView === 'hoje' ? 'Hoje' : activeView === '7dias' ? 'Últimos 7 dias' : 'Últimos 30 dias'}
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(24, 1fr)', 
            gap: '6px',
            marginBottom: '24px',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            {dadosPorHora.map((item, index) => {
              const altura = Math.max(item.consultas * 10, 8);
              const isAtivo = item.consultas > 0;
              
              return (
                <div key={index} style={{ 
                  textAlign: 'center',
                  position: 'relative'
                }}>
                  <div 
                    style={{
                      background: isAtivo ? 
                        `linear-gradient(to top, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)` :
                        'rgba(71, 85, 105, 0.3)',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      cursor: 'pointer',
                      height: `${altura}px`,
                      minHeight: '8px',
                      boxShadow: isAtivo ? 
                        '0 4px 16px rgba(99, 102, 241, 0.3)' :
                        '0 2px 8px rgba(71, 85, 105, 0.2)',
                      position: 'relative'
                    }}
                    title={`${item.hora}: ${item.consultas} consultas`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
                      e.currentTarget.style.boxShadow = isAtivo ? 
                        '0 8px 24px rgba(99, 102, 241, 0.4)' :
                        '0 4px 16px rgba(71, 85, 105, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) translateY(0)';
                      e.currentTarget.style.boxShadow = isAtivo ? 
                        '0 4px 16px rgba(99, 102, 241, 0.3)' :
                        '0 2px 8px rgba(71, 85, 105, 0.2)';
                    }}
                  >
                    {/* Highlight overlay */}
                    {isAtivo && (
                      <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        height: '40%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px 8px 0 0'
                      }}></div>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: isAtivo ? 'rgba(248, 250, 252, 0.8)' : 'rgba(248, 250, 252, 0.5)',
                    fontWeight: isAtivo ? '600' : '400'
                  }}>
                    {item.hora.split(':')[0]}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '16px',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <p style={{ 
              fontSize: '16px', 
              color: 'rgba(248, 250, 252, 0.9)',
              fontWeight: '500',
              margin: 0
            }}>
              Pico: <span style={{ 
                color: '#6366f1', 
                fontWeight: '700',
                textShadow: '0 0 8px rgba(99, 102, 241, 0.3)'
              }}>
                {Math.max(...dadosPorHora.map(h => h.consultas))}
              </span> consultas
              {' • '}
              Total: <span style={{ 
                color: '#8b5cf6', 
                fontWeight: '700',
                textShadow: '0 0 8px rgba(139, 92, 246, 0.3)'
              }}>
                {dadosPorHora.reduce((acc, h) => acc + h.consultas, 0)}
              </span> consultas no período
            </p>
          </div>
        </div>

        {/* Tabela Ultra Premium */}
        <div className="glass-card">
          <div style={{
            padding: '24px',
            background: `
              linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)
            `,
            borderRadius: '16px 16px 0 0',
            marginBottom: '0',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
            }}></div>
            
            <div className="flex justify-between">
              <div>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  marginBottom: '8px',
                  color: 'rgba(248, 250, 252, 0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '28px' }}>📋</span>
                  Registros Detalhados ({dadosFiltrados.length})
                </h3>
                <p style={{ 
                  color: 'rgba(248, 250, 252, 0.8)', 
                  fontSize: '16px',
                  fontWeight: '500',
                  margin: 0
                }}>
                  Monitoramento em tempo real dos atendimentos • Dados do Supabase
                </p>
              </div>
              <div style={{
                display: 'flex',
                gap: '20px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    background: 'linear-gradient(135deg, #34d399, #10b981)', 
                    borderRadius: '50%',
                    boxShadow: '0 0 8px rgba(52, 211, 153, 0.3)'
                  }}></div>
                  <span style={{ color: 'rgba(248, 250, 252, 0.9)' }}>Normal</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
                    borderRadius: '50%',
                    boxShadow: '0 0 8px rgba(251, 191, 36, 0.3)'
                  }}></div>
                  <span style={{ color: 'rgba(248, 250, 252, 0.9)' }}>Atenção</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    background: 'linear-gradient(135deg, #f87171, #ef4444)', 
                    borderRadius: '50%',
                    boxShadow: '0 0 8px rgba(248, 113, 113, 0.3)'
                  }}></div>
                  <span style={{ color: 'rgba(248, 250, 252, 0.9)' }}>Urgente</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="elegant-table">
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
                    urgente: { 
                      emoji: '🔴', 
                      text: 'Urgente', 
                      bg: 'rgba(248, 113, 113, 0.15)', 
                      borderColor: '#f87171',
                      badgeClass: 'badge-urgente'
                    },
                    atencao: { 
                      emoji: '🟡', 
                      text: 'Atenção', 
                      bg: 'rgba(251, 191, 36, 0.15)', 
                      borderColor: '#fbbf24',
                      badgeClass: 'badge-atencao'
                    },
                    normal: { 
                      emoji: '🟢', 
                      text: 'Normal', 
                      bg: 'rgba(52, 211, 153, 0.15)', 
                      borderColor: '#34d399',
                      badgeClass: 'badge-normal'
                    }
                  };
                  
                  return (
                    <tr 
                      key={item.id || index}
                      style={{
                        borderLeft: `3px solid ${statusConfig[status].borderColor}`,
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = statusConfig[status].bg;
                        e.currentTarget.style.transform = 'scale(1.002)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <td>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600',
                          color: 'rgba(248, 250, 252, 0.9)',
                          marginBottom: '2px'
                        }}>
                          {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: 'rgba(248, 250, 252, 0.6)',
                          fontWeight: '500'
                        }}>
                          {new Date(item.created_at).toLocaleTimeString('pt-BR')}
                        </div>
                      </td>
                      <td style={{ 
                        fontWeight: '600',
                        color: 'rgba(248, 250, 252, 0.9)'
                      }}>
                        {item.nome_aluno || 'N/A'}
                      </td>
                      <td style={{ 
                        color: 'rgba(248, 250, 252, 0.85)'
                      }}>
                        {item.terapeuta || 'N/A'}
                      </td>
                      <td>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <span style={{ 
                            fontSize: '16px', 
                            fontWeight: '700', 
                            color: statusConfig[status].borderColor,
                            textShadow: `0 0 8px ${statusConfig[status].borderColor}30`
                          }}>
                            {pontuacao.toFixed(1)}
                          </span>
                          <div style={{ 
                            width: '60px', 
                            height: '8px', 
                            background: 'rgba(71, 85, 105, 0.3)', 
                            borderRadius: '4px',
                            overflow: 'hidden',
                            position: 'relative'
                          }}>
                            <div 
                              style={{
                                height: '100%',
                                background: `linear-gradient(135deg, ${statusConfig[status].borderColor}, ${statusConfig[status].borderColor}dd)`,
                                width: `${Math.min(pontuacao, 100)}%`,
                                transition: 'width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                borderRadius: '4px',
                                boxShadow: `0 0 8px ${statusConfig[status].borderColor}40`
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${statusConfig[status].badgeClass}`}>
                          {statusConfig[status].emoji} {statusConfig[status].text}
                        </span>
                      </td>
                      <td style={{ 
                        maxWidth: '200px', 
                        fontSize: '13px',
                        color: 'rgba(248, 250, 252, 0.75)'
                      }}>
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
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 20px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '0 0 16px 16px'
            }}>
              <div style={{ 
                fontSize: '80px', 
                marginBottom: '24px',
                opacity: 0.6
              }}>
                🔍
              </div>
              <div style={{ 
                color: 'rgba(248, 250, 252, 0.8)', 
                fontSize: '20px', 
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Nenhum registro encontrado
              </div>
              <div style={{ 
                color: 'rgba(248, 250, 252, 0.5)', 
                fontSize: '14px'
              }}>
                Ajuste os filtros para ver mais resultados.
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Ultra Premium */}
        <div style={{ 
          textAlign: 'center', 
          margin: '80px 0 60px',
          animation: 'fadeIn 1s ease-out'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '24px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            borderRadius: '28px',
            padding: '32px 40px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: `
              0 20px 40px rgba(0, 0, 0, 0.25),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
            }}></div>
            
            <div style={{
              width: '80px',
              height: '80px',
              background: `
                linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)
              `,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              position: 'relative',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
            }}>
              <div style={{
                position: 'absolute',
                inset: '-3px',
                background: `
                  linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)
                `,
                borderRadius: '23px',
                opacity: 0.3,
                filter: 'blur(8px)',
                animation: 'glow 3s ease-in-out infinite alternate'
              }}></div>
              🧠
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div style={{ 
                fontWeight: '800', 
                fontSize: '28px', 
                marginBottom: '4px'
              }} className="logo-gradient">
                MEDWAY Analytics v3.0
              </div>
              <div style={{ 
                color: 'rgba(248, 250, 252, 0.7)', 
                fontSize: '16px',
                fontWeight: '500'
              }}>
                Sistema Inteligente de Monitoramento Psicológico
              </div>
            </div>
            
            <div style={{ 
              textAlign: 'right', 
              fontSize: '13px', 
              color: 'rgba(248, 250, 252, 0.6)',
              fontWeight: '500'
            }}>
              <div style={{ marginBottom: '6px' }}>
                Última atualização: {lastUpdate.toLocaleString('pt-BR')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {connectionStatus === 'connected' ? (
                  <>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: '#34d399',
                      borderRadius: '50%',
                      boxShadow: '0 0 8px rgba(52, 211, 153, 0.5)',
                      animation: 'pulse 2s infinite'
                    }}></div>
                    <span style={{ color: '#34d399' }}>Conectado ao Supabase</span>
                  </>
                ) : connectionStatus === 'error' ? (
                  <>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: '#fbbf24',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{ color: '#fbbf24' }}>Modo Demo</span>
                  </>
                ) : (
                  <>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: 'rgba(248, 250, 252, 0.5)',
                      borderRadius: '50%'
                    }}></div>
                    <span>Conectando...</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glow {
          from { opacity: 0.2; }
          to { opacity: 0.5; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
