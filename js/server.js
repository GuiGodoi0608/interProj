const express = require('express');
const cors = require('cors');
const path = require('path');
const { login, cadastrarUsuario, getExtrato, registrarTransacao, getSaldo, getUsuarioPorUsuario, getAllUsuarios, getAllTransacoes } = require('./db_api');

const app = express();
app.use(cors());  // Permite requisições do navegador
app.use(express.json());

// Servir arquivos estáticos (frontend) a partir da raiz do projeto
// Isso permite acessar as páginas pelo mesmo host do servidor API (ex: http://localhost:3000/htmls/index.html)
app.use(express.static(path.join(__dirname, '..')));

// Rota de login
app.post('/api/login', async (req, res) => {
    try {
        const { usuario, senha } = req.body;
        const user = await login(usuario, senha);
        if (user) {
            res.json(user);
        } else {
            res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }
    } catch (erro) {
        console.error('Erro no login:', erro);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

// Rota de cadastro
app.post('/api/cadastro', async (req, res) => {
    try {
        const { nome, usuario, senha } = req.body;
        const insertedId = await cadastrarUsuario(nome, usuario, senha);
        if (insertedId) {
            // Busca e retorna o usuário criado (id, nome, usuario)
            try {
                const created = await getUsuarioPorUsuario(usuario);
                return res.status(201).json(created);
            } catch (errFetch) {
                console.warn('Cadastro criado mas falha ao retornar usuário:', errFetch);
                return res.status(201).json({ id: insertedId, nome, usuario });
            }
        } else {
            res.status(400).json({ error: 'Erro ao cadastrar usuário' });
        }
    } catch (erro) {
        console.error('Erro no cadastro:', erro);
        res.status(500).json({ error: erro.message });
    }
});

// Rota para obter extrato
app.get('/api/extrato/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const extrato = await getExtrato(userId);
        if (extrato) {
            res.json(extrato);
        } else {
            res.status(404).json({ error: 'Extrato não encontrado' });
        }
    } catch (erro) {
        console.error('Erro ao buscar extrato:', erro);
        res.status(500).json({ error: 'Erro ao buscar extrato' });
    }
});

// Rota para obter saldo
app.get('/api/saldo/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const saldo = await getSaldo(userId);
        if (saldo !== null) {
            res.json({ saldo });
        } else {
            res.status(404).json({ error: 'Usuário não encontrado' });
        }
    } catch (erro) {
        console.error('Erro ao buscar saldo:', erro);
        res.status(500).json({ error: 'Erro ao buscar saldo' });
    }
});

// Rota para registrar transação
app.post('/api/transacao', async (req, res) => {
    try {
        console.log('POST /api/transacao body:', req.body);
        let { usuarioId, tipo, valor, descricao } = req.body;

        // Validação básica
        if (!usuarioId) {
            return res.status(400).json({ error: 'usuarioId é obrigatório' });
        }
        usuarioId = Number(usuarioId);
        if (!Number.isFinite(usuarioId) || usuarioId <= 0) {
            return res.status(400).json({ error: 'usuarioId inválido' });
        }

        if (!tipo || (tipo !== 'entrada' && tipo !== 'saida')) {
            return res.status(400).json({ error: 'tipo inválido' });
        }

        valor = Number(valor);
        if (!Number.isFinite(valor) || valor <= 0) {
            return res.status(400).json({ error: 'valor inválido' });
        }

        const result = await registrarTransacao(usuarioId, tipo, valor, descricao);
        if (result) {
            // retorna novo saldo para o cliente atualizar a UI sem novo GET
            try {
                const novoSaldo = await getSaldo(usuarioId);
                return res.json({ success: true, saldo: novoSaldo });
            } catch (e) {
                return res.json({ success: true });
            }
        } else {
            res.status(500).json({ error: 'Erro interno ao registrar transação' });
        }
    } catch (erro) {
        console.error('Erro ao registrar transação:', erro);
        res.status(500).json({ error: erro.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Rota para obter usuário pelo nome de usuário (username)
app.get('/api/usuario/:usuario', async (req, res) => {
    try {
        const usuario = req.params.usuario;
        const user = await getUsuarioPorUsuario(usuario);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'Usuário não encontrado' });
        }
    } catch (erro) {
        console.error('Erro ao buscar usuário:', erro);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
});

// Rota de debug (lista todos usuários e transações) — APENAS para depuração local
app.get('/api/debug', async (req, res) => {
    try {
        const usuarios = await getAllUsuarios();
        const transacoes = await getAllTransacoes();
        res.json({ usuarios, transacoes });
    } catch (erro) {
        console.error('Erro no debug:', erro);
        res.status(500).json({ error: 'Erro ao obter debug' });
    }
});