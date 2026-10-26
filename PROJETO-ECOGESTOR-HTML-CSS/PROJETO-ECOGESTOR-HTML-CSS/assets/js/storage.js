(function () {
  'use strict';


  var MODO = 'real';
  try { if (localStorage.getItem('ecogestor:modo') === 'demo') MODO = 'demo'; } catch (e) { /* ignora */ }
  var PREFIXO = MODO === 'demo' ? 'ecogestor-demo:' : 'ecogestor-dados:';

  var SEED_DEMO = {
    unidades: [
      { id: 'u-centro', nome: 'Unidade Centro', cidade: 'João Pessoa', endereco: 'Rua das Palmeiras, 120' },
      { id: 'u-norte',  nome: 'Unidade Norte',  cidade: 'Guarabira',   endereco: 'Rua do Sol, 45' },
      { id: 'u-sul',    nome: 'Unidade Sul',    cidade: 'Santa Rita',  endereco: 'Avenida das Flores, 210' },
      { id: 'u-leste',  nome: 'Unidade Leste',  cidade: 'Bayeux',      endereco: 'Rua do Jardim, 32' }
    ],

    registros: [
      { id: 'r-centro-2026-09', unidadeId: 'u-centro', mes: '2026-09', semanas: [80, 120, 100, 140, 0], obs: '' },
      { id: 'r-norte-2026-09',  unidadeId: 'u-norte',  mes: '2026-09', semanas: [60, 90, 70, 110, 0],  obs: '' },
      { id: 'r-sul-2026-09',    unidadeId: 'u-sul',    mes: '2026-09', semanas: [40, 60, 50, 70, 0],   obs: '' },
      { id: 'r-leste-2026-09',  unidadeId: 'u-leste',  mes: '2026-09', semanas: [20, 30, 20, 20, 0],   obs: '' }
    ],
    checklists: [],
    usuarios: []
  };
  var SEED_REAL = { unidades: [], registros: [], checklists: [], usuarios: [] };
  var SEED = MODO === 'demo' ? SEED_DEMO : SEED_REAL;

  function ler(colecao) {
    try {
      var bruto = localStorage.getItem(PREFIXO + colecao);
      if (bruto === null) {
        var inicial = SEED[colecao] ? JSON.parse(JSON.stringify(SEED[colecao])) : [];
        gravar(colecao, inicial);
        return inicial;
      }
      var dados = JSON.parse(bruto);
      return Array.isArray(dados) ? dados : [];
    } catch (e) {
      return SEED[colecao] ? JSON.parse(JSON.stringify(SEED[colecao])) : [];
    }
  }

  function gravar(colecao, dados) {
    try {
      localStorage.setItem(PREFIXO + colecao, JSON.stringify(dados));
      return true;
    } catch (e) {
      return false;
    }
  }

  function novoId(prefixo) {
    return (prefixo || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  var EcoStore = {
    modo: MODO,
    listar: ler,
    salvarTudo: gravar,
    novoId: novoId,

    buscar: function (colecao, id) {
      return ler(colecao).filter(function (item) { return item.id === id; })[0] || null;
    },

    inserir: function (colecao, item) {
      var lista = ler(colecao);
      item.id = item.id || novoId(colecao.charAt(0));
      lista.push(item);
      gravar(colecao, lista);
      return item;
    },

    atualizar: function (colecao, id, alteracoes) {
      var lista = ler(colecao);
      var alterado = null;
      lista = lista.map(function (item) {
        if (item.id !== id) return item;
        alterado = Object.assign({}, item, alteracoes);
        return alterado;
      });
      gravar(colecao, lista);
      return alterado;
    },

    remover: function (colecao, id) {
      var lista = ler(colecao).filter(function (item) { return item.id !== id; });
      gravar(colecao, lista);
    },

    restaurarDemonstracao: function () {
      Object.keys(SEED).forEach(function (colecao) {
        gravar(colecao, JSON.parse(JSON.stringify(SEED[colecao])));
      });
    },


    totalRegistro: function (registro) {
      return registro.semanas.reduce(function (soma, kg) { return soma + (Number(kg) || 0); }, 0);
    },

    registrosDaUnidade: function (unidadeId) {
      return ler('registros').filter(function (r) { return r.unidadeId === unidadeId; });
    },

    ultimoMes: function () {
      var meses = ler('registros').map(function (r) { return r.mes; }).sort();
      return meses.length ? meses[meses.length - 1] : null;
    },


    formatarKg: function (valor) {
      return Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    },

    nomeDoMes: function (mes) {
      if (!mes) return '';
      var partes = mes.split('-');
      var nomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      return nomes[Number(partes[1]) - 1] + ' de ' + partes[0];
    },


    preencherSelectUnidades: function (select) {
      if (!select) return;
      var valorAtual = select.value;
      select.innerHTML = '';
      var vazio = document.createElement('option');
      vazio.value = '';
      vazio.textContent = 'Selecione uma unidade';
      select.appendChild(vazio);
      ler('unidades').forEach(function (u) {
        var opcao = document.createElement('option');
        opcao.value = u.id;
        opcao.textContent = u.nome + ' — ' + u.cidade;
        select.appendChild(opcao);
      });
      select.value = valorAtual;
    },


    escapar: function (texto) {
      var div = document.createElement('div');
      div.textContent = texto == null ? '' : String(texto);
      return div.innerHTML;
    }
  };

  window.EcoStore = EcoStore;
})();
