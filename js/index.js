// Importa função de login do banco
const { login } = require('./db_api');

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

// Função de login
async function entrar(){
  // Pega os elementos do formulário
  let usuario = document.querySelector('#usuario')
  let senha = document.querySelector('#senha')
  let msgError = document.querySelector('#msgError')
  
  try {
    // Tenta fazer login
    const user = await login(usuario.value, senha.value);
    
    if(user) {
      // Login deu certo
      localStorage.setItem('userLogado', JSON.stringify(user))
      window.location.href = '../htmls/main_page.html'
    } else {
      // Login falhou
      msgError.style.display = 'block'
      msgError.innerHTML = 'Usuário ou senha incorretos'
      usuario.style.borderColor = 'red'
      senha.style.borderColor = 'red'
    }
  } catch (erro) {
    // Erro no login
    console.log('Erro:', erro)
    msgError.style.display = 'block'
    msgError.innerHTML = 'Erro ao fazer login'
  }
}