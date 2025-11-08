// Script para inserir registros de exemplo na tabela 'extrato' e listar todos os registros.
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

(async function seed(){
  try{
    const dbPath = path.resolve(__dirname, '..', 'banco.db');
    const db = await open({ filename: dbPath, driver: sqlite3.Database });

    console.log('Inserindo registros de exemplo em:', dbPath);

    const insert = 'INSERT INTO extrato (data, transacao, valor) VALUES (?, ?, ?)';
    const now = new Date().toISOString();

    const samples = [
      [now, 'recebido', 1500.50],
      [now, 'enviado', 250.00],
      [now, 'recebido', 99.99]
    ];

    for(const s of samples){
      await db.run(insert, s[0], s[1], s[2]);
    }

    console.log('Inserções concluídas. Registros atuais em extrato:');
    const rows = await db.all('SELECT id, data, transacao, valor FROM extrato ORDER BY id');
    console.table(rows);

    await db.close();
  }catch(err){
    console.error('Erro ao inserir registros:', err);
    process.exitCode = 1;
  }
})();
