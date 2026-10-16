<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Perfil</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" /><!-- Bootstrap 5 -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" /><!-- Material Symbols (Google) -->
  <link rel="stylesheet" href="public/assets/css/variaveis.css" /><!-- Variáveis globais -->
  <link rel="stylesheet" href="public/assets/css/componentes.css" /><!-- Componentes compartilhados -->
  <link rel="stylesheet" href="public/assets/css/perfil.css" /><!-- CSS próprio da página -->
</head>
<body>

  <a href="#conteudoPerfil" class="linkPularConteudo">Pular para o conteúdo principal</a>

  <!-- NAVEGAÇÃO (DESLOGADO) — exibida por perfil.js quando o login não é confirmado -->
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

  <!-- BARRA SUPERIOR (LOGADO — DESKTOP E MOBILE) — exibida por perfil.js quando o login é confirmado -->
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
    <button type="button" class="navTopoLogado_botaoMenuMobile d-md-none" data-bs-toggle="offcanvas" data-bs-target="#painelMenuMobilePerfil" aria-controls="painelMenuMobilePerfil" aria-label="Abrir menu">
      <span class="material-symbols-outlined" aria-hidden="true">menu</span>
    </button>
  </header>

  <!-- PAINEL DO MENU (MOBILE, LOGADO) -->
  <div class="offcanvas offcanvas-top painelMenuMobile d-md-none" tabindex="-1" id="painelMenuMobilePerfil" aria-labelledby="tituloPainelMenuMobilePerfil">
    <div class="offcanvas-header">
      <a href="index.php" class="painelMenuMobile_logo" id="tituloPainelMenuMobilePerfil">
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

  <!-- NAVEGAÇÃO LATERAL (DESKTOP, LOGADO) — exibida por perfil.js -->
  <nav class="navLateralLogado d-none d-md-flex" data-papel="profissionalClinica" aria-label="Navegação principal" hidden>
    <a href="index.php" class="navLateralLogado_item" data-itemPapel>
      <span class="material-symbols-outlined" aria-hidden="true">home</span>
      <span class="navLateralLogado_rotulo">Início</span>
    </a>
    <a href="index.php?uri=mensagens" class="navLateralLogado_item" data-itemContatos>
      <span class="material-symbols-outlined" aria-hidden="true">chat</span>
      <span class="navLateralLogado_rotulo">Contatos</span>
    </a>
    <a href="index.php?uri=notificacoes" class="navLateralLogado_item">
      <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
      <span class="navLateralLogado_rotulo">Notificação</span>
    </a>
    <a href="index.php?uri=agendaProfissional" class="navLateralLogado_item" data-itemAgenda>
      <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
      <span class="navLateralLogado_rotulo">Agenda</span>
    </a>
    <div class="navLateralLogado_rodape">
      <a href="index.php?uri=perfil" class="navLateralLogado_item navLateralLogado_item--ativo" aria-current="page" data-itemPerfil>
        <span class="material-symbols-outlined" aria-hidden="true">person</span>
        <span class="navLateralLogado_rotulo">Perfil</span>
      </a>
    </div>
  </nav>

  <div>

    <!-- CONTEÚDO PRINCIPAL -->
    <main id="conteudoPerfil" class="conteudoPerfil" aria-busy="true">

      <!-- Cabeçalho do perfil: avatar + usuário -->
      <header class="cabecalhoPerfil">
        <div class="cabecalhoPerfil_avatar">
          <span class="material-symbols-outlined cabecalhoPerfil_iconePadrao" aria-hidden="true">person</span>
          <img class="cabecalhoPerfil_foto" data-campo="foto" alt="Foto de perfil" hidden>
        </div>
        <h1 class="cabecalhoPerfil_usuario" data-campo="usuario"></h1>
      </header>

      <!-- Perfil indisponível (visitante sem dados, perfil não encontrado) -->
      <div class="estadoVazio estadoVazio--pagina" data-estadoVazio="perfilIndisponivel" hidden>
        <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">person_off</span>
        <p class="estadoVazio_texto" data-campo="textoPerfilIndisponivel"></p>
      </div>

      <!-- Abas do perfil (Bootstrap nav-tabs). Só as abas reais ficam no tablist;
           Documentos e Relatório são links para outras páginas e ficam fora dele. -->
      <div class="nav nav-tabs abasPerfil" id="abasPerfil">
        <div class="abasPerfil_grupo" role="tablist" aria-label="Seções do perfil">
          <button type="button" class="nav-link abasPerfil_aba active" id="abaPerfil" data-bs-toggle="tab" data-bs-target="#painelPerfil" role="tab" aria-controls="painelPerfil" aria-selected="true">Perfil</button>
          <button type="button" class="nav-link abasPerfil_aba" id="abaClinica" data-perfilDe="profissional" hidden data-bs-toggle="tab" data-bs-target="#painelClinica" role="tab" aria-controls="painelClinica" aria-selected="false">Clínica</button>
          <button type="button" class="nav-link abasPerfil_aba" id="abaProfissionais" data-perfilDe="clinica" hidden data-bs-toggle="tab" data-bs-target="#painelProfissionais" role="tab" aria-controls="painelProfissionais" aria-selected="false">Profissionais</button>
        </div>
        <a class="abasPerfil_aba abasPerfil_link" id="linkDocumentos" href="index.php?uri=documentos" data-perfilDe="profissional" hidden>Documentos</a>
        <a class="abasPerfil_aba abasPerfil_link" href="index.php?uri=relatorio" data-somenteDono>Relatório</a>
      </div>

      <div class="tab-content conteudoAbas">

        <!-- ===================== ABA PERFIL ===================== -->
        <div class="tab-pane fade show active" id="painelPerfil" role="tabpanel" aria-labelledby="abaPerfil" tabindex="0">

          <!-- Visão: resumo -->
          <div class="visaoPerfil" data-visao="resumo">

            <section class="secaoPerfil" aria-labelledby="tituloBiografia">
              <h2 class="secaoPerfil_titulo" id="tituloBiografia">Biografia</h2>
              <div class="secaoPerfil_caixa">
                <p class="secaoPerfil_texto" data-campo="bio"></p>
                <button type="button" class="btn secaoPerfil_acao" id="botaoEditarBio" data-somenteDono data-visaoDestino="edicaoBio" aria-label="Editar biografia">
                  <span class="material-symbols-outlined" aria-hidden="true">edit_square</span>
                </button>
              </div>
            </section>

            <section class="secaoPerfil" aria-labelledby="tituloLocalizacao" data-perfilDe="clinica" hidden>
              <h2 class="secaoPerfil_titulo" id="tituloLocalizacao">Localização</h2>
              <div class="secaoPerfil_caixa">
                <p class="secaoPerfil_texto">Endereço: <span data-campo="enderecoClinica"></span></p>
                <p class="secaoPerfil_texto">CEP: <span data-campo="cepClinica"></span></p>
                <div class="secaoPerfil_extras">
                  <a class="btn botaoBase botaoBase--secundario" id="botaoAbrirMaps" href="#" target="_blank" rel="noopener noreferrer" hidden>
                    <span class="material-symbols-outlined" aria-hidden="true">map</span>Abrir no Maps<span class="visually-hidden"> (abre em nova aba)</span>
                  </a>
                </div>
                <button type="button" class="btn secaoPerfil_acao" id="botaoEditarLocalizacao" data-somenteDono data-visaoDestino="edicaoLocalizacao" aria-label="Editar localização">
                  <span class="material-symbols-outlined" aria-hidden="true">edit_square</span>
                </button>
              </div>
            </section>

            <section class="secaoPerfil" aria-labelledby="tituloServicos" data-perfilDe="profissional" hidden>
              <h2 class="secaoPerfil_titulo" id="tituloServicos">Serviços</h2>
              <div class="secaoPerfil_caixa">
                <button type="button" class="btn secaoPerfil_acao" id="botaoAdicionarServico" data-somenteDono data-visaoDestino="cadastroServico" aria-label="Cadastrar serviço">
                  <span class="material-symbols-outlined" aria-hidden="true">add</span>
                </button>
                <div class="estadoVazio" data-estadoVazio="servicos">
                  <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">construction</span>
                  <p class="estadoVazio_texto">Sem serviço registrado</p>
                </div>
                <div class="table-responsive" data-tabela="servicos" hidden>
                  <table class="table tabelaDados">
                    <caption class="visually-hidden">Serviços cadastrados</caption>
                    <thead>
                      <tr>
                        <th scope="col">Nome</th>
                        <th scope="col">Valor</th>
                        <th scope="col">Duração</th>
                        <th scope="col">Dia</th>
                      </tr>
                    </thead>
                    <tbody data-lista="servicos"></tbody>
                  </table>
                </div>
              </div>
            </section>

            <section class="secaoPerfil" aria-labelledby="tituloHorarios">
              <h2 class="secaoPerfil_titulo" id="tituloHorarios">Horários e dias de funcionamento</h2>
              <div class="secaoPerfil_caixa">
                <button type="button" class="btn secaoPerfil_acao" id="botaoAdicionarHorarios" data-somenteDono data-visaoDestino="cadastroHorarios" aria-label="Cadastrar horários e dias de funcionamento">
                  <span class="material-symbols-outlined" aria-hidden="true">add</span>
                </button>
                <div class="estadoVazio" data-estadoVazio="horarios">
                  <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">alarm_off</span>
                  <p class="estadoVazio_texto">Sem horários ou dias registrados</p>
                </div>
                <div class="table-responsive" data-tabela="horarios" hidden>
                  <table class="table tabelaDados">
                    <caption class="visually-hidden">Horários e dias de funcionamento</caption>
                    <thead>
                      <tr>
                        <th scope="col">Dia da semana</th>
                        <th scope="col">Abertura</th>
                        <th scope="col">Fechamento</th>
                      </tr>
                    </thead>
                    <tbody data-lista="horarios"></tbody>
                  </table>
                </div>
              </div>
            </section>

          </div>

          <!-- Visão: edição da biografia -->
          <div class="visaoPerfil" data-visao="edicaoBio" hidden>
            <form id="formularioBio" class="formularioPerfil" novalidate>
              <h2 class="formularioPerfil_titulo">Edição da biografia</h2>

              <div class="campoTexto">
                <label class="form-label" for="campoBioAtual">Biografia atual</label>
                <textarea class="form-control campoBioAtual" id="campoBioAtual" rows="3" readonly data-campo="bioAtual"></textarea>
              </div>

              <div class="campoTexto">
                <label class="form-label" for="campoBioNova">Biografia nova</label>
                <textarea class="form-control" id="campoBioNova" name="bioNova" rows="3" placeholder="Eu sou..." required></textarea>
                <div class="invalid-feedback" data-mensagemCampo="bioNova">Escreva a nova biografia.</div>
              </div>

              <div class="formularioPerfil_acoes">
                <button type="button" class="btn botaoBase botaoBase--opositora" data-acao="cancelarEdicao">
                  <span class="material-symbols-outlined" aria-hidden="true">cancel</span>Cancelar
                </button>
                <button type="submit" class="btn botaoBase botaoBase--primario">
                  <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>Salvar
                </button>
              </div>
            </form>
          </div>

          <!-- Visão: cadastro de serviço -->
          <div class="visaoPerfil" data-visao="cadastroServico" hidden>
            <form id="formularioServico" class="formularioPerfil" novalidate>
              <h2 class="formularioPerfil_titulo">Cadastrar serviço</h2>

              <div class="row g-4">
                <div class="col-12 col-lg-6">

                  <div class="form-floating campoTexto">
                    <input type="text" class="form-control" id="campoNomeServico" name="nomeServico" placeholder="Nome do serviço" maxlength="100" required>
                    <label for="campoNomeServico">Nome do serviço</label>
                  </div>

                  <div class="form-floating campoTexto">
                    <input type="text" class="form-control" id="campoValorServico" name="valorServico" placeholder="Valor do serviço" inputmode="decimal" required>
                    <label for="campoValorServico">Valor do serviço</label>
                  </div>

                  <div class="campoTexto">
                    <span class="form-label fw-bold" id="rotuloTipoServico">Selecione um tipo para esse serviço</span>
                    <div class="dropdown campoSelect" id="campoTipoServico" data-valorSelecionado="">
                      <button type="button" class="campoSelect_gatilho dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" aria-labelledby="rotuloTipoServico" aria-describedby="ajudaTipoServico">
                        <span class="campoSelect_valor">Selecione um tipo de serviço</span>
                        <span class="campoSelect_iconeChevron material-symbols-outlined" aria-hidden="true">keyboard_arrow_down</span>
                      </button>
                      <ul class="dropdown-menu campoSelect_lista">
                        <li><a class="dropdown-item campoSelect_opcao" href="#" data-valor="opcao1">Opção 1</a></li>
                        <li><a class="dropdown-item campoSelect_opcao" href="#" data-valor="opcao2">Opção 2</a></li>
                        <li><a class="dropdown-item campoSelect_opcao" href="#" data-valor="opcao3">Opção 3</a></li>
                      </ul>
                    </div>
                    <div class="form-text" id="ajudaTipoServico">O tipo de serviço ajuda os clientes a encontrar seu serviço.</div>
                  </div>

                  <div class="form-floating campoTexto">
                    <textarea class="form-control campoDescricaoServico" id="campoDescricaoServico" name="descricaoServico" placeholder="Descrição do serviço" required></textarea>
                    <label for="campoDescricaoServico">Descrição do serviço</label>
                  </div>
                  <div class="form-text">Explique de forma simples e breve como o procedimento é realizado, assim o cliente consegue entender melhor sobre o seu serviço.</div>

                </div>

                <div class="col-12 col-lg-6">

                  <div class="campoMinutos">
                    <label class="campoMinutos_rotulo" for="campoDuracaoServico">Duração do procedimento:</label>
                    <div class="input-group campoMinutos_entrada">
                      <input type="number" class="form-control" id="campoDuracaoServico" name="duracaoServico" min="0" step="5" placeholder="00" required>
                      <span class="input-group-text">min</span>
                    </div>
                  </div>

                  <div class="campoMinutos">
                    <label class="campoMinutos_rotulo" for="campoIntervaloServico">Intervalo pós-procedimento:</label>
                    <div class="input-group campoMinutos_entrada">
                      <input type="number" class="form-control" id="campoIntervaloServico" name="intervaloServico" min="0" step="5" placeholder="00" aria-describedby="ajudaIntervaloServico" required>
                      <span class="input-group-text">min</span>
                    </div>
                  </div>
                  <div class="form-text" id="ajudaIntervaloServico">Defina o tempo necessário entre consultas para se organizar ou fazer uma pausa.</div>

                  <fieldset class="seletorDias" id="seletorDiasServico">
                    <legend class="seletorDias_legenda">Selecione os dias em que você realiza esse serviço:</legend>
                    <div class="form-check seletorDias_item">
                      <input class="form-check-input" type="checkbox" id="checkServicoDomingo" name="diasServico" value="0">
                      <label class="form-check-label" for="checkServicoDomingo">Domingo</label>
                    </div>
                    <div class="form-check seletorDias_item">
                      <input class="form-check-input" type="checkbox" id="checkServicoSegunda" name="diasServico" value="1">
                      <label class="form-check-label" for="checkServicoSegunda">Segunda</label>
                    </div>
                    <div class="form-check seletorDias_item">
                      <input class="form-check-input" type="checkbox" id="checkServicoTerca" name="diasServico" value="2">
                      <label class="form-check-label" for="checkServicoTerca">Terça</label>
                    </div>
                    <div class="form-check seletorDias_item">
                      <input class="form-check-input" type="checkbox" id="checkServicoQuarta" name="diasServico" value="3">
                      <label class="form-check-label" for="checkServicoQuarta">Quarta</label>
                    </div>
                    <div class="form-check seletorDias_item">
                      <input class="form-check-input" type="checkbox" id="checkServicoQuinta" name="diasServico" value="4">
                      <label class="form-check-label" for="checkServicoQuinta">Quinta</label>
                    </div>
                    <div class="form-check seletorDias_item">
                      <input class="form-check-input" type="checkbox" id="checkServicoSexta" name="diasServico" value="5">
                      <label class="form-check-label" for="checkServicoSexta">Sexta</label>
                    </div>
                    <div class="form-check seletorDias_item">
                      <input class="form-check-input" type="checkbox" id="checkServicoSabado" name="diasServico" value="6">
                      <label class="form-check-label" for="checkServicoSabado">Sábado</label>
                    </div>
                  </fieldset>

                </div>
              </div>

              <div class="formularioPerfil_acoes">
                <button type="button" class="btn botaoBase botaoBase--opositora" data-acao="cancelarEdicao">
                  <span class="material-symbols-outlined" aria-hidden="true">cancel</span>Cancelar
                </button>
                <button type="submit" class="btn botaoBase botaoBase--primario">
                  <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>Confirmar
                </button>
              </div>
            </form>
          </div>

          <!-- Visão: edição da localização (clínica) -->
          <div class="visaoPerfil" data-visao="edicaoLocalizacao" hidden>
            <form id="formularioLocalizacao" class="formularioPerfil" novalidate>
              <h2 class="formularioPerfil_titulo">Edição de localização</h2>
              <div class="avisosFormulario" id="avisosLocalizacao" aria-live="polite"></div>

              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <div class="form-floating campoTexto">
                    <input type="text" class="form-control" id="campoCepLocalizacao" name="cepLocalizacao" data-mascara="cep" inputmode="numeric" placeholder="CEP" required>
                    <label for="campoCepLocalizacao">CEP</label>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="form-floating campoTexto">
                    <input type="text" class="form-control" id="campoRuaLocalizacao" readonly name="ruaLocalizacao" placeholder="Rua" required>
                    <label for="campoRuaLocalizacao">Rua</label>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="form-floating campoTexto">
                    <input type="text" class="form-control" id="campoBairroLocalizacao" readonly name="bairroLocalizacao" placeholder="Bairro" required>
                    <label for="campoBairroLocalizacao">Bairro</label>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="form-floating campoTexto">
                    <input type="text" class="form-control" id="campoCidadeLocalizacao" readonly name="cidadeLocalizacao" placeholder="Cidade" required>
                    <label for="campoCidadeLocalizacao">Cidade</label>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="form-floating campoTexto">
                    <input type="text" class="form-control" id="campoEstadoLocalizacao" readonly name="estadoLocalizacao" maxlength="2" placeholder="Estado" required>
                    <label for="campoEstadoLocalizacao">Estado</label>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="form-floating campoTexto">
                    <input type="text" class="form-control" id="campoIbgeLocalizacao" readonly name="ibgeLocalizacao" inputmode="numeric" placeholder="IBGE" required>
                    <label for="campoIbgeLocalizacao">IBGE</label>
                  </div>
                </div>
              </div>
              <p class="form-text">Rua, bairro, cidade, estado e IBGE são preenchidos automaticamente a partir do CEP.</p>

              <div class="formularioPerfil_acoes">
                <button type="button" class="btn botaoBase botaoBase--opositora" data-acao="cancelarEdicao">
                  <span class="material-symbols-outlined" aria-hidden="true">cancel</span>Cancelar
                </button>
                <button type="submit" class="btn botaoBase botaoBase--primario">
                  <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>Salvar
                </button>
              </div>
            </form>
          </div>

          <!-- Visão: cadastro de horários e dias de funcionamento -->
          <div class="visaoPerfil" data-visao="cadastroHorarios" hidden>
            <form id="formularioHorarios" class="formularioPerfil" novalidate>
              <h2 class="formularioPerfil_titulo">Cadastrar horários e dias de funcionamento</h2>

              <fieldset class="seletorDias seletorDias--horarios" id="seletorDiasHorarios">
                <legend class="seletorDias_legenda">Selecione os dias em que você trabalha:</legend>
                <div data-lista="linhasHorario"></div>
              </fieldset>
              <p class="textoCaption" data-campo="avisoHorariosSalvos" hidden>Os dias já cadastrados não podem ser alterados por enquanto. Você pode adicionar novos dias.</p>

              <div class="formularioPerfil_acoes">
                <button type="button" class="btn botaoBase botaoBase--opositora" data-acao="cancelarEdicao">
                  <span class="material-symbols-outlined" aria-hidden="true">cancel</span>Cancelar
                </button>
                <button type="submit" class="btn botaoBase botaoBase--primario" id="botaoSalvarHorarios" disabled>
                  <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>Salvar
                </button>
              </div>
            </form>
          </div>

        </div>

        <!-- ===================== ABA CLÍNICA (profissional) ===================== -->
        <div class="tab-pane fade" id="painelClinica" role="tabpanel" aria-labelledby="abaClinica" tabindex="0" data-perfilDe="profissional" hidden>
          <div class="visaoPerfil" data-visao="clinicaResumo">
            <div class="barraAcoesAba" data-somenteDono>
              <button type="button" class="btn botaoBase botaoBase--primario" data-acao="abrirVinculo">
                <span class="material-symbols-outlined" aria-hidden="true">add_home_work</span>Vincular nova clínica
              </button>
            </div>

            <div class="estadoVazio estadoVazio--pagina" data-estadoVazio="clinicas">
              <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">home_work</span>
              <p class="estadoVazio_texto">Nenhuma clínica vinculada</p>
            </div>
            <div class="listaCards" data-lista="clinicas" hidden></div>
          </div>
        </div>

        <!-- ===================== ABA PROFISSIONAIS (clínica) ===================== -->
        <div class="tab-pane fade" id="painelProfissionais" role="tabpanel" aria-labelledby="abaProfissionais" tabindex="0" data-perfilDe="clinica" hidden>
          <div class="visaoPerfil" data-visao="profissionaisResumo">
            <div class="barraAcoesAba" data-somenteDono>
              <button type="button" class="btn botaoBase botaoBase--primario" data-acao="abrirVinculo">
                <span class="material-symbols-outlined" aria-hidden="true">person_add</span>Vincular profissional
              </button>
              <button type="button" class="btn botaoBase botaoBase--secundario" data-acao="gerenciarVinculos">
                <span class="material-symbols-outlined" aria-hidden="true">manage_accounts</span>Gerenciar profissionais
              </button>
            </div>

            <div class="estadoVazio estadoVazio--pagina" data-estadoVazio="profissionais">
              <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">group</span>
              <p class="estadoVazio_texto">Nenhum profissional vinculado</p>
            </div>
            <div class="listaCards" data-lista="profissionais" hidden></div>
          </div>
        </div>

      </div>
    </main>

    <!-- NAVEGAÇÃO INFERIOR (MOBILE) -->
    <nav class="navInferiorLogado d-flex d-md-none" data-papel="profissionalClinica" aria-label="Navegação principal" hidden>
      <a href="index.php?uri=notificacoes" class="navInferiorLogado_item">
        <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
        <span class="navInferiorLogado_rotulo">Notif.</span>
      </a>
      <a href="index.php?uri=mensagens" class="navInferiorLogado_item" data-itemContatos>
        <span class="material-symbols-outlined" aria-hidden="true">chat</span>
        <span class="navInferiorLogado_rotulo">Contatos</span>
      </a>
      <a href="index.php" class="navInferiorLogado_item" data-itemPapel>
        <span class="material-symbols-outlined" aria-hidden="true">home</span>
        <span class="navInferiorLogado_rotulo">Início</span>
      </a>
      <a href="index.php?uri=agendaProfissional" class="navInferiorLogado_item" data-itemAgenda>
        <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
        <span class="navInferiorLogado_rotulo">Agenda</span>
      </a>
      <a href="index.php?uri=perfil" class="navInferiorLogado_item navInferiorLogado_item--ativo" aria-current="page" data-itemPerfil>
        <span class="material-symbols-outlined" aria-hidden="true">person</span>
        <span class="navInferiorLogado_rotulo">Perfil</span>
      </a>
    </nav>

  </div>

  <!-- AVISO FLUTUANTE (Bootstrap toast) — mensagem e variação definidas pelo JS -->
  <div class="toast-container position-fixed top-0 start-50 translate-middle-x p-3">
    <div class="toast avisoFlutuante" id="avisoPerfil" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-body avisoFlutuante_corpo">
        <span class="material-symbols-outlined avisoFlutuante_icone" aria-hidden="true">error</span>
        <p class="avisoFlutuante_mensagem" data-campo="mensagemAviso"></p>
      </div>
    </div>
  </div>

  <!-- MODAL: SESSÃO EXPIRADA — exibido pelo JS quando o login não é confirmado -->
  <div class="modal fade modalBase" id="modalSessaoExpirada" tabindex="-1" aria-labelledby="tituloModalSessaoExpirada" aria-describedby="textoModalSessaoExpirada" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content modalBase_conteudo">
        <div class="modal-header modalBase_cabecalho">
          <h2 class="modal-title modalBase_titulo" id="tituloModalSessaoExpirada">Sessão expirada</h2>
        </div>
        <div class="modal-body text-center">
          <div class="modalFeedback_icone" aria-hidden="true">
            <span class="material-symbols-outlined" aria-hidden="true">no_accounts</span>
          </div>
          <p class="modalFeedback_mensagem" id="textoModalSessaoExpirada">
            Sua sessão anterior expirou, precisamos que você realize login novamente para poder acessar essa página.
          </p>
        </div>
        <div class="modal-footer modalBase_rodape">
          <button type="button" class="btn botaoBase botaoBase--primario" id="botaoRealizarLoginSessao">Realizar login</button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL: VINCULAR (clínica ou profissional, textos definidos pelo JS) -->
  <div class="modal fade modalBase" id="modalVincular" tabindex="-1" aria-labelledby="tituloModalVincular" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <form class="modal-content modalBase_conteudo" id="formularioVinculo" novalidate>
        <div class="modal-header modalBase_cabecalho">
          <h2 class="modal-title modalBase_titulo" id="tituloModalVincular" data-campo="tituloVinculo"></h2>
          <button type="button" class="modalBase_botaoFechar" data-bs-dismiss="modal" aria-label="Fechar">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        <div class="modal-body modalBase_corpo">
          <label class="formularioPerfil_rotulo" for="campoUsuarioVinculo" data-campo="rotuloVinculo"></label>
          <div class="input-group campoPesquisa" role="search">
            <input class="form-control campoPesquisa_input" type="search" id="campoUsuarioVinculo" name="usuarioVinculo" autocomplete="off" aria-describedby="mensagemUsuarioVinculo">
            <button type="button" class="btn campoPesquisa_botaoIcone" id="botaoBuscarVinculo" aria-label="Buscar">
              <span class="material-symbols-outlined" aria-hidden="true">search</span>
            </button>
          </div>
          <div class="invalid-feedback" id="mensagemUsuarioVinculo" data-mensagemCampo="usuarioVinculo"></div>
          <div class="listaCards listaCards--modal" data-lista="resultadoVinculo" hidden></div>
        </div>
        <div class="modal-footer modalBase_rodape">
          <button type="button" class="btn botaoBase botaoBase--opositora" data-bs-dismiss="modal">
            <span class="material-symbols-outlined" aria-hidden="true">cancel</span>Cancelar
          </button>
          <button type="submit" class="btn botaoBase botaoBase--primario">
            <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>Confirmar
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: DESVINCULAR (clínica ou profissional, textos definidos pelo JS) -->
  <div class="modal fade modalBase" id="modalDesvincular" tabindex="-1" aria-labelledby="tituloModalDesvincular" aria-describedby="textoModalDesvincular" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content modalBase_conteudo">
        <div class="modal-header modalBase_cabecalho">
          <h2 class="modal-title modalBase_titulo" id="tituloModalDesvincular">Cuidado!</h2>
          <button type="button" class="modalBase_botaoFechar" data-bs-dismiss="modal" aria-label="Fechar">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        <div class="modal-body modalBase_corpo" id="textoModalDesvincular">
          <p data-campo="textoDesvinculoAbertura"></p>
          <p data-campo="textoDesvinculoConsequencia"></p>
          <p>Deseja continuar com essa ação?</p>
        </div>
        <div class="modal-footer modalBase_rodape">
          <button type="button" class="btn botaoBase botaoBase--opositora" id="botaoConfirmarDesvinculo">
            <span class="material-symbols-outlined" aria-hidden="true">cancel</span><span data-campo="rotuloBotaoDesvincular"></span>
          </button>
          <button type="button" class="btn botaoBase botaoBase--primario" data-bs-dismiss="modal">
            <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>Manter vínculo
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODELOS (templates) preenchidos pelo JS -->
  <template id="modeloLinhaServico">
    <tr>
      <td data-campo="nomeServico"></td>
      <td data-campo="valorServico"></td>
      <td data-campo="duracaoServico"></td>
      <td data-campo="diasServico"></td>
    </tr>
  </template>

  <template id="modeloLinhaHorario">
    <tr>
      <td data-campo="diaSemana"></td>
      <td data-campo="horaAbertura"></td>
      <td data-campo="horaFechamento"></td>
    </tr>
  </template>

  <template id="modeloLinhaHorarioFormulario">
    <div class="linhaHorario">
      <div class="form-check linhaHorario_dia">
        <input class="form-check-input" type="checkbox" data-campo="marcaDia">
        <label class="form-check-label" data-campo="rotuloDia"></label>
      </div>
      <div class="linhaHorario_campo">
        <label class="linhaHorario_rotulo" data-campo="rotuloAbertura">Abertura:</label>
        <input type="time" class="form-control" data-campo="horaAbertura" disabled>
      </div>
      <div class="linhaHorario_campo">
        <label class="linhaHorario_rotulo" data-campo="rotuloFechamento">Fechamento:</label>
        <input type="time" class="form-control" data-campo="horaFechamento" disabled>
      </div>
    </div>
  </template>

  <template id="modeloCardVinculo">
    <article class="card cardEntidadeBase cardVinculo">
      <div class="card-body">
        <h3 class="card-title cardEntidadeBase_titulo" data-campo="nomeVinculo"></h3>
        <div class="cardVinculo_foto">
          <span class="material-symbols-outlined cardVinculo_iconePadrao" aria-hidden="true" data-campo="iconePadraoVinculo"></span>
          <img class="cardVinculo_imagem" data-campo="fotoVinculo" alt="" hidden>
        </div>
        <div class="cardVinculo_detalhes" data-campo="detalhesVinculo" hidden>
          <p class="cardClinica_info"><strong>Endereço:</strong> <span data-campo="enderecoVinculo"></span></p>
          <p class="cardClinica_info"><strong>CEP:</strong> <span data-campo="cepVinculo"></span></p>
        </div>
        <a class="btn botaoBase botaoBase--secundario" data-campo="linkPerfilVinculo" href="#">
          <span class="material-symbols-outlined" aria-hidden="true">assignment_turned_in</span>Ver perfil
        </a>
        <button type="button" class="btn cardVinculo_botaoDesvincular" data-acao="desvincular" aria-label="Desvincular">
          <span class="material-symbols-outlined" aria-hidden="true">cancel</span>
        </button>
        <button type="button" class="btn cardVinculo_botaoSelecionar" data-acao="selecionarVinculo" aria-pressed="false" aria-label="Selecionar">
          <span class="material-symbols-outlined" aria-hidden="true">radio_button_unchecked</span>
        </button>
      </div>
    </article>
  </template>

  <!-- jQuery -->
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

  <!-- Bootstrap 5 (bundle com Popper) -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="public/assets/js/componentes.js"></script><!-- Componentes compartilhados -->
  <script src="public/assets/js/utilitarios.js"></script>
  <script src="public/assets/js/perfil.js" defer></script>
</body>
</html>
