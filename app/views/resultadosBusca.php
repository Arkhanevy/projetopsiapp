<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Resultados da busca - Podopsi</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" /><!-- Bootstrap 5 -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" /><!-- Material Symbols (Google) -->
  <link rel="stylesheet" href="public/assets/css/variaveis.css" /><!-- Variáveis globais -->
  <link rel="stylesheet" href="public/assets/css/componentes.css" /><!-- Componentes compartilhados -->
  <link rel="stylesheet" href="public/assets/css/resultadosBusca.css" /><!-- CSS próprio da página -->
</head>
<body>

  <a href="#conteudoResultados" class="linkPularConteudo">Pular para o conteúdo principal</a>

  <!-- NAVEGAÇÃO (DESLOGADO) — exibida por sessaoNavegacao.js quando não há sessão -->
  <nav class="navTopoDeslogado" aria-label="Navegação principal" hidden>
    <div class="navTopoDeslogado_barra navTopoDeslogado_acoes">
      <a href="index.php" class="navTopoDeslogado_logo">
        <img src="public/assets/images/logo.png" alt="Podopsi" width="50" height="50">
        <span data-nomePlataforma="">Podopsi</span>
      </a>
      <div class="navTopoDeslogado_acoes">
        <button type="button" class="nav-link dropdown-toggle navbar-brand navTopoDeslogado_acao" data-bs-toggle="dropdown">Cadastre-se</button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="index.php?uri=cadastroCliente">Sou um cliente</a></li>
          <li><a class="dropdown-item" href="index.php?uri=cadastroProfissional">Sou um profissional</a></li>
          <li><a class="dropdown-item" href="index.php?uri=cadastroClinica">Sou uma clínica</a></li>
        </ul>
        <button type="button" class="nav-link dropdown-toggle navbar-brand navTopoDeslogado_acao" data-bs-toggle="dropdown">Entrar</button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="index.php?uri=loginCliente">Sou um cliente</a></li>
          <li><a class="dropdown-item" href="index.php?uri=loginProfissional">Sou um profissional</a></li>
          <li><a class="dropdown-item" href="index.php?uri=loginClinica">Sou uma clínica</a></li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- BARRA SUPERIOR (LOGADO — DESKTOP E MOBILE) — exibida por JS quando há sessão -->
  <header class="navTopoLogado" hidden>
    <a href="index.php" class="navTopoLogado_logo">
      <img src="public/assets/images/logo.png" alt="" width="40" height="40">
      <span data-nomePlataforma="">Podopsi</span>
    </a>

    <!-- Desktop: menu hambúrguer em dropdown -->
    <div class="dropdown menuHamburguerLogado d-none d-md-block">
      <button type="button" class="menuHamburguerLogado_botao dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Abrir menu">
        <span class="material-symbols-outlined" aria-hidden="true">menu</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end menuHamburguerLogado_lista">
        <li><a href="index.php?uri=configuracao" class="dropdown-item menuHamburguerLogado_item"><span class="material-symbols-outlined" aria-hidden="true">settings</span>Configuração</a></li>
        <li><a href="index.php?uri=centralAjuda" class="dropdown-item menuHamburguerLogado_item"><span class="material-symbols-outlined" aria-hidden="true">support_agent</span>Central de ajuda</a></li>
        <li><a href="#" class="dropdown-item menuHamburguerLogado_item" data-acao="sair"><span class="material-symbols-outlined" aria-hidden="true">logout</span>Sair</a></li>
      </ul>
    </div>

    <!-- Mobile: o hambúrguer abre o painelMenuMobile (offcanvas) -->
    <button type="button" class="navTopoLogado_botaoMenuMobile d-md-none" data-bs-toggle="offcanvas" data-bs-target="#painelMenuMobileResultados" aria-controls="painelMenuMobileResultados" aria-label="Abrir menu">
      <span class="material-symbols-outlined" aria-hidden="true">menu</span>
    </button>
  </header>

  <!-- PAINEL DO MENU (MOBILE, LOGADO) -->
  <div class="offcanvas offcanvas-top painelMenuMobile d-md-none" tabindex="-1" id="painelMenuMobileResultados" aria-labelledby="tituloPainelMenuMobileResultados">
    <div class="offcanvas-header">
      <a href="index.php" class="painelMenuMobile_logo" id="tituloPainelMenuMobileResultados">
        <img src="public/assets/images/logo.png" alt="" width="40" height="40">
        <span data-nomePlataforma="">Podopsi</span>
      </a>
      <button type="button" class="painelMenuMobile_botaoFechar" data-bs-dismiss="offcanvas" aria-label="Fechar menu">
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
      </button>
    </div>
    <div class="offcanvas-body d-flex flex-column">
      <ul class="painelMenuMobile_lista">
        <li><a href="index.php?uri=configuracao" class="painelMenuMobile_item"><span class="material-symbols-outlined" aria-hidden="true">settings</span>Configuração</a></li>
        <li><a href="index.php?uri=centralAjuda" class="painelMenuMobile_item"><span class="material-symbols-outlined" aria-hidden="true">support_agent</span>Central de ajuda</a></li>
      </ul>
      <ul class="painelMenuMobile_rodape">
        <li><a href="#" class="painelMenuMobile_item" data-acao="sair"><span class="material-symbols-outlined" aria-hidden="true">logout</span>Sair</a></li>
      </ul>
    </div>
  </div>

  <!-- NAVEGAÇÃO LATERAL (DESKTOP, LOGADO) — exibida por JS quando há sessão -->
  <nav class="navLateralLogado d-none d-md-flex" data-papel="cliente" aria-label="Navegação principal" hidden>
    <a href="index.php?uri=buscar" class="navLateralLogado_item navLateralLogado_item--ativo" aria-current="page" data-itemPapel>
      <span class="material-symbols-outlined" aria-hidden="true">search</span>
      <span class="navLateralLogado_rotulo">Buscar</span>
    </a>
    <a href="index.php?uri=mensagens" class="navLateralLogado_item" data-itemContatos>
      <span class="material-symbols-outlined" aria-hidden="true">chat</span>
      <span class="navLateralLogado_rotulo">Contatos</span>
    </a>
    <a href="index.php?uri=notificacoes" class="navLateralLogado_item">
      <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
      <span class="navLateralLogado_rotulo">Notificação</span>
    </a>
    <a href="index.php?uri=consultasCli" class="navLateralLogado_item" data-itemAgenda>
      <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
      <span class="navLateralLogado_rotulo">Agenda</span>
    </a>
    <div class="navLateralLogado_rodape">
      <a href="index.php?uri=perfil" class="navLateralLogado_item" data-itemPerfil>
        <span class="material-symbols-outlined" aria-hidden="true">person</span>
        <span class="navLateralLogado_rotulo">Perfil</span>
      </a>
    </div>
  </nav>

  <div>

    <!-- CONTEÚDO PRINCIPAL -->
    <main id="conteudoResultados" class="conteudoResultados" aria-busy="true">

      <h1 class="visually-hidden">Resultados da busca</h1>

      <!-- Anuncia a quantidade de resultados para leitores de tela (preenchido pelo JS) -->
      <p class="visually-hidden" id="avisoResultados" role="status" aria-live="polite"></p>

      <!-- BARRA DE BUSCA: campoPesquisa (DS) + botão de filtros + abas -->
      <header class="barraBusca">
        <div class="barraBusca_campo">

          <div class="input-group campoPesquisa campoPesquisaResultados" id="campoPesquisaResultados" role="search">
            <input class="form-control campoPesquisa_input" id="entradaBuscaResultados" type="search" placeholder="Digite o nome do serviço" aria-label="Pesquisar" aria-describedby="avisoBuscaResultados" autocomplete="off" enterkeyhint="search">

            <!-- Botão de filtros: abre/fecha o painel (Bootstrap dropdown; Esc e clique fora fecham) -->
            <button type="button" class="btn campoPesquisa_botaoFiltro" id="botaoFiltros" data-bs-toggle="dropdown" data-bs-auto-close="outside" data-bs-reference="parent" aria-expanded="false" aria-controls="painelFiltrosBusca" aria-label="Filtrar resultados">
              <span class="material-symbols-outlined" aria-hidden="true">tune</span>
            </button>

            <!--
              PAINEL DE FILTROS (painelFiltro + grupoFiltro do DS)
              Um único painel; o JS mostra só os grupos da aba ativa, conforme
              data-abasFiltro (servicos | profissionais | clinicas).
              data-grupoFiltro = nome do filtro enviado ao backend.
            -->
            <div class="dropdown-menu dropdown-menu-end painelFiltro painelFiltro--flutuante" id="painelFiltrosBusca" role="group" aria-label="Filtros da busca">

              <!-- Preço (só Serviços). ESCONDIDO: o backend só filtra por valor exato. Para reativar, volte data-abasFiltro para "servicos" e trate a faixa em resultadosBusca.js. -->
              <fieldset class="grupoFiltro" id="grupoFiltroPreco" data-grupoFiltro="preco" data-abasFiltro="">
                <legend class="grupoFiltro_titulo">Preço</legend>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="filtroPreco" id="precoMenosDe50" value="menosDe50">
                  <label class="form-check-label" for="precoMenosDe50">Menos de R$50,00</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="filtroPreco" id="precoDe50a99" value="de50a99">
                  <label class="form-check-label" for="precoDe50a99">Entre R$50,00 e R$99,99</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="filtroPreco" id="precoDe100a199" value="de100a199">
                  <label class="form-check-label" for="precoDe100a199">Entre R$100,00 e R$199,99</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="filtroPreco" id="precoDe200a300" value="de200a300">
                  <label class="form-check-label" for="precoDe200a300">Entre R$200,00 e R$300,00</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="filtroPreco" id="precoMaisDe300" value="maisDe300">
                  <label class="form-check-label" for="precoMaisDe300">Mais de R$300,00</label>
                </div>
              </fieldset>

              <!-- Tipo de serviço (só Serviços): filtrado no navegador sobre ser_tipo, pois a busca de profissionais/clínicas não devolve o tipo. Opções de exemplo. -->
              <fieldset class="grupoFiltro" id="grupoFiltroTipoServico" data-grupoFiltro="tipoServico" data-abasFiltro="servicos">
                <legend class="grupoFiltro_titulo">Tipo de serviço</legend>
                <div data-campo="listaTiposServico">
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="filtroTipoServico" id="tipoServicoOpcao1" value="opcao1">
                    <label class="form-check-label" for="tipoServicoOpcao1">Opção 1</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="filtroTipoServico" id="tipoServicoOpcao2" value="opcao2">
                    <label class="form-check-label" for="tipoServicoOpcao2">Opção 2</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="filtroTipoServico" id="tipoServicoOpcao3" value="opcao3">
                    <label class="form-check-label" for="tipoServicoOpcao3">Opção 3</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="filtroTipoServico" id="tipoServicoOpcao4" value="opcao4">
                    <label class="form-check-label" for="tipoServicoOpcao4">Opção 4</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="filtroTipoServico" id="tipoServicoOpcao5" value="opcao5">
                    <label class="form-check-label" for="tipoServicoOpcao5">Opção 5</label>
                  </div>
                </div>
              </fieldset>

              <!-- Local de atendimento (só Profissionais). ESCONDIDO: o backend ainda não filtra por isso. -->
              <fieldset class="grupoFiltro" id="grupoFiltroLocalAtendimento" data-grupoFiltro="localAtendimento" data-abasFiltro="">
                <legend class="grupoFiltro_titulo">Local de atendimento</legend>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="filtroLocalAtendimento" id="localAtendimentoClinica" value="clinica">
                  <label class="form-check-label" for="localAtendimentoClinica">Na clínica</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="filtroLocalAtendimento" id="localAtendimentoCasaCliente" value="casaCliente">
                  <label class="form-check-label" for="localAtendimentoCasaCliente">Em domicílio</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="filtroLocalAtendimento" id="localAtendimentoCasa" value="casa">
                  <label class="form-check-label" for="localAtendimentoCasa">No endereço do profissional</label>
                </div>
              </fieldset>

              <!-- Localização (Profissionais e Clínicas). ESCONDIDO: o backend ainda não filtra por cidade. -->
              <fieldset class="grupoFiltro" id="grupoFiltroLocalizacao" data-grupoFiltro="cidade" data-abasFiltro="">
                <legend class="grupoFiltro_titulo">Localização</legend>
                <label class="visually-hidden" for="entradaCidade">Cidade</label>
                <input class="form-control" type="text" id="entradaCidade" name="filtroCidade" placeholder="Digite a cidade" autocomplete="off">
              </fieldset>

              <div class="painelFiltro_rodape">
                <button type="button" class="btn botaoBase botaoBase--primario painelFiltro_botaoAplicar" id="botaoAplicarFiltros">
                  <span class="material-symbols-outlined" aria-hidden="true">filter_alt</span>Filtrar
                </button>
                <button type="button" class="btn btn-link painelFiltro_botaoLimpar" id="botaoLimparFiltros">Limpar filtros</button>
              </div>
            </div>

            <button type="button" class="btn campoPesquisa_botaoIcone" id="botaoBuscarResultados" aria-label="Buscar">
              <span class="material-symbols-outlined" aria-hidden="true">search</span>
            </button>
          </div>
          <p class="barraBusca_aviso textoCaption" id="avisoBuscaResultados" role="alert" hidden>Digite algo para pesquisar.</p>

        </div>

        <!-- Abas (mesmo componente abasPerfil). O tipo de busca é escolhido aqui. -->
        <div class="nav nav-tabs abasPerfil abasResultados" id="abasResultados">
          <div class="abasPerfil_grupo" role="tablist" aria-label="Tipo de resultado">
            <button type="button" class="nav-link abasPerfil_aba active" id="abaServicos" data-bs-toggle="tab" data-bs-target="#painelServicos" role="tab" aria-controls="painelServicos" aria-selected="true" data-tipoBusca="servicos" data-placeholderBusca="Digite o nome do serviço">Serviços</button>
            <button type="button" class="nav-link abasPerfil_aba" id="abaProfissionais" data-bs-toggle="tab" data-bs-target="#painelProfissionais" role="tab" aria-controls="painelProfissionais" aria-selected="false" data-tipoBusca="profissionais" data-placeholderBusca="Digite o nome do profissional">Profissionais</button>
            <button type="button" class="nav-link abasPerfil_aba" id="abaClinicas" data-bs-toggle="tab" data-bs-target="#painelClinicas" role="tab" aria-controls="painelClinicas" aria-selected="false" data-tipoBusca="clinicas" data-placeholderBusca="Digite o nome da clínica">Clínicas</button>
          </div>
        </div>
      </header>

      <!-- ESTADOS COMPARTILHADOS (o JS exibe um por vez) -->
      <div class="estadoCarregando" data-estadoBusca="carregando" hidden>
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Carregando resultados...</span>
        </div>
      </div>

      <div class="estadoVazio estadoVazio--pagina" data-estadoBusca="erro" hidden>
        <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">error</span>
        <p class="estadoVazio_texto" role="alert">Não foi possível carregar os resultados.</p>
        <button type="button" class="btn botaoBase botaoBase--secundario" id="botaoTentarNovamente">
          <span class="material-symbols-outlined" aria-hidden="true">refresh</span>Tentar novamente
        </button>
      </div>

      <!-- RESULTADOS -->
      <div class="tab-content areaResultados">

        <!-- ===================== ABA SERVIÇOS ===================== -->
        <section class="tab-pane fade show active" id="painelServicos" role="tabpanel" aria-labelledby="abaServicos" tabindex="0">
          <h2 class="visually-hidden">Serviços</h2>
          <ul class="gradeResultados" data-campo="listaServicos"></ul>
          <div class="estadoVazio estadoVazio--pagina" data-estadoVazio="servicos" hidden>
            <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">handyman</span>
            <p class="estadoVazio_texto">Nenhum serviço foi encontrado</p>
          </div>
        </section>

        <!-- ===================== ABA PROFISSIONAIS ===================== -->
        <section class="tab-pane fade" id="painelProfissionais" role="tabpanel" aria-labelledby="abaProfissionais" tabindex="0">
          <h2 class="visually-hidden">Profissionais</h2>
          <ul class="gradeResultados" data-campo="listaProfissionais"></ul>
          <div class="estadoVazio estadoVazio--pagina" data-estadoVazio="profissionais" hidden>
            <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">group</span>
            <p class="estadoVazio_texto">Nenhum profissional foi encontrado</p>
          </div>
        </section>

        <!-- ===================== ABA CLÍNICAS ===================== -->
        <section class="tab-pane fade" id="painelClinicas" role="tabpanel" aria-labelledby="abaClinicas" tabindex="0">
          <h2 class="visually-hidden">Clínicas</h2>
          <ul class="gradeResultados" data-campo="listaClinicas"></ul>
          <div class="estadoVazio estadoVazio--pagina" data-estadoVazio="clinicas" hidden>
            <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">apartment</span>
            <p class="estadoVazio_texto">Nenhuma clínica foi encontrada</p>
          </div>
        </section>

      </div>

    </main>


    <!-- NAVEGAÇÃO INFERIOR (MOBILE, LOGADO) — exibida por JS quando há sessão -->
    <nav class="navInferiorLogado d-flex d-md-none" data-papel="cliente" aria-label="Navegação principal" hidden>
      <a href="index.php?uri=notificacoes" class="navInferiorLogado_item">
        <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
        <span class="navInferiorLogado_rotulo">Notif.</span>
      </a>
      <a href="index.php?uri=mensagens" class="navInferiorLogado_item" data-itemContatos>
        <span class="material-symbols-outlined" aria-hidden="true">chat</span>
        <span class="navInferiorLogado_rotulo">Contatos</span>
      </a>
      <a href="index.php?uri=buscar" class="navInferiorLogado_item navInferiorLogado_item--ativo" aria-current="page" data-itemPapel>
        <span class="material-symbols-outlined" aria-hidden="true">search</span>
        <span class="navInferiorLogado_rotulo">Buscar</span>
      </a>
      <a href="index.php?uri=consultasCli" class="navInferiorLogado_item" data-itemAgenda>
        <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
        <span class="navInferiorLogado_rotulo">Agenda</span>
      </a>
      <a href="index.php?uri=perfil" class="navInferiorLogado_item" data-itemPerfil>
        <span class="material-symbols-outlined" aria-hidden="true">person</span>
        <span class="navInferiorLogado_rotulo">Perfil</span>
      </a>
    </nav>

  </div>

  <!-- MODELOS (templates) preenchidos pelo JS. Os textos/imagens são só marcadores: o conteúdo real vem do banco. -->
  <template id="modeloCardServico">
    <li class="gradeResultados_item">
      <article class="card cardEntidadeBase cardServico">
        <div class="card-body">
          <h3 class="card-title cardEntidadeBase_titulo" data-campo="nomeServico"></h3>
          <img class="cardEntidadeBase_imagem" data-campo="fotoServico" alt="" loading="lazy">
          <div class="cardServico_metadados">
            <span data-campo="precoServico"></span>
            <span data-campo="cidadeServico"></span>
          </div>
          <a class="btn botaoBase botaoBase--secundario" data-campo="linkDetalhesServico" data-acao="verDetalhes" data-idServico="" href="#" aria-label="Ver detalhes do serviço">
            <span class="material-symbols-outlined" aria-hidden="true">assignment_turned_in</span>Detalhes
          </a>
        </div>
      </article>
    </li>
  </template>

  <template id="modeloCardProfissional">
    <li class="gradeResultados_item">
      <article class="card cardEntidadeBase cardProfissional">
        <div class="card-body">
          <h3 class="card-title cardEntidadeBase_titulo" data-campo="nomeProfissional"></h3>
          <img class="cardEntidadeBase_imagem" data-campo="fotoProfissional" alt="" loading="lazy">
          <a class="btn botaoBase botaoBase--secundario" data-campo="linkPerfilProfissional" data-acao="verPerfil" data-tipoPerfil="profissional" data-idPerfil="" href="#" aria-label="Ver perfil do profissional">
            <span class="material-symbols-outlined" aria-hidden="true">assignment_turned_in</span>Ver perfil
          </a>
        </div>
      </article>
    </li>
  </template>

  <template id="modeloCardClinica">
    <li class="gradeResultados_item">
      <article class="card cardEntidadeBase cardClinica">
        <div class="card-body">
          <h3 class="card-title cardEntidadeBase_titulo" data-campo="nomeClinica"></h3>
          <img class="cardEntidadeBase_imagem" data-campo="fotoClinica" alt="" loading="lazy">
          <div class="cardClinica_detalhes">
            <p class="cardClinica_info"><strong>Endereço:</strong> <span data-campo="enderecoClinica"></span></p>
            <p class="cardClinica_info"><strong>CEP:</strong> <span data-campo="cepClinica"></span></p>
          </div>
          <a class="btn botaoBase botaoBase--secundario" data-campo="linkPerfilClinica" data-acao="verPerfil" data-tipoPerfil="clinica" data-idPerfil="" href="#" aria-label="Ver perfil da clínica">
            <span class="material-symbols-outlined" aria-hidden="true">assignment_turned_in</span>Ver perfil
          </a>
        </div>
      </article>
    </li>
  </template>

  <template id="modeloOpcaoFiltro">
    <div class="form-check">
      <input class="form-check-input" type="radio" data-campo="entradaOpcao">
      <label class="form-check-label" data-campo="rotuloOpcao"></label>
    </div>
  </template>

  <!-- jQuery -->
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

  <!-- Bootstrap 5 (bundle com Popper) -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="public/assets/js/componentes.js"></script><!-- Componentes compartilhados -->
  <script src="public/assets/js/utilitarios.js"></script><!-- Helpers globais -->
  <script src="public/assets/js/sessaoNavegacao.js"></script><!-- Decide qual navegação exibir -->
  <script src="public/assets/js/buscaComum.js"></script><!-- Código compartilhado da busca -->
  <script src="public/assets/js/resultadosBusca.js" defer></script><!-- JS próprio da página -->
</body>
</html>
