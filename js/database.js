// Versão Node (CommonJS) do script para criar a tabela 'extrato' em SQLite.
// Observações:
// - Este arquivo roda com Node.js (não em navegador).
// - Instale as dependências com: npm install sqlite3 sqlite

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function criarTabelaExtrato() {
    // Caminho do banco relativo à pasta do projeto (ajuste se necessário)
    const dbPath = path.resolve(__dirname, '..', 'banco.db');

    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
    });

    // SQL válido para SQLite. Ajustei tipos e sintaxe (INTEGER PRIMARY KEY AUTOINCREMENT, REAL para valor).
    const sql = `
        CREATE TABLE IF NOT EXISTS extrato (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data DATETIME NOT NULL,
            transacao TEXT NOT NULL,
            valor REAL NOT NULL
        );
    `;

    await db.exec(sql);
    console.log('Tabela "extrato" criada (ou já existente) em:', dbPath);

    await db.close();
}

// Se o arquivo for executado diretamente, cria a tabela.
if (require.main === module) {
    criarTabelaExtrato().catch(err => {
        console.error('Erro ao criar tabela:', err);
        process.exitCode = 1;
    });
}

module.exports = { criarTabelaExtrato };