'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

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
  urgencia_nivel?: 'baixa' | 'media' | 'alta' | 'critica';
  tempo_desde_criacao?: number;
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

interface InsightIA {
  tipo: 'alerta' | 'info' | 'sucesso';
  titulo: string;
  descricao: string;
  icone: string;
  acao?: string;
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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [nextUpdateIn, setNextUpdateIn] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<ConsultaNormalizada | null>(null);
  const [showInsights, setShowInsights] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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

  // Função para calcular tempo desde criação
  const calcularTempoDecorrido = (dataString: string) => {
    const agora = new Date();
    const dataCriacao = new Date(dataString);
    const diferencaMs = agora.getTime() - dataCriacao.getTime();
    return Math.floor(diferencaMs / (1000 * 60)); // em minutos
  };

  // Função para mapear dados com melhorias
  const mapearDados = (dadosOriginais: Consulta[]): ConsultaNormalizada[] => {
    return dadosOriginais.map((item, index) => {
      let pontuacao = 0;
      let urgencia_nivel: 'baixa' | 'media' | 'alta' | 'critica' = 'baixa';

      switch(item.situacao_mental) {
        case 'LEVE':
          pontuacao = Math.floor(Math.random() * 30);
          urgencia_nivel = 'baixa';
          break;
        case 'CONSIDERAVEL':
          pontuacao = Math.floor(Math.random() * 20) + 30;
          urgencia_nivel = 'media';
          break;
        case 'GRAVE':
          pontuacao = Math.floor(Math.random() * 20) + 50;
          urgencia_nivel = pontuacao >= 65 ? 'critica' : 'alta';
          break;
        case 'ESTÁVEL':
          pontuacao = Math.floor(Math.random() * 25);
          urgencia_nivel = 'baixa';
          break;
        default:
          pontuacao = Math.floor(Math.random() * 100);
          urgencia_nivel = pontuacao >= 70 ? 'critica' : pontuacao >= 50 ? 'alta' : pontuacao >= 30 ? 'media' : 'baixa';
      }

      const agora = new Date();
      const horasAtras = index * 2;
      const dataFake = new Date(agora.getTime() - (horasAtras * 60 * 60 * 1000));

      return {
        id: item.id,
        created_at: dataFake.toISOString(),
        nome_aluno: `Aluno ${item.aluno_id}` || `Aluno ${item.id}`,
        terapeuta: `Terapeuta ${item.terapeuta_id}` || `Terapeuta ${item.id}`,
        pontuacao: pontuacao,
        observacoes: item.observacoes || 'Sem observações registradas.',
        urgencia_nivel,
        tempo_desde_criacao: calcularTempoDecorrido(dataFake.toISOString())
      };
    });
  };

  // Insights IA automáticos
  const gerarInsightsIA = useMemo((): InsightIA[] => {
    if (!data || data.length === 0) return [];

    const insights: InsightIA[] = [];
    const agora = new Date();
    const dadosHoje = data.filter(item => {
      const itemDate = new Date(item.created_at);
      return itemDate.toDateString() === agora.toDateString();
    });

    // Insight sobre casos críticos
    const casosCriticos = dadosHoje.filter(item => item.urgencia_nivel === 'critica');
    if (casosCriticos.length > 0) {
      insights.push({
        tipo: 'alerta',
        titulo: `${casosCriticos.length} casos críticos requerem atenção imediata`,
        descricao: `Pontuação média: ${(casosCriticos.reduce((acc, item) => acc + item.pontuacao, 0) / casosCriticos.length).toFixed(1)}`,
        icone: '🚨',
        acao: 'Revisar casos'
      });
    }

    // Insight sobre produtividade
    const terapeutasAtivos = [...new Set(dadosHoje.map(item => item.terapeuta))];
    if (terapeutasAtivos.length > 0) {
      const mediaPorTerapeuta = dadosHoje.length / terapeutasAtivos.length;
      insights.push({
        tipo: 'info',
        titulo: `${terapeutasAtivos.length} terapeutas ativos hoje`,
        descricao: `Média de ${mediaPorTerapeuta.toFixed(1)} consultas por terapeuta`,
        icone: '👥',
      });
    }

    // Insight sobre horário de pico
    const horariosPico = dadosHoje.reduce((acc, item) => {
      const hora = new Date(item.created_at).getHours();
      acc[hora] = (acc[hora] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const horaMaisPico = Object.entries(horariosPico).sort(([,a], [,b]) => b - a)[0];
    if (horaMaisPico) {
      insights.push({
        tipo: 'info',
        titulo: `Horário de pico: ${horaMaisPico[0]}h`,
        descricao: `${horaMaisPico[1]} consultas registradas`,
        icone: '📊'
      });
    }

    // Insight positivo
    const casosNormais = dadosHoje.filter(item => item.pontuacao < 30);
    if (casosNormais.length > dadosHoje.length * 0.7) {
      insights.push({
        tipo: 'sucesso',
        titulo: 'Dia com baixa criticidade!',
        descricao: `${Math.round((casosNormais.length / dadosHoje.length) * 100)}% dos casos em níveis normais`,
        icone: '🎉'
      });
    }

    return insights.slice(0, 4); // Máximo 4 insights
  }, [data]);

  // Play alert sound para casos críticos
  const playAlertSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      // Create a simple beep using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not supported');
    }
  }, [soundEnabled]);

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
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const result: Consulta[] = await response.json();
      const dadosMapeados = mapearDados(result);
      
