# EcoGestor — Sistema de Gerenciamento de Resíduos

Projeto acadêmico da disciplina de Desenvolvimento Front-end para Web, desenvolvido em **HTML5 e CSS3** para apresentar uma interface de acompanhamento de resíduos de unidades de saúde.

O sistema reúne dashboard, demonstrativos mensais, informações de unidades, formulários e checklist do colaborador.

## Tecnologias utilizadas

- **HTML5:** estrutura das páginas, navegação, tabelas e formulários.
- **CSS3:** identidade visual, layouts com Grid e Flexbox, responsividade e controles de exibição.
- **SVG:** imagens vetoriais dos gráficos.

Os arquivos e recursos são locais. Não é necessário instalar dependências ou ter conexão com a internet para abrir o projeto.

## Como executar

Abra o arquivo `index.html` diretamente no navegador.

Também é possível utilizar a extensão Live Server do editor ou executar o comando abaixo dentro da pasta do projeto, caso o Python esteja instalado:

```bash
python3 -m http.server 8765
```

Depois, acesse `http://localhost:8765`. Para encerrar o servidor, pressione `Ctrl+C`.

Para utilizar a alternância dos gráficos e o recolhimento das colunas, abra o projeto em um navegador com suporte ao seletor CSS `:has()`.

## Estrutura de arquivos

```text
PROJETO-ECOGESTOR-HTML-CSS/
├── index.html              Apresentação do projeto
├── login.html              Interface de acesso
├── cadastro.html           Interface de cadastro
├── painel.html             Dashboard de gerenciamento
├── residuos.html           Demonstrativo mensal de resíduos
├── unidades.html           Lista e detalhes das unidades
├── registro.html           Formulário de entrada manual
├── checklist.html          Avaliação do colaborador
├── configuracoes.html      Perfil e preferências
├── assets/
│   ├── css/
│   │   ├── style.css       Estilos gerais das páginas
│   │   └── dashboard-*.css Estilos do dashboard
│   └── img/
│       └── graficos/       Gráficos vetoriais em SVG
├── README.md               Documentação do projeto
└── CHECKLIST.md            Acompanhamento das etapas
```

## Páginas e recursos

| Página | Descrição |
| --- | --- |
| Apresentação | Objetivo do projeto e acesso às telas do sistema. |
| Acesso e cadastro | Formulários demonstrativos de identificação do usuário. |
| Dashboard | Indicadores, gráficos, alertas e análise por unidade. |
| Resíduos | Tabela com volumes semanais e totais mensais. |
| Unidades | Cartões com informações e detalhes expansíveis. |
| Entrada manual | Seleção da unidade e do período, cinco campos semanais e observações. |
| Checklist | Avaliação de sete ambientes, com opções de conformidade e identificação da visita. |
| Configurações | Campos de perfil e preferências de notificação. |

### Dashboard

O painel apresenta quatro indicadores: total mensal, média por unidade, maior geração e menor geração de resíduos.

- Alternância entre gráficos de barras, pizza, linhas e área.
- Recolhimento do menu lateral e do painel de filtros.
- Cartões de atenção prioritária e análise por unidade.
- Tabela expansível com os valores do gráfico de barras.
- Acesso ao formulário de entrada manual.

A alternância dos gráficos utiliza botões de opção e seletores CSS. Os gráficos são imagens SVG com valores fixos.

### Formulários e checklist

Os campos permitem preenchimento, seleção de opções e limpeza das respostas. O checklist organiza as perguntas em sete seções expansíveis e permite selecionar uma resposta por item: conforme, não conforme ou não se aplica.

## Escopo funcional

O projeto é uma **interface estática**, com dados demonstrativos. Não utiliza JavaScript, APIs ou banco de dados.

- Login e cadastro não autenticam usuários nem criam contas.
- Os formulários não enviam nem salvam informações; os botões de gravação estão desabilitados.
- Os indicadores não são recalculados com o preenchimento dos campos.
- Busca e filtros do dashboard são ilustrativos e permanecem desabilitados.
- Os cartões de análise não abrem janelas de detalhes.
- Não há histórico de avaliações, upload de arquivos ou geração dinâmica de relatórios.

O navegador pode restaurar temporariamente alguns campos, mas isso não representa gravação dos dados pelo sistema.

## Dados demonstrativos

O dashboard apresenta o cenário de **janeiro de 2025**:

- Total de **246,60 kg** em nove unidades selecionadas.
- Média de **27,40 kg** por unidade.
- Maior geração: **35,20 kg**, em Mangabeira.
- Menor geração: **12,95 kg**, em Sapé II.

Os indicadores e gráficos consideram as nove unidades selecionadas. Os cartões de análise e atenção prioritária consideram 25 unidades. O percentual de 17,3% é ilustrativo e não resulta de uma comparação histórica calculada.

As páginas de resíduos e unidades apresentam um cenário independente, de **setembro de 2026**, com **1.080 kg** distribuídos entre quatro unidades e média de **270 kg**. Os totais semanais são 200, 300, 240 e 340 kg.

Esses exemplos são destinados à apresentação acadêmica e não representam uma operação real.

## Responsividade e acessibilidade

- Layouts para computador, tablet e celular.
- Rolagem horizontal contida para tabelas e gráficos quando necessário.
- Navegação por teclado e indicação visual de foco.
- Link para pular diretamente ao conteúdo principal.
- Rótulos nos campos de formulário.
- Agrupamento de perguntas com `fieldset` e `legend`.
- Cabeçalhos e legendas nas tabelas.
- Descrições dos gráficos e tabela de apoio no dashboard.

## Verificações realizadas

As nove páginas foram conferidas no Chromium em larguras de 1440, 768, 390 e 320 pixels. O dashboard também foi verificado em 1280 e 1024 pixels.

Foram conferidos:

- Abertura direta dos arquivos locais e carregamento das imagens.
- 124 referências locais e quatro arquivos SVG.
- Ausência de transbordamento horizontal da página nos tamanhos verificados.
- Alternância dos quatro gráficos e recolhimento das colunas.
- Navegação para a entrada manual.
- Expansão de detalhes, seleção exclusiva de respostas e limpeza dos formulários.

A validação formal de HTML/CSS e a revisão com leitor de tela permanecem como etapas de avaliação.

## Organização e manutenção

O arquivo `assets/css/style.css` concentra os estilos gerais. Os arquivos `assets/css/dashboard-*.css` organizam os estilos do dashboard, incluindo navegação, cabeçalho, layout e comportamento dos controles.

Para editar o projeto:

1. Altere o conteúdo diretamente no arquivo HTML da página correspondente.
2. Ajuste os estilos no arquivo CSS utilizado pela página.
3. Confira os links relativos ao modificar a navegação.
4. Verifique o resultado em diferentes tamanhos de tela.
5. Atualize `CHECKLIST.md` conforme as etapas forem concluídas.
Exibindo README.md.