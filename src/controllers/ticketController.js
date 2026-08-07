const { v4: uuidv4 } = require('uuid');
const { readJson, writeJson } = require('../utils/jsonStore');

const TICKETS_FILE = 'data/tickets.json';
const USERS_FILE = 'data/usuarios.json';

const PRIORIDADES_VALIDAS = ['Baixa', 'Média', 'Alta'];
const STATUS_VALIDOS = ['Aberto', 'Em Atendimento', 'Concluído'];

/**
 * Auxiliar para enriquecer tickets com dados do criador
 */
async function enriquecerTickets(tickets) {
  const usuarios = await readJson(USERS_FILE);
  const mapaUsuarios = usuarios.reduce((acc, u) => {
    acc[u.id] = { nome: u.nome, email: u.email };
    return acc;
  }, {});

  return tickets.map((t) => ({
    ...t,
    usuarioNome: mapaUsuarios[t.usuarioId]?.nome || 'Usuário Desconhecido',
    usuarioEmail: mapaUsuarios[t.usuarioId]?.email || ''
  }));
}

/**
 * Criação de um novo ticket de TI
 */
async function criarTicket(req, res) {
  try {
    const { titulo, descricao, categoria, prioridade } = req.body;

    if (!titulo || !descricao || !categoria || !prioridade) {
      return res.status(400).json({ erro: 'Título, descrição, categoria e prioridade são obrigatórios.' });
    }

    if (!PRIORIDADES_VALIDAS.includes(prioridade)) {
      return res.status(400).json({ erro: 'Prioridade inválida. Use: Baixa, Média ou Alta.' });
    }

    const tickets = await readJson(TICKETS_FILE);

    const novoTicket = {
      id: uuidv4(),
      usuarioId: req.user.id,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria: categoria.trim(),
      prioridade,
      status: 'Aberto',
      dataCriacao: new Date().toISOString()
    };

    tickets.push(novoTicket);
    await writeJson(TICKETS_FILE, tickets);

    const [ticketEnriquecido] = await enriquecerTickets([novoTicket]);

    return res.status(201).json({
      mensagem: 'Ticket criado com sucesso!',
      ticket: ticketEnriquecido
    });
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    return res.status(500).json({ erro: 'Erro interno ao registrar ticket.' });
  }
}

/**
 * Listagem de tickets com filtro estrito por papel (role)
 */
async function listarTickets(req, res) {
  try {
    const tickets = await readJson(TICKETS_FILE);

    let ticketsFiltrados;
    if (req.user.role === 'admin') {
      // Admin tem acesso irrestrito a todos os tickets
      ticketsFiltrados = tickets;
    } else {
      // Usuário comum visualiza estritamente os seus próprios tickets
      ticketsFiltrados = tickets.filter((t) => t.usuarioId === req.user.id);
    }

    // Ordenar por data de criação mais recente
    ticketsFiltrados.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));

    const ticketsEnriquecidos = await enriquecerTickets(ticketsFiltrados);

    return res.json(ticketsEnriquecidos);
  } catch (error) {
    console.error('Erro ao listar tickets:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar tickets.' });
  }
}

/**
 * Obter um ticket específico por ID
 */
async function obterTicket(req, res) {
  try {
    const { id } = req.params;
    const tickets = await readJson(TICKETS_FILE);
    const ticket = tickets.find((t) => t.id === id);

    if (!ticket) {
      return res.status(404).json({ erro: 'Ticket não encontrado.' });
    }

    // Validação de autorização no backend
    if (req.user.role !== 'admin' && ticket.usuarioId !== req.user.id) {
      return res.status(403).json({ erro: 'Acesso negado a este ticket.' });
    }

    const [ticketEnriquecido] = await enriquecerTickets([ticket]);
    return res.json(ticketEnriquecido);
  } catch (error) {
    console.error('Erro ao buscar ticket:', error);
    return res.status(500).json({ erro: 'Erro interno ao carregar ticket.' });
  }
}

/**
 * Alteração de status do ticket (Exclusivo Administrador)
 */
async function atualizarStatusTicket(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({
        erro: 'Status inválido. Valores aceitos: Aberto, Em Atendimento, Concluído.'
      });
    }

    const tickets = await readJson(TICKETS_FILE);
    const ticketIndex = tickets.findIndex((t) => t.id === id);

    if (ticketIndex === -1) {
      return res.status(404).json({ erro: 'Ticket não encontrado.' });
    }

    tickets[ticketIndex].status = status;
    await writeJson(TICKETS_FILE, tickets);

    const [ticketEnriquecido] = await enriquecerTickets([tickets[ticketIndex]]);

    return res.json({
      mensagem: 'Status do ticket atualizado com sucesso!',
      ticket: ticketEnriquecido
    });
  } catch (error) {
    console.error('Erro ao atualizar status do ticket:', error);
    return res.status(500).json({ erro: 'Erro interno ao alterar status.' });
  }
}

/**
 * Exclusão de ticket (Exclusivo Administrador)
 */
async function deletarTicket(req, res) {
  try {
    const { id } = req.params;
    const tickets = await readJson(TICKETS_FILE);
    const ticketIndex = tickets.findIndex((t) => t.id === id);

    if (ticketIndex === -1) {
      return res.status(404).json({ erro: 'Ticket não encontrado.' });
    }

    tickets.splice(ticketIndex, 1);
    await writeJson(TICKETS_FILE, tickets);

    return res.json({ mensagem: 'Ticket excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar ticket:', error);
    return res.status(500).json({ erro: 'Erro interno ao excluir ticket.' });
  }
}

module.exports = {
  criarTicket,
  listarTickets,
  obterTicket,
  atualizarStatusTicket,
  deletarTicket
};
