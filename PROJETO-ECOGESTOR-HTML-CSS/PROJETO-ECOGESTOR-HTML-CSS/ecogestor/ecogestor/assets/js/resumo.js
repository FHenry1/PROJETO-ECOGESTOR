/* EcoGestor — resumos mensais e seletor de mês (usado por painel e resíduos) */
(function () {
  'use strict';

  EcoStore.mesesDisponiveis = function () {
    var vistos = {};
    EcoStore.listar('registros').forEach(function (r) { vistos[r.mes] = true; });
    return Object.keys(vistos).sort().reverse();
  };

  /* Consolida o mês: uma linha por unidade, totais por semana e geral */
  EcoStore.resumoMensal = function (mes) {
    var registros = EcoStore.listar('registros').filter(function (r) { return r.mes === mes; });
    var linhas = EcoStore.listar('unidades').map(function (u) {
      var r = registros.filter(function (x) { return x.unidadeId === u.id; })[0] || null;
      return { unidade: u, registro: r, total: r ? EcoStore.totalRegistro(r) : 0 };
    });
    var semanas = [0, 0, 0, 0, 0];
    linhas.forEach(function (l) {
      if (!l.registro) return;
      l.registro.semanas.forEach(function (kg, i) { semanas[i] += Number(kg) || 0; });
    });
    var total = linhas.reduce(function (a, l) { return a + l.total; }, 0);
    var comRegistro = linhas.filter(function (l) { return l.registro; }).length;
    return {
      mes: mes,
      linhas: linhas,
      semanas: semanas,
      total: total,
      comRegistro: comRegistro,
      media: comRegistro ? total / comRegistro : 0
    };
  };

  /* Preenche o <select> de meses e chama aoMudar(mes) ao iniciar e a cada troca */
  EcoStore.iniciarSeletorMes = function (select, aoMudar) {
    var meses = EcoStore.mesesDisponiveis();
    select.innerHTML = '';
    if (!meses.length) {
      var vazio = document.createElement('option');
      vazio.textContent = 'Sem registros';
      vazio.value = '';
      select.appendChild(vazio);
      select.disabled = true;
      aoMudar('');
      return;
    }
    meses.forEach(function (m) {
      var op = document.createElement('option');
      op.value = m;
      op.textContent = EcoStore.nomeDoMes(m);
      select.appendChild(op);
    });
    select.addEventListener('change', function () { aoMudar(select.value); });
    aoMudar(select.value);
  };

  /* Cartões de indicadores (iguais nas duas páginas) */
  EcoStore.desenharIndicadores = function (alvo, resumo) {
    var ref = resumo.mes ? 'Referência: ' + EcoStore.nomeDoMes(resumo.mes) : 'Sem registros';
    alvo.innerHTML =
      '<article class="panel stat"><p>Total de resíduos</p><strong>' + EcoStore.formatarKg(resumo.total) + ' <small>kg</small></strong><small>Somatório das unidades com registro</small></article>' +
      '<article class="panel stat"><p>Unidades acompanhadas</p><strong>' + String(resumo.comRegistro).padStart(2, '0') + '</strong><small>De ' + resumo.linhas.length + ' unidades cadastradas</small></article>' +
      '<article class="panel stat"><p>Média por unidade</p><strong>' + EcoStore.formatarKg(resumo.media) + ' <small>kg</small></strong><small>' + EcoStore.escapar(ref) + '</small></article>';
  };

  /* Linhas da tabela de registros (cinco semanas) */
  EcoStore.desenharTabela = function (tbody, tfoot, resumo) {
    var E = EcoStore.escapar;
    if (!resumo.linhas.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="muted">Nenhuma unidade cadastrada. <a href="unidades.html">Cadastrar unidade →</a></td></tr>';
      tfoot.innerHTML = '';
      return;
    }
    tbody.innerHTML = resumo.linhas.map(function (l) {
      var celulas = [0, 1, 2, 3, 4].map(function (i) {
        return '<td>' + (l.registro ? EcoStore.formatarKg(l.registro.semanas[i] || 0) : '—') + '</td>';
      }).join('');
      var total = l.registro ? EcoStore.formatarKg(l.total) : '—';
      return '<tr><th scope="row">' + E(l.unidade.nome) + '</th><td>' + E(l.unidade.cidade) + '</td>' + celulas + '<td>' + total + '</td></tr>';
    }).join('');
    tfoot.innerHTML = '<tr><th scope="row" colspan="2">Total</th>' +
      resumo.semanas.map(function (s) { return '<td>' + EcoStore.formatarKg(s) + '</td>'; }).join('') +
      '<td>' + EcoStore.formatarKg(resumo.total) + '</td></tr>';
  };
})();
