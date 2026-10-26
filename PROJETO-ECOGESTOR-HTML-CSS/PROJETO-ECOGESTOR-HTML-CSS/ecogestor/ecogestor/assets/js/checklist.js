/* EcoGestor — Checklist do colaborador */
(function () {
  'use strict';

  var form = document.getElementById('form-checklist');
  var selectUnidade = document.getElementById('unidade');
  var campoColab = document.getElementById('colaborador');
  var campoData = document.getElementById('data-visita');
  var selectVisita = document.getElementById('visita');
  var obs = document.getElementById('observacoes');
  var coord = document.getElementById('coordenador');
  var encarregado = document.getElementById('encarregado');
  var mensagem = document.getElementById('mensagem-form');
  var contador = document.getElementById('contador-respostas');
  var historico = document.getElementById('historico');
  var contadorHistorico = document.getElementById('contador-historico');
  var E = EcoStore.escapar;

  var secoes = Array.prototype.slice.call(document.querySelectorAll('.checklist-section'));
  var itens = Array.prototype.slice.call(document.querySelectorAll('fieldset[data-item]'));
  var TOTAL = itens.length;

  /* Mapas lidos da própria página: chave do item -> texto; seção -> chaves */
  var textoDoItem = {};
  var estrutura = secoes.map(function (secao) {
    var chaves = Array.prototype.slice.call(secao.querySelectorAll('fieldset[data-item]')).map(function (f) {
      var chave = f.getAttribute('data-item');
      textoDoItem[chave] = f.querySelector('legend').textContent.replace(/^\d+\.\d+\.\s*/, '');
      return chave;
    });
    return { nome: secao.getAttribute('data-secao'), chaves: chaves, elemento: secao };
  });

  function avisar(html, tipo) {
    mensagem.innerHTML = html;
    mensagem.className = 'notice' + (tipo === 'erro' ? ' notice-erro' : '');
    mensagem.hidden = !html;
    if (html) mensagem.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function respostaDe(chave) {
    var marcado = form.querySelector('input[name="item-' + chave + '"]:checked');
    return marcado ? marcado.value : null;
  }

  function lerRespostas() {
    var r = {};
    itens.forEach(function (f) {
      var chave = f.getAttribute('data-item');
      var v = respostaDe(chave);
      if (v) r[chave] = v;
    });
    return r;
  }

  /* Conformidade = C / (C + NC); "não se aplica" não entra na conta */
  function calcular(respostas, chaves) {
    var c = 0, nc = 0, na = 0;
    chaves.forEach(function (k) {
      if (respostas[k] === 'C') c++;
      else if (respostas[k] === 'NC') nc++;
      else if (respostas[k] === 'NA') na++;
    });
    var base = c + nc;
    return { c: c, nc: nc, na: na, pct: base ? Math.round((c / base) * 100) : null };
  }

  function textoPct(p) { return p === null ? '—' : p + '%'; }

  function atualizarProgresso() {
    var r = lerRespostas();
    var feitas = Object.keys(r).length;
    contador.textContent = feitas + ' de ' + TOTAL + ' itens respondidos';
    estrutura.forEach(function (s) {
      var f = s.chaves.filter(function (k) { return r[k]; }).length;
      var alvo = s.elemento.querySelector('.secao-progresso');
      alvo.textContent = f + '/' + s.chaves.length + (f === s.chaves.length ? ' ✓' : '');
    });
  }

  function limpar() {
    form.reset();
    campoData.value = hoje();
    form.querySelectorAll('[aria-invalid]').forEach(function (c) { c.removeAttribute('aria-invalid'); });
    avisar('');
    atualizarProgresso();
  }

  function hoje() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function formatarData(iso) {
    var p = (iso || '').split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
  }

  /* ---- Salvar ---- */
  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    form.querySelectorAll('[aria-invalid]').forEach(function (c) { c.removeAttribute('aria-invalid'); });

    var erros = [];
    if (!selectUnidade.value) erros.push({ campo: selectUnidade, texto: 'Selecione a unidade.' });
    if (campoColab.value.trim().length < 3) erros.push({ campo: campoColab, texto: 'Informe o nome do colaborador.' });
    if (!campoData.value) erros.push({ campo: campoData, texto: 'Informe a data da visita.' });
    if (erros.length) {
      erros.forEach(function (e) { e.campo.setAttribute('aria-invalid', 'true'); });
      avisar(E(erros[0].texto), 'erro');
      erros[0].campo.focus();
      return;
    }

    var respostas = lerRespostas();
    var faltando = itens.filter(function (f) { return !respostas[f.getAttribute('data-item')]; });
    if (faltando.length) {
      var primeiro = faltando[0];
      var secao = primeiro.closest('.checklist-section');
      secao.open = true;
      avisar('Faltam ' + faltando.length + ' item(ns) sem resposta. O primeiro é o item ' + E(primeiro.getAttribute('data-item')) + '.', 'erro');
      primeiro.querySelector('input').focus();
      return;
    }

    var visita = {
      unidadeId: selectUnidade.value,
      colaborador: campoColab.value.trim(),
      data: campoData.value,
      visita: selectVisita.value,
      respostas: respostas,
      obs: obs.value.trim(),
      coordenador: coord.value.trim(),
      encarregado: encarregado.value.trim(),
      criadoEm: new Date().toISOString()
    };
    EcoStore.inserir('checklists', visita);

    var geral = calcular(respostas, Object.keys(respostas));
    limpar();
    avisar('Avaliação salva. Conformidade da visita: <strong>' + textoPct(geral.pct) + '</strong> (' + geral.c + ' conformes, ' + geral.nc + ' não conformes, ' + geral.na + ' não se aplicam).');
    desenharHistorico();
  });

  document.getElementById('btn-limpar').addEventListener('click', function () {
    if (Object.keys(lerRespostas()).length && !window.confirm('Limpar todas as respostas desta avaliação?')) return;
    limpar();
  });

  form.addEventListener('change', atualizarProgresso);

  /* ---- Histórico ---- */
  function classePct(p) {
    if (p === null) return '';
    return p >= 90 ? '' : ' orange';
  }

  function desenharVisita(v) {
    var unidade = EcoStore.buscar('unidades', v.unidadeId);
    var nomeUnidade = unidade ? unidade.nome + ' — ' + unidade.cidade : 'Unidade removida';
    var chavesTodas = Object.keys(v.respostas);
    var geral = calcular(v.respostas, chavesTodas);

    var porSecao = estrutura.map(function (s) {
      var r = calcular(v.respostas, s.chaves);
      return '<li><span>' + E(s.nome) + '</span><strong>' + textoPct(r.pct) + '</strong></li>';
    }).join('');

    var naoConformes = chavesTodas.filter(function (k) { return v.respostas[k] === 'NC'; });
    naoConformes.sort(function (a, b) {
      var pa = a.split('.').map(Number), pb = b.split('.').map(Number);
      return pa[0] - pb[0] || pa[1] - pb[1];
    });
    var listaNC = naoConformes.length
      ? '<p class="eyebrow">Itens não conformes</p><ul class="helper-list">' + naoConformes.map(function (k) {
          return '<li>' + E(k) + '. ' + E(textoDoItem[k] || '') + '</li>';
        }).join('') + '</ul>'
      : '<p class="muted">Nenhum item não conforme nesta visita.</p>';

    var extras = '';
    if (v.obs) extras += '<p><strong>Observações:</strong> ' + E(v.obs) + '</p>';
    if (v.coordenador) extras += '<p class="muted">Coordenador: ' + E(v.coordenador) + '</p>';
    if (v.encarregado) extras += '<p class="muted">Encarregado SBE: ' + E(v.encarregado) + '</p>';

    return '<article class="panel visita-card" data-id="' + E(v.id) + '">' +
      '<div class="section-heading"><div><h3>' + E(nomeUnidade) + '</h3>' +
      '<p class="muted">' + formatarData(v.data) + ' · ' + E(v.visita) + ' · ' + E(v.colaborador) + '</p></div>' +
      '<span class="badge' + classePct(geral.pct) + '">Conformidade ' + textoPct(geral.pct) + '</span></div>' +
      '<details><summary>Ver detalhes da visita</summary>' +
      '<ul class="unit-summary">' + porSecao + '</ul>' + listaNC + extras + '</details>' +
      '<div class="actions card-actions"><button type="button" class="button secondary danger" data-acao="excluir">Excluir visita</button></div>' +
      '</article>';
  }

  function desenharHistorico() {
    var lista = EcoStore.listar('checklists').slice().sort(function (a, b) {
      return (b.data + b.criadoEm).localeCompare(a.data + a.criadoEm);
    });
    contadorHistorico.textContent = lista.length + (lista.length === 1 ? ' visita registrada' : ' visitas registradas');
    historico.innerHTML = lista.length
      ? lista.map(desenharVisita).join('')
      : '<p class="muted vazio">Nenhuma visita salva ainda. Preencha o checklist acima e salve a primeira avaliação.</p>';
  }

  historico.addEventListener('click', function (evento) {
    var botao = evento.target.closest('button[data-acao="excluir"]');
    if (!botao) return;
    if (!window.confirm('Excluir esta visita do histórico?')) return;
    EcoStore.remover('checklists', botao.closest('.visita-card').getAttribute('data-id'));
    desenharHistorico();
  });

  /* ---- Início ---- */
  EcoStore.preencherSelectUnidades(selectUnidade);
  campoData.value = hoje();
  if (!EcoStore.listar('unidades').length) {
    avisar('Nenhuma unidade cadastrada. <a href="unidades.html">Cadastre uma unidade primeiro →</a>', 'erro');
  }
  atualizarProgresso();
  desenharHistorico();
})();
