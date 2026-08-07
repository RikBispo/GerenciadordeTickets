/**
   ==========================================================================
   PONTO DE ENTRADA PRINCIPAL DA APLICAÇÃO
   ==========================================================================
*/

function initDashboard() {
  const user = getUser();
  if (!user) return;

  document.getElementById('authView').classList.add('hidden');
  document.getElementById('appView').classList.remove('hidden');

  // Atualiza informações no cabeçalho
  document.getElementById('headerUserName').textContent = user.nome;
  document.getElementById('headerUserEmail').textContent = user.email;
  
  const roleBadge = document.getElementById('headerUserRole');
  roleBadge.textContent = user.role.toUpperCase();
  roleBadge.className = `role-badge ${user.role}`;

  // Buscar chamados atualizados do backend
  fetchTickets();
}

// Inicializa checagem de autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});
