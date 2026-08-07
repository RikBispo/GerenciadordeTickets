# 🎟️ Gerenciador de Tickets - Ticketeria Corporativa de TI

Gerenciador de tickets de TI desenvolvido nas aulas do SENAI.

Uma aplicação full-stack robusta, moderna e de alto desempenho para gestão de chamados de suporte de TI (Help Desk / ITSM). Desenvolvida com backend em **Node.js + Express**, persistência assíncrona em arquivos **JSON** locais e frontend em **HTML5, CSS3 (Vanilla) e JavaScript Vanilla**.

---

## 🎨 Design System Monocromático
A interface do usuário segue rigorosamente uma paleta monocromática premium e corporativa:
- **Preto**: `#09090b` (Fundos principais, cabeçalho e botões primários)
- **Branco**: `#ffffff` (Cards, textos de alto contraste e modais)
- **Cinza Claro**: `#f4f4f5` / `#e4e4e7` / `#d4d4d8` (Background da aplicação, bordas e badges secundárias)
- **Cinza Escuro**: `#18181b` / `#27272a` / `#3f3f46` (Paineis, estados desabilitados e badges de prioridade/status)

---

## 📁 Estrutura de Diretórios

```text
Aula 06-08/
├── data/
│   ├── usuarios.json        # Persistência de usuários (Seed Admin incluído)
│   └── tickets.json         # Persistência de chamados de TI
├── src/
│   ├── controllers/
│   │   ├── authController.js  # Lógica de registro e login com JWT e Bcrypt
│   │   ├── userController.js  # Dados do usuário logado
│   │   └── ticketController.js# CRUD de chamados com validações de perfil
│   ├── middlewares/
│   │   ├── authMiddleware.js  # Validação de token JWT (Bearer Token)
│   │   └── adminMiddleware.js # Restrição de autorização para administradores
│   ├── routes/
│   │   ├── authRoutes.js      # Rotas /api/auth
│   │   ├── userRoutes.js      # Rotas /api/usuarios
│   │   └── ticketRoutes.js    # Rotas /api/tickets
│   └── utils/
│       └── jsonStore.js       # Leitura/escrita assíncrona em JSON com Lock de Concorrência
├── public/
│   ├── css/
│   │   └── styles.css         # Estilos Vanilla Monocromáticos
│   ├── js/
│   │   ├── app.js             # Entrada do app e dashboard
│   │   ├── auth.js            # Gestão de token no localStorage
│   │   ├── tickets.js         # Consumo REST de tickets
│   │   └── ui.js              # Toasts, modais e auxiliares de UI
│   └── index.html             # Interface SPA moderna
├── .env                       # Variáveis de ambiente (Porta e Segredo JWT)
├── server.js                  # Ponto de entrada do Servidor Express
├── package.json               # Dependências do projeto
└── README.md                  # Documentação do projeto
```

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** & **Express**
- **jsonwebtoken (JWT)** para autenticação stateless via header `Authorization: Bearer <token>`
- **bcryptjs** para hash seguro de senhas com salt
- **uuid** para geração de identificadores únicos (UUID v4)
- **cors** para suporte a requisições de origens cruzadas
- **dotenv** para gestão de variáveis de ambiente
- **fs/promises** com sistema de trava (*lock*) para gravações assíncronas concorrentes seguras nos arquivos JSON

### Frontend
- **HTML5 Semântico**
- **CSS3 Vanilla** (Variáveis CSS, Flexbox, CSS Grid, Design Responsivo, Tematização Monocromática)
- **JavaScript Vanilla (ES6+)**
- **Fetch API** com tratamento de erros, autorização automática via `localStorage` e suporte a modais/toasts.

---

## 🔒 Regras de Autorização e Segurança

1. **Usuário Comum (`comum`)**:
   - Registrar conta e realizar login.
   - Criar novos chamados de TI.
   - Visualizar **exclusivamente os seus próprios chamados** (validação feita no backend filtrando por `usuarioId` presente no JWT decodificado).
   - Impedido de alterar status ou excluir chamados.

2. **Administrador (`admin`)**:
   - Acesso irrestrito a **todos os chamados do sistema**.
   - Permissão exclusiva para alterar o status dos chamados (`Aberto` → `Em Atendimento` → `Concluído`).
   - Permissão exclusiva para excluir qualquer chamado permanentemente.

> 🛡️ **Segurança**: Senhas são sempre armazenadas com hash `bcrypt` (10 salt rounds) e **nunca** são retornadas em nenhuma resposta da API.

---

## 👤 Credenciais Padrão (Seed Admin)

O sistema é iniciado com 1 usuário Administrador de teste pré-cadastrado no `data/usuarios.json`:

- **E-mail**: `admin@empresa.com`
- **Senha**: `admin123`
- **Perfil**: `admin`

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js instalado (versão 16 ou superior recomendada).

### 1. Clonar / Navegar até o diretório do projeto
```bash
cd "c:\Users\Aluno\Desktop\Aula 06-08"
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
O arquivo `.env` já vem pré-configurado na raiz do projeto:
```env
PORT=3000
JWT_SECRET=ticketeria_corporativa_secret_key_2026_itsm_secure
```

### 4. Iniciar o Servidor
```bash
npm start
```

### 5. Acessar no Navegador
Abra o seu navegador e acesse:
```
http://localhost:3000
```
