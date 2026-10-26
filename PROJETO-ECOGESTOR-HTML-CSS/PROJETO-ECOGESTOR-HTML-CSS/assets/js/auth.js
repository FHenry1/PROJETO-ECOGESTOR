(function () {
  'use strict';

  var PREFIXO = 'ecogestor:';
  var CHAVE_USUARIOS = PREFIXO + 'usuarios';
  var CHAVE_SESSAO = PREFIXO + 'sessao';
  var CHAVE_MODO = PREFIXO + 'modo';
  var ITERACOES = 100000;

  function lerJSON(chave, padrao) {
    try {
      var bruto = localStorage.getItem(chave);
      return bruto === null ? padrao : JSON.parse(bruto);
    } catch (e) { return padrao; }
  }

  function gravarJSON(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); return true; }
    catch (e) { return false; }
  }

  function paraHex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), function (b) {
      return ('0' + b.toString(16)).slice(-2);
    }).join('');
  }

  function gerarSal() {
    var bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (var i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
    return paraHex(bytes);
  }


  function gerarHash(senha, sal) {
    var subtle = window.crypto && window.crypto.subtle;
    if (!subtle) {
      var h = 5381, texto = sal + senha;
      for (var i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) | 0;
      return Promise.resolve('simples:' + (h >>> 0).toString(16));
    }
    var enc = new TextEncoder();
    return subtle.importKey('raw', enc.encode(senha), 'PBKDF2', false, ['deriveBits']).then(function (chave) {
      return subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(sal), iterations: ITERACOES, hash: 'SHA-256' }, chave, 256);
    }).then(paraHex);
  }

  function normalizarEmail(email) { return String(email || '').trim().toLowerCase(); }

  function iniciais(nome) {
    var partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return 'EG';
    var a = partes[0].charAt(0), b = partes.length > 1 ? partes[partes.length - 1].charAt(0) : '';
    return (a + b).toUpperCase();
  }


  function destinoSeguro(valor) {
    return /^[a-z0-9-]+\.html$/i.test(valor || '') ? valor : 'painel.html';
  }


  function emDemo() {
    try { return localStorage.getItem(CHAVE_MODO) === 'demo'; } catch (e) { return false; }
  }

  function definirModo(modo) {
    try {
      if (modo === 'demo') localStorage.setItem(CHAVE_MODO, 'demo');
      else localStorage.removeItem(CHAVE_MODO);
    } catch (e) { /* ignora */ }
  }

  function sessaoReal() {
    var s = lerJSON(CHAVE_SESSAO, null);
    if (!s || !s.usuarioId) return null;
    var usuario = lerJSON(CHAVE_USUARIOS, []).filter(function (u) { return u.id === s.usuarioId; })[0];
    return usuario ? { demo: false, id: usuario.id, nome: usuario.nome, email: usuario.email } : null;
  }

  var EcoAuth = {
    irPara: function (url) { window.location.replace(url); },

    emDemo: emDemo,
    entrarNaDemo: function () { definirModo('demo'); },
    /* Usado pelas telas de acesso: chegar ao login encerra a demonstração */
    encerrarDemo: function () { definirModo('real'); },
    sairDaDemo: function () {
      definirModo('real');
      EcoAuth.irPara(sessaoReal() ? 'painel.html' : 'login.html');
    },

    sessao: function () {
      return emDemo() ? { demo: true, nome: 'Visitante' } : sessaoReal();
    },

    sair: function () {
      try { localStorage.removeItem(CHAVE_SESSAO); } catch (e) { /* ignora */ }
      EcoAuth.irPara('login.html');
    },

    cadastrar: function (dados) {
      var email = normalizarEmail(dados.email);
      var usuarios = lerJSON(CHAVE_USUARIOS, []);
      if (usuarios.some(function (u) { return u.email === email; })) {
        return Promise.reject(new Error('Já existe uma conta com esse e-mail.'));
      }
      var sal = gerarSal();
      return gerarHash(dados.senha, sal).then(function (hash) {
        var atuais = lerJSON(CHAVE_USUARIOS, []);
        var usuario = {
          id: 'usuarios-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          nome: String(dados.nome).trim(),
          email: email,
          sal: sal,
          hash: hash,
          criadoEm: new Date().toISOString()
        };
        atuais.push(usuario);
        if (!gravarJSON(CHAVE_USUARIOS, atuais)) throw new Error('Não foi possível salvar a conta neste navegador.');
        gravarJSON(CHAVE_SESSAO, { usuarioId: usuario.id });
        definirModo('real');
        return usuario;
      });
    },

    entrar: function (email, senha) {
      var usuario = lerJSON(CHAVE_USUARIOS, []).filter(function (u) { return u.email === normalizarEmail(email); })[0];
      var erro = new Error('E-mail ou senha incorretos.');
      if (!usuario) return Promise.reject(erro);
      return gerarHash(senha, usuario.sal).then(function (hash) {
        if (hash !== usuario.hash) throw erro;
        gravarJSON(CHAVE_SESSAO, { usuarioId: usuario.id });
        definirModo('real');
        return usuario;
      });
    },

    /* Atualiza nome e e-mail da conta logada (sistema real) */
    atualizarPerfil: function (dados) {
      var atual = sessaoReal();
      if (!atual) return Promise.reject(new Error('Faça login para alterar o perfil.'));
      var email = normalizarEmail(dados.email);
      var usuarios = lerJSON(CHAVE_USUARIOS, []);
      if (usuarios.some(function (u) { return u.id !== atual.id && u.email === email; })) {
        return Promise.reject(new Error('Já existe outra conta com esse e-mail.'));
      }
      usuarios = usuarios.map(function (u) {
        return u.id === atual.id ? Object.assign({}, u, { nome: String(dados.nome).trim(), email: email }) : u;
      });
      if (!gravarJSON(CHAVE_USUARIOS, usuarios)) return Promise.reject(new Error('Não foi possível salvar neste navegador.'));
      return Promise.resolve(sessaoReal());
    },

    destinoSeguro: destinoSeguro,
    iniciais: iniciais,

    /* Páginas internas: sem sessão (e fora da demonstração), volta para o login */
    exigirSessao: function () {
      if (EcoAuth.sessao()) return true;
      var pagina = (window.location.pathname.split('/').pop() || '');
      EcoAuth.irPara('login.html?destino=' + encodeURIComponent(pagina));
      return false;
    },

    /* Barra superior: nome, saída e, na demonstração, o aviso e o botão de sair dela */
    montarBarra: function () {
      var perfil = document.querySelector('.topbar .profile');
      var sessao = EcoAuth.sessao();
      if (!perfil || !sessao) return;
      var nome = perfil.querySelector('.profile-name');
      var avatar = perfil.querySelector('.avatar');
      if (nome) nome.textContent = sessao.nome;
      if (avatar) avatar.textContent = sessao.demo ? 'EG' : iniciais(sessao.nome);

      if (sessao.demo) {
        var selo = document.createElement('span');
        selo.className = 'badge orange';
        selo.textContent = 'Demonstração';
        perfil.appendChild(selo);

        var conteudo = document.getElementById('conteudo');
        if (conteudo) {
          var aviso = document.createElement('p');
          aviso.className = 'notice demo-aviso';
          aviso.textContent = 'Modo demonstração: você está vendo dados fictícios, guardados à parte dos seus dados reais.';
          conteudo.insertBefore(aviso, conteudo.firstChild);
        }
      }

      var botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'button secondary btn-sair';
      botao.textContent = sessao.demo ? 'Sair da demonstração' : 'Sair';
      botao.addEventListener('click', sessao.demo ? EcoAuth.sairDaDemo : EcoAuth.sair);
      perfil.appendChild(botao);
    }
  };

  window.EcoAuth = EcoAuth;

  var script = document.currentScript;
  if (script && script.hasAttribute('data-protegido')) {
    /* Links com ?demo=1 ligam a demonstração e limpam o endereço */
    if (new URLSearchParams(window.location.search).get('demo') === '1') {
      definirModo('demo');
      try { window.history.replaceState(null, '', window.location.pathname); } catch (e) { /* ignora */ }
    }
    if (EcoAuth.exigirSessao()) {
      document.addEventListener('DOMContentLoaded', EcoAuth.montarBarra);
    }
  }
})();
