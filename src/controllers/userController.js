const { readJson } = require('../utils/jsonStore');

const USERS_FILE = 'data/usuarios.json';

/**
 * Retorna os dados do usuário autenticado no token
 */
async function getMe(req, res) {
  try {
    const usuarios = await readJson(USERS_FILE);
    const usuario = usuarios.find((u) => u.id === req.user.id);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    return res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({ erro: 'Erro interno ao carregar dados do usuário.' });
  }
}

module.exports = {
  getMe
};
