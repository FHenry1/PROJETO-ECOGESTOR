(function () {
  'use strict';

  var form = document.getElementById('form-registro');
  var selectUnidade = document.getElementById('unidade');
  var campoMes = document.getElementById('competencia');
  var semanas = Array.prototype.slice.call(document.querySelectorAll('.semana'));
  var obs = document.getElementById('observacoes');
  var totalEl = document.getElementById('total-registro');
  var mensagem = document.getElementById('mensagem-form');
  var botaoSalvar = document.getElementById('btn-salvar');

  var registroAtualId = null;

  function avisar(html, tipo) {
    mensagem.innerHTML = html;
    mensagem.className = 'notice' + (tipo === 'erro' ? ' notice-erro' : '');
    mensagem.hidden = !html;
  }

  function mesAtual() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }

  function valores() {
    return semanas.map(function (campo) {
      var n = parseFloat(campo.value);
      return isNaN(n) ? 0 : n;
    });
  }

  function atualizarTotal() {
    var total = valores().reduce(function (a, b) { return a + b; }, 0);
    totalEl.textContent = EcoStore.formatarKg(total) + ' kg';
  }


  function carregarExistente() {
    var unidadeId = selectUnidade.value;
    var mes = campoMes.value;
    registroAtualId = null;
    botaoSalvar.textContent = 'Salvar registro';
    if (!unidadeId || !mes) return;

    var existente = EcoStore.listar('registros').filter(function (r) {
      return r.unidadeId === unidadeId && r.mes === mes;
    })[0];

    if (existente) {
      registroAtualId = existente.id;
      semanas.forEach(function (campo, i) { campo.value = existente.semanas[i] ? existente.semanas[i] : (existente.semanas[i] === 0 ? '0' : ''); });
      obs.value = existente.obs || '';
      botaoSalvar.textContent = 'Atualizar registro';
      avisar('Já existe um registro desta unidade neste mês. Os valores foram carregados para edição.');
    } else {
      semanas.forEach(function (campo) { campo.value = ''; });
      obs.value = '';
      avisar('');
    }
    atualizarTotal();
  }

  function limpar() {
    form.reset();
    campoMes.value = mesAtual();
    registroAtualId = null;
    botaoSalvar.textContent = 'Salvar registro';
    form.querySelectorAll('[aria-invalid]').forEach(function (c) { c.removeAttribute('aria-invalid'); });
    avisar('');
    atualizarTotal();
  }

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    form.querySelectorAll('[aria-invalid]').forEach(function (c) { c.removeAttribute('aria-invalid'); });

    var erros = [];
    if (!selectUnidade.value) erros.push({ campo: selectUnidade, texto: 'Selecione a unidade.' });
    if (!campoMes.value) erros.push({ campo: campoMes, texto: 'Informe o mês de referência.' });
    semanas.forEach(function (campo, i) {
      var obrigatoria = i < 4;
      if (obrigatoria && campo.value === '') erros.push({ campo: campo, texto: 'Preencha a semana ' + (i + 1) + ' (use 0 se não houve registro).' });
      else if (campo.value !== '' && parseFloat(campo.value) < 0) erros.push({ campo: campo, texto: 'A semana ' + (i + 1) + ' não pode ser negativa.' });
    });

    if (erros.length) {
      erros.forEach(function (e) { e.campo.setAttribute('aria-invalid', 'true'); });
      avisar(EcoStore.escapar(erros[0].texto) + (erros.length > 1 ? ' (mais ' + (erros.length - 1) + ' campo(s) para corrigir)' : ''), 'erro');
      erros[0].campo.focus();
      return;
    }

    var dados = {
      unidadeId: selectUnidade.value,
      mes: campoMes.value,
      semanas: valores(),
      obs: obs.value.trim()
    };

    var total = EcoStore.formatarKg(dados.semanas.reduce(function (a, b) { return a + b; }, 0));
    if (registroAtualId) EcoStore.atualizar('registros', registroAtualId, dados);
    else registroAtualId = EcoStore.inserir('registros', dados).id;

    botaoSalvar.textContent = 'Atualizar registro';
    avisar('Registro salvo: <strong>' + total + ' kg</strong> em ' + EcoStore.nomeDoMes(dados.mes) + '. <a href="residuos.html">Ver em Resíduos →</a>');
  });

  semanas.forEach(function (campo) { campo.addEventListener('input', atualizarTotal); });
  selectUnidade.addEventListener('change', carregarExistente);
  campoMes.addEventListener('change', carregarExistente);
  document.getElementById('btn-limpar').addEventListener('click', limpar);


  EcoStore.preencherSelectUnidades(selectUnidade);
  campoMes.value = mesAtual();
  var pedida = new URLSearchParams(window.location.search).get('unidade');
  if (pedida) selectUnidade.value = pedida;
  if (!EcoStore.listar('unidades').length) {
    avisar('Nenhuma unidade cadastrada. <a href="unidades.html">Cadastre uma unidade primeiro →</a>', 'erro');
  }
  carregarExistente();
  atualizarTotal();
})();
