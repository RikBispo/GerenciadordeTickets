/**
   ==========================================================================
   GERENCIAMENTO E RENDERING DE TICKETS
   ==========================================================================
*/

let currentTickets = [];
let activeTicketId = null;

async function fetchTickets() {
  const token = getToken();
  try {
    const response = await fetch('/api/tickets', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        handleLogout();
        return;
      }
      throw new Error('Erro ao buscar chamados.');
    }

    currentTickets = await response.json();
    updateMetrics(currentTickets);
    filterTickets();
  } catch (error) {
    showToast(error.message, true);
  }
}

function updateMetrics(tickets) {
  const total = tickets.length;
  const aberto = tickets.filter((t) => t.status === 'Aberto').length;
  const atendimento = tickets.filter((t) => t.status === 'Em Atendimento').length;
  const concluido = tickets.filter((t) => t.status === 'Concluído').length;

  document.getElementById('metricTotal').textContent = total;
  document.getElementById('metricAberto').textContent = aberto;
  document.getElementById('metricAtendimento').textContent = atendimento;
  document.getElementById('metricConcluido').textContent = concluido;
}

function filterTickets() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const statusFilter = document.getElementById('filterStatus').value;
  const prioridadeFilter = document.getElementById('filterPrioridade').value;

  const filtered = currentTickets.filter((t) => {
    const matchesSearch =
      t.titulo.toLowerCase().includes(search) ||
      t.descricao.toLowerCase().includes(search) ||
      t.categoria.toLowerCase().includes(search) ||
      (t.usuarioNome && t.usuarioNome.toLowerCase().includes(search));

    const matchesStatus = statusFilter === 'todos' || t.status === statusFilter;
    const matchesPrioridade = prioridadeFilter === 'todas' || t.prioridade === prioridadeFilter;

    return matchesSearch && matchesStatus && matchesPrioridade;
  });

  renderTickets(filtered);
}

