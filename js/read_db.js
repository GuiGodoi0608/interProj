(async () => {
  const sqlite3 = require('sqlite3').verbose();
  const { open } = require('sqlite');
  const path = require('path');
  const dbPath = path.join(__dirname, '..', 'banco.db');
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  console.log('DB:', dbPath);
  const users = await db.all('SELECT * FROM usuarios');
  console.log('usuarios:', users);
  const trans = await db.all('SELECT * FROM transacoes ORDER BY data DESC');
  console.log('transacoes:', trans);
  await db.close();
})();
