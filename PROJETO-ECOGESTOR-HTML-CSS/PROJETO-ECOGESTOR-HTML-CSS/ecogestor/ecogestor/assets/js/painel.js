/* EcoGestor — Visão geral (painel) */
(function () {
  'use strict';
  var select = document.getElementById('filtro-mes');
  var indicadores = document.getElementById('indicadores');
  var tbody = document.getElementById('tabela-corpo');
  var tfoot = document.getElementById('tabela-rodape');
  var legenda = document.getElementById('legenda-tabela');
  var grafico = document.getElementById('grafico');
  var rotulos = document.getElementById('grafico-rotulos');
  var descGrafico = document.getElementById('grafico-descricao');
  var porUnidade = document.getElementById('lista-por-unidade');
  var badges = document.querySelectorAll('.badge-mes');
  var ALTURA_MAX = 170;

  function desenharGrafico(resumo) {
    var maior = Math.max.apply(null, resumo.semanas.concat([1]));
    var maiorIdx = resumo.semanas.indexOf(Math.max.apply(null, resumo.semanas));
    grafico.innerHTML = resumo.semanas.map(function (kg, i) {
      var h = Math.round((kg / maior) * ALTURA_MAX);
      var destaque = resumo.total > 0 && i === maiorIdx ? ' style="height:' + h + 'px;background:var(--green)"' : ' style="height:' + h + 'px"';
      return '<div class="chart-column"><span>' + EcoStore.formatarKg(kg) + ' kg</span><div class="chart-bar"' + destaque + '></div></div>';
    }).join('');
    rotulos.innerHTML = resumo.semanas.map(function (_, i) { return '<span>Semana ' + (i + 1) + '</span>'; }).join('');
    descGrafico.textContent = 'Volume semanal: ' + resumo.semanas.map(function (kg) { return EcoStore.formatarKg(kg); }).join(', ') + ' kg. Os mesmos valores estão na tabela abaixo.';
  }

  function desenharUnidades(resumo) {
    var E = EcoStore.escapar;
    if (!resumo.linhas.length) {
      porUnidade.innerHTML = '<li><span class="muted">Nenhuma unidade cadastrada.</span></li>';
      return;
    }
    porUnidade.innerHTML = resumo.linhas.map(function (l) {
      return '<li><span>' + E(l.unidade.nome) + '<br><small class="muted">' + E(l.unidade.cidade) + '</small></span><strong>' +
        (l.registro ? EcoStore.formatarKg(l.total) + ' kg' : 'sem registro') + '</strong></li>';
    }).join('');
  }

  EcoStore.iniciarSeletorMes(select, function (mes) {
    var resumo = EcoStore.resumoMensal(mes);
    EcoStore.desenharIndicadores(indicadores, resumo);
    EcoStore.desenharTabela(tbody, tfoot, resumo);
    desenharGrafico(resumo);
    desenharUnidades(resumo);
    var nome = mes ? EcoStore.nomeDoMes(mes) : 'sem registros';
    legenda.textContent = nome.charAt(0).toUpperCase() + nome.slice(1) + ' · Valores em quilogramas (kg).';
    badges.forEach(function (b) { b.textContent = mes ? mes.split('-')[1] + ' / ' + mes.split('-')[0] : '—'; });
    if (!mes) tbody.innerHTML = '<tr><td colspan="8" class="muted">Nenhum registro ainda. <a href="registro.html">Fazer a primeira entrada →</a></td></tr>';
  });
})();