function renderTickets(tickets) {
  const container = document.getElementById('ticketsContainer');
  const user = getUser();
  const isAdmin = user && user.role === 'admin';

  if (!tickets || tickets.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-title">Nenhum chamado encontrado</div>
        <p>Não há chamados que correspondam aos filtros selecionados.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = tickets.map((t) => {
    const statusClass = t.status === 'Aberto' 
      ? 'badge-status-aberto' 
      : t.status === 'Em Atendimento' 
      ? 'badge-status-atendimento' 
      : 'badge-status-concluido';

    const prioClass = t.prioridade === 'Alta' 
      ? 'badge-prioridade-alta' 
      : t.prioridade === 'Média' 
      ? 'badge-prioridade-media' 
      : 'badge-prioridade-baixa';

    const ticketCode = `#TK-${t.id.slice(0, 5).toUpperCase()}`;

    return `
      <div class="ticket-card" onclick="openDetailModal('${t.id}')">
        <div>
          <div class="ticket-header">
            <h3 class="ticket-title">${escapeHtml(t.titulo)}</h3>
            <span class="ticket-id">${ticketCode}</span>
          </div>

          <div class="badges-group">
            <span class="badge ${statusClass}">${t.status}</span>
            <span class="badge ${prioClass}">Prioridade ${t.prioridade}</span>
            <span class="badge badge-categoria">${escapeHtml(t.categoria)}</span>
          </div>

          <p class="ticket-description">${escapeHtml(t.descricao)}</p>
        </div>

        <div>
          <div class="ticket-footer">
            <span class="ticket-author">${escapeHtml(t.usuarioNome || 'Solicitante')}</span>
            <span>${formatDate(t.dataCriacao)}</span>
          </div>

          ${isAdmin ? `
            <div class="ticket-actions" onclick="event.stopPropagation()">
              <label style="font-size:0.7rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Status:</label>
              <select class="status-select-admin" onchange="quickUpdateStatus('${t.id}', this.value)">
                <option value="Aberto" ${t.status === 'Aberto' ? 'selected' : ''}>Aberto</option>
                <option value="Em Atendimento" ${t.status === 'Em Atendimento' ? 'selected' : ''}>Em Atendimento</option>
                <option value="Concluído" ${t.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
              </select>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

async function handleCreateTicket(event) {
  event.preventDefault();
  const titulo = document.getElementById('ticketTitulo').value;
  const categoria = document.getElementById('ticketCategoria').value;
  const prioridade = document.getElementById('ticketPrioridade').value;
  const descricao = document.getElementById('ticketDescricao').value;
  const btn = document.getElementById('createTicketSubmitBtn');

  btn.disabled = true;
  btn.textContent = 'Enviando...';

  try {
    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ titulo, categoria, prioridade, descricao })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao registrar chamado.');
    }

    showToast('Chamado registrado com sucesso!');
    closeNewTicketModal();
    fetchTickets();
  } catch (error) {
    showToast(error.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Registrar Chamado';
  }
}

async function quickUpdateStatus(ticketId, newStatus) {
  try {
    const response = await fetch(`/api/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao alterar status.');
    }

    showToast(`Status alterado para "${newStatus}"`);
    fetchTickets();
  } catch (error) {
    showToast(error.message, true);
  }
}

function openDetailModal(ticketId) {
  const ticket = currentTickets.find((t) => t.id === ticketId);
  if (!ticket) return;

  activeTicketId = ticketId;
  const user = getUser();
  const isAdmin = user && user.role === 'admin';

  document.getElementById('detailTitle').textContent = `#TK-${ticket.id.slice(0, 5).toUpperCase()} — ${ticket.titulo}`;
  document.getElementById('detailDescription').textContent = ticket.descricao;
  document.getElementById('detailAuthor').textContent = `${ticket.usuarioNome} (${ticket.usuarioEmail || 'comum'})`;
  document.getElementById('detailDate').textContent = formatDate(ticket.dataCriacao);

  const statusClass = ticket.status === 'Aberto' 
    ? 'badge-status-aberto' 
    : ticket.status === 'Em Atendimento' 
    ? 'badge-status-atendimento' 
    : 'badge-status-concluido';

  const prioClass = ticket.prioridade === 'Alta' 
    ? 'badge-prioridade-alta' 
    : ticket.prioridade === 'Média' 
    ? 'badge-prioridade-media' 
    : 'badge-prioridade-baixa';

  document.getElementById('detailBadges').innerHTML = `
    <span class="badge ${statusClass}">${ticket.status}</span>
    <span class="badge ${prioClass}">Prioridade ${ticket.prioridade}</span>
    <span class="badge badge-categoria">${escapeHtml(ticket.categoria)}</span>
  `;

  const adminSection = document.getElementById('adminActionSection');
  const deleteBtn = document.getElementById('adminDeleteBtn');
  const statusSelect = document.getElementById('detailStatusSelect');

  if (isAdmin) {
    adminSection.classList.remove('hidden');
    deleteBtn.classList.remove('hidden');
    statusSelect.value = ticket.status;
  } else {
    adminSection.classList.add('hidden');
    deleteBtn.classList.add('hidden');
  }

  document.getElementById('ticketDetailModal').classList.add('active');
}

async function handleUpdateStatusFromModal() {
  if (!activeTicketId) return;
  const newStatus = document.getElementById('detailStatusSelect').value;
  await quickUpdateStatus(activeTicketId, newStatus);
  closeDetailModal();
}

async function handleDeleteTicketFromModal() {
  if (!activeTicketId) return;

  if (!confirm('Tem certeza de que deseja excluir permanentemente este chamado?')) {
    return;
  }

  try {
    const response = await fetch(`/api/tickets/${activeTicketId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao excluir ticket.');
    }

    showToast('Ticket excluído com sucesso.');
    closeDetailModal();
    fetchTickets();
  } catch (error) {
    showToast(error.message, true);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
