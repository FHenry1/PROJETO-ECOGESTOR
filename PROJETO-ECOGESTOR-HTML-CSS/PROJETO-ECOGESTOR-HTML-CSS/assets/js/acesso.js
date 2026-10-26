/* EcoGestor — telas de login e cadastro */
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var destino = EcoAuth.destinoSeguro(params.get('destino'));

  EcoAuth.encerrarDemo();
  if (EcoAuth.sessao()) { EcoAuth.irPara(destino); return; }

  var mensagem = document.getElementById('mensagem-form');
  var botaoVisitante = document.getElementById('btn-visitante');
  var mostrar = document.getElementById('mostrar-senha');

  function avisar(texto) {
    mensagem.textContent = texto;
    mensagem.hidden = !texto;
  }

  function marcarInvalidos(campos) {
    document.querySelectorAll('[aria-invalid]').forEach(function (c) { c.removeAttribute('aria-invalid'); });
    campos.forEach(function (c) { c.setAttribute('aria-invalid', 'true'); });
    if (campos.length) campos[0].focus();
  }

  function ocupado(botao, textoOcupado, estado) {
    if (estado) { botao.dataset.rotulo = botao.textContent; botao.textContent = textoOcupado; }
    else if (botao.dataset.rotulo) { botao.textContent = botao.dataset.rotulo; }
    botao.disabled = estado;
  }

  if (mostrar) {
    mostrar.addEventListener('change', function () {
      document.querySelectorAll('input[data-senha]').forEach(function (c) { c.type = mostrar.checked ? 'text' : 'password'; });
    });
  }

  if (botaoVisitante) {
    botaoVisitante.addEventListener('click', function () {
      window.location.href = 'painel.html?demo=1';
    });
  }

  var formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = formLogin.elements.email, senha = formLogin.elements.senha, botao = document.getElementById('btn-enviar');
      var invalidos = [];
      if (!email.value.trim() || !email.validity.valid) invalidos.push(email);
      if (!senha.value) invalidos.push(senha);
      if (invalidos.length) { avisar('Informe um e-mail válido e a senha.'); marcarInvalidos(invalidos); return; }
      avisar(''); marcarInvalidos([]);
      ocupado(botao, 'Entrando…', true);
      EcoAuth.entrar(email.value, senha.value).then(function () {
        EcoAuth.irPara(destino);
      }).catch(function (erro) {
        ocupado(botao, '', false);
        avisar(erro.message);
        marcarInvalidos([senha]);
        senha.select();
      });
    });
  }

  var formCadastro = document.getElementById('form-cadastro');
  if (formCadastro) {
    formCadastro.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = formCadastro.elements, botao = document.getElementById('btn-enviar');
      var invalidos = [], texto = '';
      if (f.nome.value.trim().length < 3) { invalidos.push(f.nome); texto = 'Informe seu nome completo.'; }
      else if (!f.email.value.trim() || !f.email.validity.valid) { invalidos.push(f.email); texto = 'Informe um e-mail válido.'; }
      else if (f.senha.value.length < 8) { invalidos.push(f.senha); texto = 'A senha precisa ter pelo menos 8 caracteres.'; }
      else if (f.senha.value !== f.confirmar.value) { invalidos.push(f.confirmar); texto = 'As senhas não coincidem.'; }
      if (invalidos.length) { avisar(texto); marcarInvalidos(invalidos); return; }
      avisar(''); marcarInvalidos([]);
      ocupado(botao, 'Criando conta…', true);
      EcoAuth.cadastrar({ nome: f.nome.value, email: f.email.value, senha: f.senha.value }).then(function () {
        EcoAuth.irPara(destino);
      }).catch(function (erro) {
        ocupado(botao, '', false);
        avisar(erro.message);
        marcarInvalidos([f.email]);
      });
    });
  }
})();
