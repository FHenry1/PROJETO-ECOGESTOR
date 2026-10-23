# Checklist de etapas — EcoGestor em HTML e CSS

Objetivo: reescrever a interface do projeto existente para a disciplina de Desenvolvimento Front-end para Web, utilizando somente HTML e CSS. Esta entrega é a primeira versão estática navegável.

## 1. Levantamento e organização

- [x] Identificar as tecnologias do projeto original.
- [x] Mapear as rotas e separar telas existentes de itens de menu ainda sem implementação.
- [x] Criar a pasta `PROJETO-ECOGESTOR-HTML-CSS` sem modificar o original.
- [x] Definir o escopo da demonstração e documentar as limitações.
- [ ] Conferir o enunciado completo e a rubrica de avaliação do professor.
- [ ] Definir integrantes, responsabilidades e prazo de apresentação.

## 2. Estrutura visual e HTML semântico

- [x] Criar páginas HTML com idioma, título, descrição e viewport.
- [x] Organizar imagens locais e um arquivo CSS compartilhado.
- [x] Adaptar a identidade visual SIGER/EcoGestor.
- [x] Implementar cabeçalho, navegação, conteúdo principal e rodapé.
- [x] Estilizar cartões, tabelas, formulários e estados de foco.
- [x] Adicionar layouts responsivos com Grid, Flexbox e media queries.

## 3. Primeira conversão das telas

- [x] Apresentação: `index.html`.
- [x] Modelo de acesso: `login.html`.
- [x] Modelo de cadastro: `cadastro.html`.
- [x] Início e dashboard consolidados: `painel.html`.
- [x] Demonstrativo mensal: `residuos.html`.
- [x] Lista e detalhes de unidades: `unidades.html`.
- [x] Entrada manual com cinco campos semanais: `registro.html`.
- [x] Checklist do colaborador, com as sete seções originais: `checklist.html`.
- [x] Modelo de perfil e notificações: `configuracoes.html`.
- [x] Usar dados fictícios consistentes entre tabelas e indicadores.
- [x] Identificar controles sem gravação e disponibilizar navegação de demonstração.

## 4. Revisão e validação

- [x] Associar rótulos aos campos e agrupar respostas com `fieldset` e `legend`.
- [x] Usar cabeçalhos e legendas de tabela e descrição textual do gráfico.
- [x] Incluir acesso direto ao conteúdo e foco visível para teclado.
- [x] Verificar todos os links e recursos locais: 113 referências sem arquivos ou âncoras ausentes.
- [x] Conferir as nove páginas no Chromium em 1440, 768, 390 e 320 pixels, sem transbordamento horizontal da página.
- [x] Verificar expansão de detalhes, seleção exclusiva de respostas e limpeza dos formulários.
- [ ] Validar o HTML e CSS nos validadores indicados pelo professor.
- [ ] Fazer uma revisão de acessibilidade com leitor de tela.
- [ ] Revisar o conteúdo e a apresentação com o grupo.

Verificação realizada em 13/10/2026: abertura direta dos arquivos HTML, imagens carregadas, ausência de scripts, um título principal por página, rótulos dos campos e ausência de IDs duplicados. Inspeção visual de capturas da apresentação no celular e do painel no computador. A validação formal de HTML/CSS e a revisão com leitor de tela continuam pendentes.

## 5. Entrega acadêmica

- [x] Escrever instruções de abertura e mapa dos arquivos no README.
- [x] Explicar as diferenças entre a interface estática e o sistema original.
- [ ] Acrescentar os nomes dos integrantes e dados da disciplina.
- [ ] Preparar a apresentação: problema, público, telas e recursos de HTML/CSS utilizados.
- [ ] Separar capturas de tela para a apresentação, caso solicitado.
- [ ] Entregar a pasta conforme o formato solicitado pelo professor.

## 6. Evolução futura — somente se houver programação no escopo

Estas tarefas não são necessárias para concluir uma entrega exclusivamente em HTML e CSS.

- [ ] Implementar validações com retorno de resultado, cálculos e filtros em JavaScript.
- [ ] Implementar cadastro, edição e exclusão de unidades e resíduos.
- [ ] Salvar registros e respostas do checklist com histórico por visita.
- [ ] Implementar autenticação e controle de acesso com backend apropriado.
- [ ] Conectar um banco de dados e substituir os exemplos por dados autorizados.
- [ ] Planejar coletas, rastreamento, usuários, relatórios, MTR e upload conforme requisitos reais.
- [ ] Reavaliar os testes após a introdução de comportamento dinâmico.
