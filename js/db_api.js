// Funções simples para banco de dados
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

// Conecta ao banco e cria tabelas necessárias
async function iniciarBanco() {
  const caminhoBanco = path.join(__dirname, '..', 'banco.db');
  const db = await open({
    filename: caminhoBanco,
    driver: sqlite3.Database
  });
  // Habilita enforcement de chaves estrangeiras (boa prática para integridade)
  try {
    await db.run('PRAGMA foreign_keys = ON');
  } catch (e) {
    console.warn('Não foi possível setar PRAGMA foreign_keys:', e && e.message);
  }

  // Cria tabela de usuários se não existir
  await db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      usuario TEXT NOT NULL,
      senha TEXT NOT NULL,
      saldo DECIMAL(10,2) DEFAULT 0.00
    )
  `);

  // Migração: garante que a coluna 'saldo' exista em bancos antigos
  try {
    const info = await db.all("PRAGMA table_info(usuarios)");
    const hasSaldo = info.some(col => col.name === 'saldo');
    if (!hasSaldo) {
      console.log('Adicionando coluna saldo na tabela usuarios (migração)');
      await db.run('ALTER TABLE usuarios ADD COLUMN saldo DECIMAL(10,2) DEFAULT 0.00');
    }
  } catch (e) {
    console.warn('Erro ao verificar/alterar coluna saldo:', e && e.message);
  }

  // Cria tabela de transações se não existir
  await db.run(`
    CREATE TABLE IF NOT EXISTS transacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      valor DECIMAL(10,2) NOT NULL,
      descricao TEXT,
      data DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  return db;
}

// Cadastra um novo usuário
async function cadastrarUsuario(nome, usuario, senha) {
  const db = await iniciarBanco();
  
  try {
    const result = await db.run(
      'INSERT INTO usuarios (nome, usuario, senha) VALUES (?, ?, ?)',
      [nome, usuario, senha]
    );
    const insertedId = result.lastID;
    await db.close();
    // Retorna o id do usuário recém-criado
    return insertedId;
  } catch (erro) {
    console.error('Erro ao cadastrar:', erro);
    await db.close();
    return null;
  }
}

// Faz login do usuário
async function login(usuario, senha) {
  const db = await iniciarBanco();
  
  try {
    // Procura usuário no banco
    const user = await db.get(
      'SELECT * FROM usuarios WHERE usuario = ? AND senha = ?',
      [usuario, senha]
    );
    
    await db.close();
    
    if (user) {
      return {
        id: user.id,
        nome: user.nome,
        usuario: user.usuario
      };
    } else {
      return null;
    }
  } catch (erro) {
    console.error('Erro no login:', erro);
    await db.close();
    return null;
  }
}

// Obtém o extrato bancário do usuário
async function getExtrato(usuarioId) {
  const db = await iniciarBanco();
  
  try {
    // Busca todas as transações do usuário
    const transacoes = await db.all(
      `SELECT t.*, u.saldo 
       FROM transacoes t 
       JOIN usuarios u ON t.usuario_id = u.id 
       WHERE t.usuario_id = ? 
       ORDER BY t.data DESC`,
      [usuarioId]
    );
    
    await db.close();
    return transacoes;
  } catch (erro) {
    console.error('Erro ao buscar extrato:', erro);
    await db.close();
    return null;
  }
}

// Registra uma nova transação
async function registrarTransacao(usuarioId, tipo, valor, descricao) {
  const db = await iniciarBanco();
  
  try {
    await db.run('BEGIN TRANSACTION');

    // Log para depuração
    console.log('registrarTransacao params:', { usuarioId, tipo, valor, descricao });

    // Registra a transação
    await db.run(
      'INSERT INTO transacoes (usuario_id, tipo, valor, descricao) VALUES (?, ?, ?, ?)',
      [usuarioId, tipo, valor, descricao]
    );

    // Atualiza o saldo do usuário
    if (tipo === 'entrada') {
      await db.run(
        'UPDATE usuarios SET saldo = saldo + ? WHERE id = ?',
        [valor, usuarioId]
      );
    } else {
      await db.run(
        'UPDATE usuarios SET saldo = saldo - ? WHERE id = ?',
        [valor, usuarioId]
      );
    }

    await db.run('COMMIT');
    await db.close();
    return true;
  } catch (erro) {
    // Tenta dar rollback, mas não aborta se falhar ao dar rollback
    try {
      await db.run('ROLLBACK');
    } catch (rbErr) {
      console.warn('Rollback falhou:', rbErr && rbErr.message);
    }
    console.error('Erro ao registrar transação:', erro && (erro.stack || erro.message || erro));
    await db.close();
    // relança o erro para que o caller (server) logue o stack completo e retorne 500
    throw erro;
  }
}

// Obtém o saldo atual do usuário
async function getSaldo(usuarioId) {
  const db = await iniciarBanco();
  
  try {
    const usuario = await db.get(
      'SELECT saldo FROM usuarios WHERE id = ?',
      [usuarioId]
    );
    
    await db.close();
    return usuario ? usuario.saldo : null;
  } catch (erro) {
    console.error('Erro ao buscar saldo:', erro);
    await db.close();
    return null;
  }
}

// Busca usuário pelo campo 'usuario' (nome de usuário) — retorna id, nome e usuario
async function getUsuarioPorUsuario(usuarioValor) {
  const db = await iniciarBanco();
  try {
    const user = await db.get(
      'SELECT id, nome, usuario FROM usuarios WHERE usuario = ?',
      [usuarioValor]
    );
    await db.close();
    return user || null;
  } catch (erro) {
    console.error('Erro ao buscar usuário por usuario:', erro);
    await db.close();
    return null;
  }
}

// Funções de debug: listar todos usuários e transações
async function getAllUsuarios() {
  const db = await iniciarBanco();
  try {
    const rows = await db.all('SELECT * FROM usuarios');
    await db.close();
    return rows;
  } catch (erro) {
    console.error('Erro ao listar usuarios:', erro);
    await db.close();
    return [];
  }
}

async function getAllTransacoes() {
  const db = await iniciarBanco();
  try {
    const rows = await db.all('SELECT * FROM transacoes ORDER BY data DESC');
    await db.close();
    return rows;
  } catch (erro) {
    console.error('Erro ao listar transacoes:', erro);
    await db.close();
    return [];
  }
}

// Exporta as funções para usar em outros arquivos
module.exports = {
  cadastrarUsuario,
  login,
  getExtrato,
  registrarTransacao,
  getSaldo,
  getUsuarioPorUsuario,
  getAllUsuarios,
  getAllTransacoes
};