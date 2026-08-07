require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares Globais
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do Frontend
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API RESTful
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/tickets', ticketRoutes);

// Fallback para SPA (Servir index.html para qualquer outra rota não-API)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ erro: 'Endpoint não encontrado.' });
  }
  return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Tratamento global de erros inesperados
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  res.status(500).json({ erro: 'Erro interno no servidor.' });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Ticketeria Corporativa de TI rodando!`);
  console.log(`🌐 Acesse no navegador: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
