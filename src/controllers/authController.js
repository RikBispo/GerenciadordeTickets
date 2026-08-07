const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { readJson, writeJson } = require('../utils/jsonStore');

const USERS_FILE = 'data/usuarios.json';

/**
 * Registro de novo usuário comum
 */
async function registro(req, res) {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve conter no mínimo 6 caracteres.' });
    }

    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailFormat.test(email)) {
      return res.status(400).json({ erro: 'Formato de e-mail inválido.' });
    }

    const usuarios = await readJson(USERS_FILE);

    // Verificar e-mail duplicado
    const jaExiste = usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (jaExiste) {
      return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    // Hash da senha
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    const novoUsuario = {
      id: uuidv4(),
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      senha: senhaHash,
      role: 'comum'
    };

    usuarios.push(novoUsuario);
    await writeJson(USERS_FILE, usuarios);

    // Gerar Token JWT
    const secret = process.env.JWT_SECRET || 'ticketeria_corporativa_secret_key_2026_itsm_secure';
    const token = jwt.sign(
      { id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email, role: novoUsuario.role },
      secret,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      token,
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        role: novoUsuario.role
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ erro: 'Erro interno ao registrar usuário.' });
  }
}

/**
 * Autenticação de usuário
 */
async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    const usuarios = await readJson(USERS_FILE);
    const usuario = usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    // Gerar Token JWT
    const secret = process.env.JWT_SECRET || 'ticketeria_corporativa_secret_key_2026_itsm_secure';
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
      secret,
      { expiresIn: '24h' }
    );

    return res.json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ erro: 'Erro interno ao realizar login.' });
  }
}

module.exports = {
  registro,
  login
};