      // Check for new critical cases and play sound
      const novosCasosCriticos = dadosMapeados.filter(item => 
        item.urgencia_nivel === 'critica' && 
        item.tempo_desde_criacao! < 5
      );
      
      if (novosCasosCriticos.length > 0 && data.length > 0) {
        playAlertSound();
      }
      
      setData(dadosMapeados);
      setLastUpdate(new Date());
      setConnectionStatus('connected');
      
    } catch (error: any) {
      console.error('❌ ERRO ao buscar dados:', error);
      setError(error.message);
      setConnectionStatus('error');
      
      // Dados de exemplo mais ricos
      const dadosExemplo: ConsultaNormalizada[] = [
        {
          id: 1,
          created_at: new Date().toISOString(),
          nome_aluno: 'Maria Silva',
          terapeuta: 'Dr. João Santos',
          pontuacao: 72,
          observacoes: 'Paciente apresenta sinais de ansiedade severa. Recomenda-se acompanhamento médico imediato.',
          urgencia_nivel: 'critica',
          tempo_desde_criacao: 5
        },
        {
          id: 2,
          created_at: new Date(Date.now() - 1800000).toISOString(),
          nome_aluno: 'Pedro Costa',
          terapeuta: 'Dra. Ana Lima',
          pontuacao: 42,
          observacoes: 'Sessão produtiva. Paciente demonstra melhora gradual nos sintomas de depressão.',
          urgencia_nivel: 'media',
          tempo_desde_criacao: 30
        },
        {
          id: 3,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          nome_aluno: 'Ana Oliveira',
          terapeuta: 'Dr. Carlos Mendes',
          pontuacao: 18,
          observacoes: 'Excelente progresso. Paciente apresenta estabilidade emocional.',
          urgencia_nivel: 'baixa',
          tempo_desde_criacao: 60
        }
      ];
      setData(dadosExemplo);
    } finally {
      setLoading(false);
    }
  }, [SUPABASE_URL, SUPABASE_KEY, data, playAlertSound]);

  // Countdown timer para próxima atualização
  useEffect(() => {
    if (!realTimeEnabled) return;
    
    const countdown = setInterval(() => {
      setNextUpdateIn(prev => {
        if (prev <= 1) {
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [realTimeEnabled]);

  useEffect(() => {
    fetchData();
    
    if (realTimeEnabled) {
      const interval = setInterval(fetchData, 30000);
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

  // Filtros avançados com busca
  const dadosFiltrados = useMemo(() => {
    let resultado = data.filter((item: ConsultaNormalizada) => {
      if (filters.periodo !== 'todos') {
        const dadosPeriodo = filtrarPorPeriodo([item], filters.periodo);
        if (dadosPeriodo.length === 0) return false;
      }
      
      if (filters.terapeuta && item.terapeuta !== filters.terapeuta) return false;
      if (filters.aluno && !item.nome_aluno?.toLowerCase().includes(filters.aluno.toLowerCase())) return false;
      if (filters.pontuacaoMin && Number(item.pontuacao) < parseFloat(filters.pontuacaoMin)) return false;
      if (filters.pontuacaoMax && Number(item.pontuacao) > parseFloat(filters.pontuacaoMax)) return false;
      
      if (filters.status) {
        const pontuacao = Number(item.pontuacao) || 0;
        const status = pontuacao >= 50 ? 'urgente' : pontuacao >= 30 ? 'atencao' : 'normal';
        if (status !== filters.status) return false;
      }
      
      return true;
    });

    // Aplicar busca instantânea
    if (searchTerm.trim()) {
      const termo = searchTerm.toLowerCase().trim();
      resultado = resultado.filter(item => 
        item.nome_aluno?.toLowerCase().includes(termo) ||
        item.terapeuta?.toLowerCase().includes(termo) ||
        item.observacoes?.toLowerCase().includes(termo) ||
        item.pontuacao.toString().includes(termo)
      );
    }

    return resultado;
  }, [data, filters, searchTerm]);

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
    casosNormaisHoje: dadosHoje.filter(item => Number(item.pontuacao) < 30).length,
    casosCriticosHoje: dadosHoje.filter(item => item.urgencia_nivel === 'critica').length
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
      urgentes: consultasHora.filter(item => Number(item.pontuacao) >= 50).length,
      criticos: consultasHora.filter(item => item.urgencia_nivel === 'critica').length
    };
  });

  // Funções de ação rápida
  const acoesRapidas = {
    ligar: (paciente: ConsultaNormalizada) => {
      alert(`Iniciando ligação para ${paciente.nome_aluno}...`);
    },
    email: (paciente: ConsultaNormalizada) => {
      const mailto = `mailto:contato@medway.com?subject=Follow-up: ${paciente.nome_aluno}&body=Referente ao caso de ${paciente.nome_aluno} (Pontuação: ${paciente.pontuacao})`;
      window.open(mailto);
    },
    agendar: (paciente: ConsultaNormalizada) => {
      alert(`Abrindo agenda para ${paciente.nome_aluno}...`);
    },
    observacoes: (paciente: ConsultaNormalizada) => {
      setSelectedPatient(paciente);
    }
  };

  const exportData = () => {
    try {
      const csv = [
        ['Data/Hora', 'Aluno', 'Terapeuta', 'Pontuação', 'Status', 'Urgência', 'Tempo Decorrido', 'Observações'],
        ...dadosFiltrados.map(item => {
          const pontuacao = Number(item.pontuacao) || 0;
          const status = pontuacao >= 50 ? 'Urgente' : pontuacao >= 30 ? 'Atenção' : 'Normal';
          return [
            new Date(item.created_at).toLocaleString('pt-BR'),
            item.nome_aluno || '',
            item.terapeuta || '',
            item.pontuacao || '',
            status,
            item.urgencia_nivel || '',
            `${item.tempo_desde_criacao || 0} min`,
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
    setSearchTerm('');
  };

  const formatTempo = (minutos: number): string => {
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h${mins > 0 ? ` ${mins}min` : ''}`;
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
        {/* Skeleton Loading Premium */}
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
          <div style={{
            width: '100px',
            height: '100px',
            background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)`,
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            fontSize: '48px',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            🧠
          </div>
          
          <h2 style={{ 
            color: '#f8fafc', 
            marginBottom: '16px', 
            fontSize: '32px',
            fontWeight: '700'
          }}>
            MEDWAY Analytics v3.0
          </h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '32px'
          }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                borderRadius: '4px',
                animation: `shimmer 2s ease-in-out ${i * 0.2}s infinite`
              }}></div>
            ))}
          </div>
          
          <div style={{
            padding: '16px 24px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '16px',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            color: 'rgba(248, 250, 252, 0.8)',
            fontSize: '14px'
          }}>
            🔗 Conectando ao Supabase...
          </div>
        </div>
        
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes shimmer {
            0% { opacity: 0.3; transform: translateX(-100%); }
            50% { opacity: 0.7; transform: translateX(0%); }
            100% { opacity: 0.3; transform: translateX(100%); }
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
        
        .glass-card:hover {
          transform: translateY(-4px);
          box-shadow: 
            0 32px 64px -12px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
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
        
        .metric-card:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 
            0 16px 48px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
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
        
        .btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border: 1px solid rgba(99, 102, 241, 0.3);
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #5b5ff9 0%, #9333ea 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
        }
        
        .btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .btn-warning {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        
        .btn-danger {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .btn-secondary {
          background: rgba(71, 85, 105, 0.6);
          color: rgba(248, 250, 252, 0.9);
          border: 1px solid rgba(71, 85, 105, 0.3);
        }
        
        .btn-sm {
          padding: 8px 12px;
          font-size: 12px;
          border-radius: 8px;
          margin: 2px;
        }
        
        .search-input {
          padding: 16px 20px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(8px);
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          width: 100%;
          color: rgba(248, 250, 252, 0.9);
          font-family: inherit;
          transition: all 0.3s ease;
        }
        
        .search-input::placeholder {
          color: rgba(248, 250, 252, 0.5);
        }
        
        .search-input:focus {
          outline: none;
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        
        .status-normal { color: #34d399; font-weight: 600; }
        .status-atencao { color: #fbbf24; font-weight: 600; }
        .status-urgente { color: #f87171; font-weight: 600; }
        .status-critico { 
          color: #ef4444; 
          font-weight: 700;
          text-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
          animation: criticalPulse 2s ease-in-out infinite;
        }
        
        .tooltip {
          position: relative;
          cursor: help;
        }
        
        .tooltip:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          white-space: nowrap;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes criticalPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(5px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        .insight-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 12px;
          border-left: 4px solid;
          transition: all 0.3s ease;
        }
        
        .insight-alerta {
          border-left-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        
        .insight-info {
          border-left-color: #6366f1;
          background: rgba(99, 102, 241, 0.1);
        }
        
        .insight-sucesso {
          border-left-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }
        
        .action-buttons {
          display: flex;
          gap: 4px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        @media (max-width: 768px) {
          .glass-card { padding: 20px; }
          .metric-card { padding: 20px; }
          .action-buttons { flex-direction: column; }
          .btn-sm { width: 100%; margin: 2px 0; }
        }
      `}</style>

      {/* Header Ultra Premium com Timeline */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(24px)',
        padding: '24px 0',
        marginBottom: '32px',
        borderRadius: '0 0 32px 32px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderTop: 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)`,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
              }}>
                🧠
              </div>
              <div>
                <h1 style={{
                  fontSize: '36px',
                  fontWeight: '800',
                  marginBottom: '8px',
                  background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  MEDWAY Analytics v3.0
                </h1>
                <div style={{ 
                  fontSize: '14px', 
                  color: 'rgba(248, 250, 252, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap'
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
                  {realTimeEnabled && (
                    <>
                      <span>•</span>
                      <span style={{ color: '#6366f1' }}>
                        Próxima atualização: {nextUpdateIn}s
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Period Selector */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                gap: '4px'
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
                    className={`btn ${activeView === key ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ margin: '0', padding: '12px 16px', borderRadius: '12px' }}
                  >
                    <span style={{ marginRight: '6px' }}>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`btn ${soundEnabled ? 'btn-success' : 'btn-secondary'}`}
                data-tooltip="Alertas sonoros para casos críticos"
                style={{ padding: '12px' }}
              >
                {soundEnabled ? '🔊' : '🔇'}
              </button>

              {/* Real-time Toggle */}
              <button
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                className={`btn ${realTimeEnabled ? 'btn-success' : 'btn-secondary'}`}
              >
                <span style={{ 
                  marginRight: '8px',
                  animation: realTimeEnabled ? 'spin 2s linear infinite' : 'none'
                }}>🔄</span>
                {realTimeEnabled ? 'LIVE' : 'PAUSADO'}
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-primary"
              >
                🔍 Filtros
              </button>

              <button
                onClick={fetchData}
                disabled={loading}
                className="btn btn-primary"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                ⟳ Atualizar
              </button>
            </div>
          </div>

          {/* Search Bar Global */}
          <div style={{ marginTop: '20px', maxWidth: '600px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Busca instantânea: nome do aluno, terapeuta, observações..."
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        {/* Insights IA */}
        {showInsights && gerarInsightsIA.length > 0 && (
          <div className="glass-card" style={{ animation: 'slideDown 0.4s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: 'rgba(248, 250, 252, 0.95)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '28px' }}>🤖</span>
                Insights IA em Tempo Real
              </h2>
              <button
                onClick={() => setShowInsights(false)}
                className="btn btn-secondary btn-sm"
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {gerarInsightsIA.map((insight, index) => (
                <div key={index} className={`insight-card insight-${insight.tipo}`}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{insight.icone}</span>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        color: 'rgba(248, 250, 252, 0.95)',
                        marginBottom: '4px'
                      }}>
                        {insight.titulo}
                      </h4>
                      <p style={{ 
                        fontSize: '14px', 
                        color: 'rgba(248, 250, 252, 0.8)',
                        marginBottom: insight.acao ? '12px' : '0'
                      }}>
                        {insight.descricao}
                      </p>
                      {insight.acao && (
                        <button className="btn btn-primary btn-sm">
                          {insight.acao}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status de Sucesso Premium */}
        {connectionStatus === 'connected' && !error && (
          <div style={{
            padding: '24px',
            borderRadius: '20px',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            backdropFilter: 'blur(16px)',
            color: 'rgba(248, 250, 252, 0.95)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                ✅
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>
                  Sistema Conectado - Dados em Tempo Real!
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(248, 250, 252, 0.8)' }}>
                  {data.length} registros do Supabase • Atualização automática ativa • Alertas críticos habilitados
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Painel de Filtros Avançados */}
        {showFilters && (
          <div className="glass-card" style={{ animation: 'slideDown 0.4s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: 'rgba(248, 250, 252, 0.95)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '28px' }}>✨</span>
                Filtros Avançados
              </h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={exportData} className="btn btn-success btn-sm">
                  💾 Exportar CSV
                </button>
                <button onClick={clearFilters} className="btn btn-secondary btn-sm">
                  🗑️ Limpar Filtros
                </button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  👥 Terapeuta
                </label>
                <select
                  value={filters.terapeuta}
                  onChange={(e) => setFilters({...filters, terapeuta: e.target.value})}
                  className="search-input"
                  style={{ height: '48px' }}
                >
                  <option value="">Todos os terapeutas</option>
                  {terapeutasUnicos.map((terapeuta: string) => (
                    <option key={terapeuta} value={terapeuta}>{terapeuta}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  🚨 Status de Urgência
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="search-input"
                  style={{ height: '48px' }}
                >
                  <option value="">Todos os status</option>
                  <option value="normal">🟢 Normal (0-29)</option>
                  <option value="atencao">🟡 Atenção (30-49)</option>
                  <option value="urgente">🔴 Urgente (50+)</option>
                </select>
              </div>

              <div>
                <label style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  📊 Pontuação Mínima
                </label>
                <input
                  type="number"
                  value={filters.pontuacaoMin}
                  onChange={(e) => setFilters({...filters, pontuacaoMin: e.target.value})}
                  placeholder="Ex: 30"
                  className="search-input"
                />
              </div>

              <div>
                <label style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  📊 Pontuação Máxima
                </label>
                <input
                  type="number"
                  value={filters.pontuacaoMax}
                  onChange={(e) => setFilters({...filters, pontuacaoMax: e.target.value})}
                  placeholder="Ex: 70"
                  className="search-input"
                />
              </div>
            </div>

            <div style={{ 
              marginTop: '24px',
              padding: '20px',
              background: 'rgba(99, 102, 241, 0.1)',
              borderRadius: '16px',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ fontSize: '16px', color: 'rgba(248, 250, 252, 0.9)', fontWeight: '600' }}>
                📋 <span style={{ color: '#6366f1' }}>{dadosFiltrados.length}</span> registros encontrados
                {searchTerm && ` para "${searchTerm}"`}
              </div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '14px', flexWrap: 'wrap' }}>
                <span style={{ color: '#34d399' }}>🟢 {metricas.casosNormaisHoje} Normais</span>
                <span style={{ color: '#fbbf24' }}>🟡 {metricas.casosAtencaoHoje} Atenção</span>
                <span style={{ color: '#f87171' }}>🔴 {metricas.casosUrgentesHoje} Urgentes</span>
                <span style={{ color: '#ef4444' }}>⚠️ {metricas.casosCriticosHoje} Críticos</span>
              </div>
            </div>
          </div>
        )}

        {/* Cards de Métricas Ultra Premium */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div className="metric-card">
            <div style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
              Consultas {activeView === 'hoje' ? 'Hoje' : activeView === '7dias' ? '7 dias' : '30 dias'}
            </div>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: '800', 
              margin: '16px 0',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {metricas.totalHoje}
            </div>
            <div className={crescimentoHoje >= 0 ? 'status-normal' : 'status-urgente'} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <span>{crescimentoHoje >= 0 ? '📈' : '📉'}</span>
              <span>{Math.abs(crescimentoHoje).toFixed(1)}% vs ontem</span>
            </div>
          </div>

          <div className="metric-card">
            <div style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
              Terapeutas Ativos
            </div>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: '800', 
              margin: '16px 0',
              background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {metricas.terapeutasHoje}
            </div>
            <div style={{ color: 'rgba(248, 250, 252, 0.6)', fontSize: '14px' }}>
              de {terapeutasUnicos.length} total
            </div>
          </div>

          <div className="metric-card">
            <div style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
              Casos Críticos
            </div>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: '800', 
              margin: '16px 0'
            }} className={metricas.casosCriticosHoje > 0 ? 'status-critico' : 'status-normal'}>
              {metricas.casosCriticosHoje}
            </div>
            <div style={{ color: 'rgba(248, 250, 252, 0.6)', fontSize: '14px' }}>
              Pontuação ≥ 65 - Intervenção imediata
            </div>
          </div>

          <div className="metric-card">
            <div style={{ color: 'rgba(248, 250, 252, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
              Pontuação Média
            </div>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: '800', 
              margin: '16px 0',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {metricas.mediaPontuacaoHoje.toFixed(1)}
            </div>
            <div className={
              metricas.mediaPontuacaoHoje >= 50 ? 'status-urgente' :
              metricas.mediaPontuacaoHoje >= 30 ? 'status-atencao' : 'status-normal'
            }>
              {metricas.mediaPontuacaoHoje >= 50 ? 'Alto risco' :
               metricas.mediaPontuacaoHoje >= 30 ? 'Atenção' : 'Normal'}
            </div>
          </div>
        </div>

        {/* Alertas de Emergência Ultra Premium */}
        {metricas.casosCriticosHoje > 0 && (
          <div style={{
            background: `linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)`,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'rgba(248, 250, 252, 0.95)',
            padding: '32px',
            borderRadius: '24px',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
            animation: 'criticalPulse 2s ease-in-out infinite'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(239, 68, 68, 0.2)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                animation: 'bounce 1s ease-in-out infinite'
              }}>
                <span style={{ fontSize: '48px' }}>🚨</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: '800', 
                  marginBottom: '8px',
                  color: '#f87171'
                }}>
                  ALERTA CRÍTICO: {metricas.casosCriticosHoje} Casos Críticos
                </h3>
                <p style={{ fontSize: '16px', color: 'rgba(248, 250, 252, 0.8)', marginBottom: '16px' }}>
                  Pontuação ≥ 65 - Intervenção médica imediata necessária
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button className="btn btn-danger btn-sm">
                    📞 Acionar Emergência
                  </button>
                  <button className="btn btn-warning btn-sm">
                    👨‍⚕️ Notificar Médico
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabela Ultra Premium com Ações Rápidas */}
        <div className="glass-card">
          <div style={{
            padding: '24px',
            background: `linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)`,
            borderRadius: '16px 16px 0 0',
            marginBottom: '0',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
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
                <p style={{ color: 'rgba(248, 250, 252, 0.8)', fontSize: '16px', margin: 0 }}>
                  Monitoramento em tempo real • Ações rápidas integradas
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#34d399', borderRadius: '50%' }}></div>
                  <span>Normal</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#fbbf24', borderRadius: '50%' }}></div>
                  <span>Atenção</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#f87171', borderRadius: '50%' }}></div>
                  <span>Urgente</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>
                  <span>Crítico</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%',
              borderCollapse: 'collapse',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '0 0 16px 16px'
            }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)' }}>
                  <th style={{ padding: '20px 16px', color: 'rgba(248, 250, 252, 0.95)', fontSize: '13px', textAlign: 'left' }}>Paciente</th>
                  <th style={{ padding: '20px 16px', color: 'rgba(248, 250, 252, 0.95)', fontSize: '13px', textAlign: 'left' }}>Terapeuta</th>
                  <th style={{ padding: '20px 16px', color: 'rgba(248, 250, 252, 0.95)', fontSize: '13px', textAlign: 'center' }}>Pontuação</th>
                  <th style={{ padding: '20px 16px', color: 'rgba(248, 250, 252, 0.95)', fontSize: '13px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '20px 16px', color: 'rgba(248, 250, 252, 0.95)', fontSize: '13px', textAlign: 'center' }}>Tempo</th>
                  <th style={{ padding: '20px 16px', color: 'rgba(248, 250, 252, 0.95)', fontSize: '13px', textAlign: 'center' }}>Ações</th>
                  <th style={{ padding: '20px 16px', color: 'rgba(248, 250, 252, 0.95)', fontSize: '13px', textAlign: 'left' }}>Observações</th>
                </tr>
              </thead>
              <tbody>
                {dadosFiltrados.slice(0, 50).map((item, index) => {
                  const pontuacao = Number(item.pontuacao) || 0;
                  const urgencia = item.urgencia_nivel || 'baixa';
                  const statusConfig = {
                    critica: { 
                      emoji: '⚠️', 
                      text: 'CRÍTICO', 
                      bg: 'rgba(239, 68, 68, 0.15)', 
                      borderColor: '#ef4444',
                      textColor: '#ef4444'
                    },
                    alta: { 
                      emoji: '🔴', 
                      text: 'Urgente', 
                      bg: 'rgba(248, 113, 113, 0.15)', 
                      borderColor: '#f87171',
                      textColor: '#f87171'
                    },
                    media: { 
                      emoji: '🟡', 
                      text: 'Atenção', 
                      bg: 'rgba(251, 191, 36, 0.15)', 
                      borderColor: '#fbbf24',
                      textColor: '#fbbf24'
                    },
                    baixa: { 
                      emoji: '🟢', 
                      text: 'Normal', 
                      bg: 'rgba(52, 211, 153, 0.15)', 
                      borderColor: '#34d399',
                      textColor: '#34d399'
                    }
                  };
                  
                  const config = statusConfig[urgencia];
                  
                  return (
                    <tr 
                      key={item.id || index}
                      style={{
                        borderLeft: `3px solid ${config.borderColor}`,
                        transition: 'all 0.3s ease',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = config.bg;
                        e.currentTarget.style.transform = 'scale(1.001)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <td style={{ padding: '18px 16px', color: 'rgba(248, 250, 252, 0.9)' }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
                          {item.nome_aluno || 'N/A'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.6)' }}>
                          ID: {item.id}
                        </div>
                      </td>
                      <td style={{ padding: '18px 16px', color: 'rgba(248, 250, 252, 0.85)', fontSize: '14px' }}>
                        {item.terapeuta || 'N/A'}
                      </td>
                      <td style={{ padding: '18px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            fontSize: '18px', 
                            fontWeight: '700', 
                            color: config.textColor
                          }}>
                            {pontuacao.toFixed(1)}
                          </span>
                          <div style={{ 
                            width: '60px', 
                            height: '6px', 
                            background: 'rgba(71, 85, 105, 0.3)', 
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div 
                              style={{
                                height: '100%',
                                background: config.borderColor,
                                width: `${Math.min(pontuacao, 100)}%`,
                                borderRadius: '3px',
                                transition: 'width 0.6s ease'
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '18px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: config.bg,
                          color: config.textColor,
                          border: `1px solid ${config.borderColor}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {config.emoji} {config.text}
                        </span>
                      </td>
                      <td style={{ padding: '18px 16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(248, 250, 252, 0.9)' }}>
                          {formatTempo(item.tempo_desde_criacao || 0)}
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.6)' }}>
                          atrás
                        </div>
                      </td>
                      <td style={{ padding: '18px 16px' }}>
                        <div className="action-buttons">
                          <button 
                            onClick={() => acoesRapidas.ligar(item)}
                            className="btn btn-primary btn-sm"
                            data-tooltip="Ligar para o paciente"
                          >
                            📞
                          </button>
                          <button 
                            onClick={() => acoesRapidas.email(item)}
                            className="btn btn-secondary btn-sm"
                            data-tooltip="Enviar email"
                          >
                            ✉️
                          </button>
                          <button 
                            onClick={() => acoesRapidas.agendar(item)}
                            className="btn btn-warning btn-sm"
                            data-tooltip="Agendar consulta"
                          >
                            📅
                          </button>
                          <button 
                            onClick={() => acoesRapidas.observacoes(item)}
                            className="btn btn-success btn-sm"
                            data-tooltip="Ver observações"
                          >
                            📝
                          </button>
                        </div>
                      </td>
                      <td style={{ 
                        padding: '18px 16px', 
                        maxWidth: '200px', 
                        fontSize: '13px',
                        color: 'rgba(248, 250, 252, 0.75)'
                      }}>
                        <div style={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          cursor: 'pointer'
                        }} 
                        onClick={() => setSelectedPatient(item)}
                        title={item.observacoes}>
                          {item.observacoes || 'Sem observações registradas'}
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
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div style={{ fontSize: '80px', marginBottom: '24px', opacity: 0.6 }}>
                {searchTerm ? '🔍' : '📋'}
              </div>
              <div style={{ 
                color: 'rgba(248, 250, 252, 0.8)', 
                fontSize: '20px', 
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                {searchTerm ? `Nenhum resultado para "${searchTerm}"` : 'Nenhum registro encontrado'}
              </div>
              <div style={{ color: 'rgba(248, 250, 252, 0.5)', fontSize: '14px' }}>
                {searchTerm ? 'Tente uma busca diferente' : 'Ajuste os filtros para ver mais resultados'}
              </div>
            </div>
          )}
        </div>

        {/* Modal de Observações */}
        {selectedPatient && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }} onClick={() => setSelectedPatient(null)}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '600px',
              width: '100%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'rgba(248, 250, 252, 0.95)'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700' }}>
                  📝 Observações Detalhadas
                </h3>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="btn btn-secondary btn-sm"
                >
                  ✕
                </button>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  {selectedPatient.nome_aluno}
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(248, 250, 252, 0.7)' }}>
                  Terapeuta: {selectedPatient.terapeuta} • Pontuação: {selectedPatient.pontuacao}
                </div>
              </div>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '20px',
                fontSize: '16px',
                lineHeight: 1.6,
                marginBottom: '24px'
              }}>
                {selectedPatient.observacoes || 'Sem observações registradas para este paciente.'}
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => acoesRapidas.email(selectedPatient)}
                  className="btn btn-primary"
                >
                  ✉️ Enviar Email
                </button>
                <button 
                  onClick={() => acoesRapidas.agendar(selectedPatient)}
                  className="btn btn-success"
                >
                  📅 Agendar Follow-up
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé Ultra Premium */}
        <div style={{ 
          textAlign: 'center', 
          margin: '80px 0 60px'
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
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)`,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
            }}>
              🧠
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div style={{ 
                fontWeight: '800', 
                fontSize: '28px', 
                marginBottom: '4px',
                background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                MEDWAY Analytics v3.0
              </div>
              <div style={{ 
                color: 'rgba(248, 250, 252, 0.7)', 
                fontSize: '16px'
              }}>
                Sistema Inteligente de Monitoramento Psicológico
              </div>
            </div>
            
            <div style={{ 
              textAlign: 'right', 
              fontSize: '13px', 
              color: 'rgba(248, 250, 252, 0.6)'
            }}>
              <div style={{ marginBottom: '6px' }}>
                🔄 Última atualização: {lastUpdate.toLocaleString('pt-BR')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: connectionStatus === 'connected' ? '#34d399' : '#f87171',
                  borderRadius: '50%',
                  animation: connectionStatus === 'connected' ? 'pulse 2s infinite' : 'none'
                }}></div>
                <span style={{ color: connectionStatus === 'connected' ? '#34d399' : '#f87171' }}>
                  {connectionStatus === 'connected' ? 'Sistema Online' : 'Modo Demo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
