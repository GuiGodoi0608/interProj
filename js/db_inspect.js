// Pequeno utilitário para inspecionar o arquivo banco.db
// Lista tabelas, mostra o SQL de criação e conta linhas da tabela 'extrato' se existir.
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

(async function main(){
  try{
    const dbPath = path.resolve(__dirname, '..', 'banco.db');
    const db = await open({ filename: dbPath, driver: sqlite3.Database });

    console.log('Usando banco:', dbPath);

    const tables = await db.all("SELECT name, type, sql FROM sqlite_master WHERE type IN ('table','view') ORDER BY name");
    if(!tables || tables.length === 0){
      console.log('Nenhuma tabela encontrada.');
      await db.close();
      return;
    }

    console.log('\nTabelas encontradas:');
    for(const t of tables){
      console.log(`- ${t.name} (${t.type})`);
      console.log('  SQL:', t.sql ? t.sql.trim().replace(/\s+/g,' ') : '(sem SQL)');
    }

    // Se existir 'extrato', mostra contagem de linhas
    const extrato = tables.find(x => x.name === 'extrato');
    if(extrato){
      const row = await db.get('SELECT COUNT(*) AS c FROM extrato');
      console.log(`\nContagem de linhas em 'extrato': ${row ? row.c : 0}`);
    }

    await db.close();
  }catch(err){
    console.error('Erro ao inspecionar o DB:', err);
    process.exitCode = 1;
  }
})();
