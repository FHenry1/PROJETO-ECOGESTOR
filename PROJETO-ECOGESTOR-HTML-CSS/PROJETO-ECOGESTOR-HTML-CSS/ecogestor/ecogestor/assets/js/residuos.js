/* EcoGestor — página Resíduos */
(function () {
  'use strict';
  var select = document.getElementById('filtro-mes');
  var indicadores = document.getElementById('indicadores');
  var tbody = document.getElementById('tabela-corpo');
  var tfoot = document.getElementById('tabela-rodape');
  var legenda = document.getElementById('legenda-tabela');
  var badge = document.getElementById('badge-mes');

  EcoStore.iniciarSeletorMes(select, function (mes) {
    var resumo = EcoStore.resumoMensal(mes);
    EcoStore.desenharIndicadores(indicadores, resumo);
    EcoStore.desenharTabela(tbody, tfoot, resumo);
    var nome = mes ? EcoStore.nomeDoMes(mes) : 'sem registros';
    legenda.textContent = 'Demonstrativo de ' + nome + ' · Valores em quilogramas (kg).';
    badge.textContent = mes ? mes.split('-')[1] + ' / ' + mes.split('-')[0] : '—';
    if (!mes) {
      tbody.innerHTML = '<tr><td colspan="8" class="muted">Nenhum registro ainda. <a href="registro.html">Fazer a primeira entrada →</a></td></tr>';
    }
  });
})();
