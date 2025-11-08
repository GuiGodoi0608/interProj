(async () => {
  const base = 'http://localhost:3000';
  const unique = 'auto_test_node_' + Date.now();
  console.log('Usuario de teste:', unique);

  try {
    // Cadastro
    let res = await fetch(base + '/api/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: 'Auto Test', usuario: unique, senha: 'pass123' })
    });
    const cadastro = await res.json();
    console.log('POST /api/cadastro ->', res.status, cadastro);

    if (!res.ok) return;
    const id = cadastro.id || cadastro.ID || cadastro["id"] || cadastro.userId || cadastro.insertedId || null;
    console.log('Resolved id:', id);

    // Deposito
    res = await fetch(base + '/api/transacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId: id, tipo: 'entrada', valor: 1000, descricao: 'Depósito teste' })
    });
    const t1 = await res.json();
    console.log('POST /api/transacao (entrada) ->', res.status, t1);

    // Saldo
    res = await fetch(base + '/api/saldo/' + id);
    const s1 = await res.json();
    console.log('GET /api/saldo ->', res.status, s1);

    // Saida
    res = await fetch(base + '/api/transacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId: id, tipo: 'saida', valor: 200, descricao: 'Pagamento teste' })
    });
    const t2 = await res.json();
    console.log('POST /api/transacao (saida) ->', res.status, t2);

    // Saldo final
    res = await fetch(base + '/api/saldo/' + id);
    const s2 = await res.json();
    console.log('GET /api/saldo (depois) ->', res.status, s2);

  } catch (err) {
    console.error('Erro no teste:', err);
  }
})();
