// Botão de mostrar/esconder senha
let btn = document.querySelector('.fa-eye')

btn.addEventListener('click', ()=>{
  let inputSenha = document.querySelector('#senha')
  
  if(inputSenha.getAttribute('type') == 'password'){
    inputSenha.setAttribute('type', 'text')
  } else {
    inputSenha.setAttribute('type', 'password')
  }
})

// Função de login usando fetch para API
async function entrar(){
  // Pega os elementos do formulário
  let usuario = document.querySelector('#usuario')
  let senha = document.querySelector('#senha')
  let msgError = document.querySelector('#msgError')
  
  try {
    // Faz requisição para API de login
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usuario: usuario.value,
        senha: senha.value
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      // Login bem sucedido
      localStorage.setItem('userLogado', JSON.stringify(data))
      window.location.href = 'main_page.html'
    } else {
      // Login falhou
      msgError.style.display = 'block'
      msgError.innerHTML = data.error || 'Usuário ou senha incorretos'
      usuario.style.borderColor = 'red'
      senha.style.borderColor = 'red'
    }
  } catch (erro) {
    // Erro na requisição
    console.error('Erro:', erro)
    msgError.style.display = 'block'
    msgError.innerHTML = 'Erro ao conectar com o servidor'
  }
}