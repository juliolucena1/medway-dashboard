export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">
          🧠 MEDWAY Analytics
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Dashboard Funcionando! ✅
          </h2>
          <p className="text-gray-600 mb-6">
            Sistema de monitoramento de consultas psicológicas em tempo real
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">24</div>
              <div className="text-sm text-blue-800">Consultas Hoje</div>
            </div>
            
            <div className="bg-green-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-green-800">Terapeutas Ativos</div>
            </div>
            
            <div className="bg-purple-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">32.5</div>
              <div className="text-sm text-purple-800">Média Pontuação</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
