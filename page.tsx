export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-600">MEDWAY Analytics</h1>
                <p className="text-sm text-gray-600">Sistema de Monitoramento em Tempo Real</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                <span className="mr-2">🔄</span>
                CONECTADO
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Consultas Hoje</p>
                <p className="text-3xl font-bold text-blue-600">24</p>
                <p className="text-xs text-gray-500 mt-1">↗️ +15% vs ontem</p>
              </div>
              <span className="text-3xl">📅</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terapeutas Ativos</p>
                <p className="text-3xl font-bold text-green-600">8</p>
                <p className="text-xs text-gray-500 mt-1">Equipe completa</p>
              </div>
              <span className="text-3xl">👥</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alunos Atendidos</p>
                <p className="text-3xl font-bold text-purple-600">18</p>
                <p className="text-xs text-gray-500 mt-1">Únicos hoje</p>
              </div>
              <span className="text-3xl">🎓</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Média Pontuação</p>
                <p className="text-3xl font-bold text-orange-600">28.5</p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
                  <p className="text-xs text-gray-500">Normal</p>
                </div>
              </div>
              <span className="text-3xl">🎯</span>
            </div>
          </div>
        </div>

        {/* Distribuição de Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Casos Normais</h3>
              <span className="text-2xl">🟢</span>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">16</div>
              <p className="text-sm text-gray-600">Pontuação 0-29</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full w-4/5"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">80% do total</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Casos Atenção</h3>
              <span className="text-2xl">🟡</span>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">6</div>
              <p className="text-sm text-gray-600">Pontuação 30-49</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                <div className="bg-yellow-500 h-3 rounded-full w-1/4"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">25% do total</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Casos Urgentes</h3>
              <span className="text-2xl">🔴</span>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">2</div>
              <p className="text-sm text-gray-600">Pontuação ≥ 50</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                <div className="bg-red-500 h-3 rounded-full w-1/12"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">8% do total</p>
            </div>
          </div>
        </div>

        {/* Alerta de Emergência */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-3xl mr-4 animate-pulse">🚨</span>
              <div>
                <h3 className="text-xl font-bold">ATENÇÃO: 2 Casos Urgentes Identificados</h3>
                <p className="text-red-100">Pontuação ≥ 50 - Requer intervenção imediata</p>
              </div>
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
              Ver Detalhes
            </button>
          </div>
        </div>

        {/* Tabela de Registros Recentes */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <h3 className="text-lg font-bold flex items-center">
              <span className="mr-2">📋</span>
              Registros Recentes (Demonstração)
            </h3>
            <p className="text-blue-100 text-sm">Últimos atendimentos realizados</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aluno</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terapeuta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pontuação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">14:30</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Maria Silva</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Dr. João Santos</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="font-bold text-green-800">25.0</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      🟢 Normal
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">Sessão produtiva, aluna demonstrou melhora</td>
                </tr>
                
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">13:45</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Pedro Costa</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Dra. Ana Lima</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="font-bold text-yellow-800">42.0</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      🟡 Atenção
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">Necessita acompanhamento mais próximo</td>
                </tr>
                
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">13:00</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Julia Oliveira</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Dr. Carlos Rocha</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="font-bold text-red-800">65.0</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      🔴 Urgente
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">Caso urgente - encaminhar para supervisão</td>
                </tr>
                
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">12:15</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Lucas Mendes</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Dra. Maria Fernandes</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="font-bold text-green-800">18.0</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      🟢 Normal
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">Evolução positiva nas últimas sessões</td>
                </tr>
                
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">11:30</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Ana Carolina</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Dr. João Santos</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="font-bold text-red-800">58.0</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      🔴 Urgente
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">Acompanhar de perto, sinais de alerta</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Status de Conexão */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-blue-500 mr-2">ℹ️</span>
            <div>
              <p className="text-blue-800 font-medium">Modo Demonstração</p>
              <p className="text-blue-600 text-sm">
                Dashboard funcionando com dados de exemplo. 
                Conecte ao Supabase para dados reais em tempo real.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-12 text-center pb-8">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-lg">
            <span className="text-2xl">🧠</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">MEDWAY Analytics v1.0</p>
              <p className="text-xs text-gray-500">Sistema de Monitoramento Psicológico</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
