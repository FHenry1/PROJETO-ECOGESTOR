/* EcoGestor — Configurações (perfil e preferências) */
(function () {
  'use strict';

  var form = document.getElementById('form-config');
  var campoNome = document.getElementById('nome');
  var campoEmail = document.getElementById('email');
  var prefResumo = document.getElementById('pref-resumo');
  var prefLembretes = document.getElementById('pref-lembretes');
  var mensagem = document.getElementById('mensagem-form');
  var notaPerfil = document.getElementById('nota-perfil');
  var botaoSalvar = document.getElementById('btn-salvar');

  var sessao = EcoAuth.sessao();
  var emDemo = !!(sessao && sessao.demo);

  function avisar(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = 'notice' + (tipo === 'erro' ? ' notice-erro' : '');
    mensagem.hidden = !texto;
  }

  function preferencias() {
    return EcoStore.listar('config')[0] || { resumoMensal: false, lembretes: false };
  }

  function preencher() {
    var p = preferencias();
    prefResumo.checked = !!p.resumoMensal;
    prefLembretes.checked = !!p.lembretes;
    if (emDemo) {
      campoNome.value = 'Visitante';
      campoEmail.value = '';
      campoEmail.placeholder = 'visitante@demonstracao.exemplo';
    } else if (sessao) {
      campoNome.value = sessao.nome;
      campoEmail.value = sessao.email;
    }
    form.querySelectorAll('[aria-invalid]').forEach(function (c) { c.removeAttribute('aria-invalid'); });
  }

  function salvarPreferencias() {
    var dados = { resumoMensal: prefResumo.checked, lembretes: prefLembretes.checked };
    var atual = EcoStore.listar('config')[0];
    if (atual) EcoStore.atualizar('config', atual.id, dados);
    else EcoStore.inserir('config', dados);
  }

  function atualizarBarra(nome) {
    var alvo = document.querySelector('.topbar .profile-name');
    var avatar = document.querySelector('.topbar .avatar');
    if (alvo) alvo.textContent = nome;
    if (avatar) avatar.textContent = EcoAuth.iniciais(nome);
  }

  if (emDemo) {
    campoNome.disabled = true;
    campoEmail.disabled = true;
    notaPerfil.hidden = false;
  }

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    form.querySelectorAll('[aria-invalid]').forEach(function (c) { c.removeAttribute('aria-invalid'); });

    if (emDemo) {
      salvarPreferencias();
      avisar('Preferências salvas na demonstração.');
      return;
    }

    if (campoNome.value.trim().length < 3) {
      campoNome.setAttribute('aria-invalid', 'true'); campoNome.focus();
      avisar('Informe seu nome completo.', 'erro'); return;
    }
    if (!campoEmail.value.trim() || !campoEmail.validity.valid) {
      campoEmail.setAttribute('aria-invalid', 'true'); campoEmail.focus();
      avisar('Informe um e-mail válido.', 'erro'); return;
    }

    botaoSalvar.disabled = true;
    EcoAuth.atualizarPerfil({ nome: campoNome.value, email: campoEmail.value }).then(function (usuario) {
      sessao = EcoAuth.sessao();
      salvarPreferencias();
      atualizarBarra(usuario.nome);
      avisar('Alterações salvas.');
    }).catch(function (erro) {
      campoEmail.setAttribute('aria-invalid', 'true');
      avisar(erro.message, 'erro');
    }).then(function () { botaoSalvar.disabled = false; });
  });

  document.getElementById('btn-restaurar').addEventListener('click', function () {
    preencher();
    avisar('');
  });

  preencher();
})();
