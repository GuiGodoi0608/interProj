let btn = document.querySelector('#verSenha')
let btnConfirm = document.querySelector('#verConfirmSenha')


let nome = document.querySelector('#nome')
let labelNome = document.querySelector('#labelNome')
let validNome = false

let cpf = document.querySelector('#cpf')
let labelCPF = document.querySelector('#labelCPF')
let validCPF = false

let nascimento = document.querySelector('#nascimento')
let labelNascimento = document.querySelector('#labelNascimento')
let validNascimento = false

let usuario = document.querySelector('#usuario')
let labelUsuario = document.querySelector('#labelUsuario')
let validUsuario = false

let senha = document.querySelector('#senha')
let labelSenha = document.querySelector('#labelSenha')
let validSenha = false

let confirmSenha = document.querySelector('#confirmSenha')
let labelConfirmSenha = document.querySelector('#labelConfirmSenha')
let validConfirmSenha = false

let msgError = document.querySelector('#msgError')
let msgSuccess = document.querySelector('#msgSuccess')

nome.addEventListener('keyup', () => {
  if(nome.value.length <= 2){
    labelNome.setAttribute('style', 'color: red')
    labelNome.innerHTML = 'Nome *Insira no minimo 3 caracteres'
    nome.setAttribute('style', 'border-color: red')
    validNome = false
  } else {
    labelNome.setAttribute('style', 'color: green')
    labelNome.innerHTML = 'Nome'
    nome.setAttribute('style', 'border-color: green')
    validNome = true
  }
})

usuario.addEventListener('keyup', () => {
  if(usuario.value.length <= 4){
    labelUsuario.setAttribute('style', 'color: red')
    labelUsuario.innerHTML = 'Usuário *Insira no minimo 5 caracteres'
    usuario.setAttribute('style', 'border-color: red')
    validUsuario = false
  } else {
    labelUsuario.setAttribute('style', 'color: green')
    labelUsuario.innerHTML = 'Usuário'
    usuario.setAttribute('style', 'border-color: green')
    validUsuario = true
  }
})
cpf.addEventListener('keyup', () => {
if(cpf.value.length < 11){
    labelCPF.setAttribute('style', 'color: red')
    labelCPF.innerHTML = 'CPF *Insira um CPF válido'
    cpf.setAttribute('style', 'border-color: red')
    validCPF = false
  } else {
    labelCPF.setAttribute('style', 'color: green')
    labelCPF.innerHTML = 'CPF'
    cpf.setAttribute('style', 'border-color: green')
    validCPF = true
}
})
nascimento.addEventListener('keyup', () => {
if(nascimento.value == ""){
    labelNascimento.setAttribute('style', 'color: red')
    labelNascimento.innerHTML = 'Data de Nascimento *Insira sua data de nascimento'
    nascimento.setAttribute('style', 'border-color: red')
    validNascimento = false
  }
    else {
    labelNascimento.setAttribute('style', 'color: green')
    labelNascimento.innerHTML = 'Data de Nascimento'
    nascimento.setAttribute('style', 'border-color: green')
    validNascimento = true
    }
})


senha.addEventListener('keyup', () => {
  if(senha.value.length <= 5){
    labelSenha.setAttribute('style', 'color: red')
    labelSenha.innerHTML = 'Senha *Insira no minimo 6 caracteres'
    senha.setAttribute('style', 'border-color: red')
    validSenha = false
  } else {
    labelSenha.setAttribute('style', 'color: green')
    labelSenha.innerHTML = 'Senha'
    senha.setAttribute('style', 'border-color: green')
    validSenha = true
  }
})

confirmSenha.addEventListener('keyup', () => {
  if(senha.value != confirmSenha.value){
    labelConfirmSenha.setAttribute('style', 'color: red')
    labelConfirmSenha.innerHTML = 'Confirmar Senha *As senhas não conferem'
    confirmSenha.setAttribute('style', 'border-color: red')
    validConfirmSenha = false
  } else {
    labelConfirmSenha.setAttribute('style', 'color: green')
    labelConfirmSenha.innerHTML = 'Confirmar Senha'
    confirmSenha.setAttribute('style', 'border-color: green')
    validConfirmSenha = true
  }
})

// Registra novo usuário via API (frontend)
async function cadastrar(){
  if(validNome && validCPF && validNascimento && validUsuario && validSenha && validConfirmSenha){
    try {
      msgSuccess.style.display = 'block'
      msgSuccess.innerHTML = '<strong>Enviando cadastro...</strong>'
      msgError.style.display = 'none'

      const response = await fetch('http://localhost:3000/api/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.value, usuario: usuario.value, senha: senha.value })
      });

      const result = await response.json();
      if (response.ok) {
        msgSuccess.style.display = 'block'
        msgSuccess.innerHTML = '<strong>Cadastro realizado com sucesso!</strong>'
        msgError.style.display = 'none'
        // Se o servidor retornou o usuário criado, fazer auto-login
        if (result && result.id) {
          localStorage.setItem('userLogado', JSON.stringify(result));
          setTimeout(() => {
            window.location.href = 'extrato.html'
          }, 800);
        } else {
          setTimeout(() => {
            window.location.href = 'signin.html'
          }, 1500);
        }
      } else {
        msgError.style.display = 'block'
        msgError.innerHTML = '<strong>Erro ao cadastrar usuário: ' + (result.error || 'erro desconhecido') + '</strong>'
        msgSuccess.style.display = 'none'
      }
    } catch(err) {
      console.error('Erro ao cadastrar (fetch):', err)
      msgError.style.display = 'block'
      msgError.innerHTML = '<strong>Erro ao cadastrar: Verifique se o servidor está rodando.</strong>'
      msgSuccess.style.display = 'none'
    }
  } else {
    msgError.style.display = 'block'
    msgError.innerHTML = '<strong>Preencha todos os campos corretamente</strong>'
    msgSuccess.style.display = 'none'
  }
}

btn.addEventListener('click', ()=>{
  let inputSenha = document.querySelector('#senha')
  
  if(inputSenha.getAttribute('type') == 'password'){
    inputSenha.setAttribute('type', 'text')
  } else {
    inputSenha.setAttribute('type', 'password')
  }
})

btnConfirm.addEventListener('click', ()=>{
  let inputConfirmSenha = document.querySelector('#confirmSenha')
  
  if(inputConfirmSenha.getAttribute('type') == 'password'){
    inputConfirmSenha.setAttribute('type', 'text')
  } else {
    inputConfirmSenha.setAttribute('type', 'password')
  }
})