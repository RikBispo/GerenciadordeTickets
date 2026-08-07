/**
   ==========================================================================
   AUTENTICAÇÃO E GERENCIAMENTO DE SESSÃO
   ==========================================================================
*/

const TOKEN_KEY = 'ticketeria_token';
const USER_KEY = 'ticketeria_user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getUser() {
  const userStr = localStorage.getItem(USER_KEY);
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const emailInput = document.getElementById('loginEmail').value;
  const senhaInput = document.getElementById('loginSenha').value;
  const btn = document.getElementById('loginSubmitBtn');

  btn.disabled = true;
  btn.textContent = 'Autenticando...';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput, senha: senhaInput })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao realizar login.');
    }

    setSession(data.token, data.usuario);
    showToast(`Bem-vindo, ${data.usuario.nome}!`);
    initDashboard();
  } catch (error) {
    showToast(error.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Acessar Painel';
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const nome = document.getElementById('regNome').value;
  const email = document.getElementById('regEmail').value;
  const senha = document.getElementById('regSenha').value;
  const btn = document.getElementById('registerSubmitBtn');

  btn.disabled = true;
  btn.textContent = 'Cadastrando...';

  try {
    const response = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao criar conta.');
    }

    setSession(data.token, data.usuario);
    showToast('Conta criada com sucesso!');
    initDashboard();
  } catch (error) {
    showToast(error.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Criar Conta';
  }
}

function handleLogout() {
  clearSession();
  document.getElementById('appView').classList.add('hidden');
  document.getElementById('authView').classList.remove('hidden');
  showToast('Sessão encerrada.');
}

async function checkAuth() {
  const token = getToken();
  if (!token) {
    document.getElementById('authView').classList.remove('hidden');
    document.getElementById('appView').classList.add('hidden');
    return;
  }

  try {
    const response = await fetch('/api/usuarios/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      clearSession();
      document.getElementById('authView').classList.remove('hidden');
      document.getElementById('appView').classList.add('hidden');
      return;
    }

    const user = await response.json();
    setSession(token, user);
    initDashboard();
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    clearSession();
    document.getElementById('authView').classList.remove('hidden');
    document.getElementById('appView').classList.add('hidden');
  }
}
