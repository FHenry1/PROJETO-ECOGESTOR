/* EcoGestor — Unidades (CRUD) */
(function () {
  'use strict';

  var form = document.getElementById('form-unidade');
  var lista = document.getElementById('lista-unidades');
  var titulo = document.getElementById('titulo-form');
  var botaoSalvar = document.getElementById('btn-salvar');
  var botaoCancelar = document.getElementById('btn-cancelar');
  var mensagem = document.getElementById('mensagem-form');
  var contador = document.getElementById('contador-unidades');
  var campoBusca = document.getElementById('busca-unidade');

  var editandoId = null;

  function avisar(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = 'notice' + (tipo === 'erro' ? ' notice-erro' : '');
    mensagem.hidden = !texto;
  }

  function resumoDaUnidade(unidade) {
    var registros = EcoStore.registrosDaUnidade(unidade.id);
    var mes = EcoStore.ultimoMes();
    var doMes = registros.filter(function (r) { return r.mes === mes; });
    var total = doMes.reduce(function (soma, r) { return soma + EcoStore.totalRegistro(r); }, 0);
    return { mes: mes, total: total, temRegistro: doMes.length > 0 };
  }

  function cartao(unidade) {
    var resumo = resumoDaUnidade(unidade);
    var volume = resumo.temRegistro
      ? 'Volume em ' + EcoStore.nomeDoMes(resumo.mes) + ': <strong>' + EcoStore.formatarKg(resumo.total) + ' kg</strong>.'
      : 'Ainda sem registros de resíduos.';
    var endereco = unidade.endereco ? EcoStore.escapar(unidade.endereco) : 'Não informado';

    return '<article class="panel unit-card" data-id="' + EcoStore.escapar(unidade.id) + '">' +
      '<h2>' + EcoStore.escapar(unidade.nome) + '</h2>' +
      '<p>' + EcoStore.escapar(unidade.cidade) + ' · PB</p>' +
      '<details><summary>Informações da unidade</summary>' +
        '<p>Endereço: ' + endereco + '.</p>' +
        '<p>' + volume + '</p>' +
        '<p><a href="registro.html?unidade=' + encodeURIComponent(unidade.id) + '">Abrir formulário de registro →</a></p>' +
      '</details>' +
      '<div class="actions card-actions">' +
        '<button type="button" class="button secondary" data-acao="editar">Editar</button>' +
        '<button type="button" class="button secondary danger" data-acao="excluir">Excluir</button>' +
      '</div>' +
    '</article>';
  }

  function desenhar() {
    var termo = (campoBusca.value || '').trim().toLowerCase();
    var todas = EcoStore.listar('unidades');
    var filtradas = todas.filter(function (u) {
      return !termo || (u.nome + ' ' + u.cidade).toLowerCase().indexOf(termo) !== -1;
    });

    contador.textContent = filtradas.length + (filtradas.length === 1 ? ' unidade' : ' unidades');

    if (!filtradas.length) {
      lista.innerHTML = '<p class="muted vazio">' +
        (todas.length ? 'Nenhuma unidade encontrada para essa busca.' : 'Nenhuma unidade cadastrada. Use o formulário acima para criar a primeira.') +
        '</p>';
      return;
    }
    lista.innerHTML = filtradas.map(cartao).join('');
  }

  function limparFormulario() {
    editandoId = null;
    form.reset();
    titulo.textContent = 'Nova unidade';
    botaoSalvar.textContent = 'Cadastrar unidade';
    botaoCancelar.hidden = true;
    form.querySelectorAll('[aria-invalid]').forEach(function (campo) { campo.removeAttribute('aria-invalid'); });
  }

  function validar(dados) {
    var erros = [];
    if (dados.nome.length < 3) erros.push({ campo: 'nome', texto: 'Informe o nome da unidade (mínimo de 3 caracteres).' });
    if (dados.cidade.length < 2) erros.push({ campo: 'cidade', texto: 'Informe a cidade.' });

    var duplicada = EcoStore.listar('unidades').some(function (u) {
      return u.id !== editandoId &&
        u.nome.toLowerCase() === dados.nome.toLowerCase() &&
        u.cidade.toLowerCase() === dados.cidade.toLowerCase();
    });
    if (duplicada) erros.push({ campo: 'nome', texto: 'Já existe uma unidade com esse nome nessa cidade.' });
    return erros;
  }

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    form.querySelectorAll('[aria-invalid]').forEach(function (campo) { campo.removeAttribute('aria-invalid'); });

    var dados = {
      nome: form.nome.value.trim(),
      cidade: form.cidade.value.trim(),
      endereco: form.endereco.value.trim()
    };

    var erros = validar(dados);
    if (erros.length) {
      avisar(erros.map(function (e) { return e.texto; }).join(' '), 'erro');
      var primeiro = form.elements[erros[0].campo];
      erros.forEach(function (e) { form.elements[e.campo].setAttribute('aria-invalid', 'true'); });
      primeiro.focus();
      return;
    }

    if (editandoId) {
      EcoStore.atualizar('unidades', editandoId, dados);
      avisar('Unidade atualizada com sucesso.');
    } else {
      EcoStore.inserir('unidades', dados);
      avisar('Unidade cadastrada com sucesso.');
    }
    limparFormulario();
    desenhar();
  });

  botaoCancelar.addEventListener('click', function () {
    limparFormulario();
    avisar('');
  });

  campoBusca.addEventListener('input', desenhar);

  lista.addEventListener('click', function (evento) {
    var botao = evento.target.closest('button[data-acao]');
    if (!botao) return;
    var id = botao.closest('.unit-card').getAttribute('data-id');
    var unidade = EcoStore.buscar('unidades', id);
    if (!unidade) return;

    if (botao.getAttribute('data-acao') === 'editar') {
      editandoId = id;
      form.nome.value = unidade.nome;
      form.cidade.value = unidade.cidade;
      form.endereco.value = unidade.endereco || '';
      titulo.textContent = 'Editar unidade';
      botaoSalvar.textContent = 'Salvar alterações';
      botaoCancelar.hidden = false;
      avisar('');
      form.nome.focus();
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    var qtdRegistros = EcoStore.registrosDaUnidade(id).length;
    var aviso = 'Excluir "' + unidade.nome + '"?';
    if (qtdRegistros) aviso += '\n\nOs ' + qtdRegistros + ' registro(s) de resíduos dessa unidade também serão removidos.';
    if (!window.confirm(aviso)) return;

    EcoStore.listar('registros')
      .filter(function (r) { return r.unidadeId === id; })
      .forEach(function (r) { EcoStore.remover('registros', r.id); });
    EcoStore.remover('unidades', id);
    if (editandoId === id) limparFormulario();
    avisar('Unidade excluída.');
    desenhar();
  });

  document.getElementById('btn-restaurar').addEventListener('click', function () {
    if (!window.confirm('Restaurar os dados de demonstração? Unidades e registros atuais serão substituídos.')) return;
    EcoStore.restaurarDemonstracao();
    limparFormulario();
    avisar('Dados de demonstração restaurados.');
    desenhar();
  });

  desenhar();
})();
