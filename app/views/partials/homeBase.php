<?php
/**
 * Base comum das páginas Home: seções "Por quê", missão, chamada final e rodapé.
 * Espera:
 *   $homeRecursos  array de ['titulo' => string, 'imagem' => arquivo em images/home, 'alt' => string]
 *   $homeCadastro  URL do botão "Cadastrar-se!"
 * Fecha o <main> aberto em partials/homeTopo.php, o <body> e o <html>.
 */
$homeRecursos = $homeRecursos ?? [];
$homeCadastro = $homeCadastro ?? 'index.php?uri=cadastroCliente';
$e = static function ($texto) {
    return htmlspecialchars((string) $texto, ENT_QUOTES, 'UTF-8');
};
?>

    <!-- Por que usar -->
    <section id="comoFunciona" class="secaoRecursos" aria-labelledby="tituloRecursos">
      <div class="container text-center">
        <h2 id="tituloRecursos" class="secaoHome_titulo">Mas por quê o Podopsi?</h2>
        <p class="secaoRecursos_texto mx-auto">O Podopsi busca tornar seu agendamento algo simples e fácil para ambos os lados, para isso ele conta com:</p>
        <ul class="row row-cols-2 row-cols-lg-4 g-3 g-lg-4 list-unstyled mt-3 mb-0">
          <?php foreach ($homeRecursos as $recurso): ?>
          <li class="col d-flex">
            <article class="card cardEntidadeBase cardRecurso mx-auto">
              <div class="card-body">
                <h3 class="card-title cardEntidadeBase_titulo"><?= $e($recurso['titulo']) ?></h3>
                <img class="cardEntidadeBase_imagem" src="public/assets/images/home/<?= $e($recurso['imagem']) ?>" alt="<?= $e($recurso['alt']) ?>" width="240" height="240" loading="lazy">
              </div>
            </article>
          </li>
          <?php endforeach; ?>
        </ul>
      </div>
    </section>

    <!-- Missão e objetivos -->
    <section class="secaoMissao" aria-labelledby="tituloMissao">
      <div class="container">
        <h2 id="tituloMissao" class="secaoHome_titulo text-center">Nossa missão</h2>

        <div class="row g-4 align-items-start justify-content-center mt-2">
          <div class="col-4 col-md-3 col-lg-2">
            <div class="logoMissao ratio ratio-1x1 rounded-4">
              <img src="public/assets/images/logo.png" alt="Logo do Podopsi" class="p-2">
            </div>
          </div>
          <div class="col-8 col-md-8 col-lg-6">
            <p class="mb-0">Pensando na experiência do usuário, cada tela foi projetada para diminuir o número de etapas. Isso facilita a navegação e torna o processo de agendamento simples para clientes, profissionais e clínicas.</p>
          </div>
        </div>

        <div class="row g-4 align-items-center justify-content-center mt-4 mt-lg-5">
          <div class="col-7 col-md-6 col-lg-5">
            <h2 class="h3 fw-normal">Nossos objetivos</h2>
            <p>Desenvolver um sistema que proporcione ao usuário:</p>
            <ul class="list-unstyled listaObjetivos mb-0">
              <li><span class="material-symbols-outlined" aria-hidden="true">check</span>Simplicidade</li>
              <li><span class="material-symbols-outlined" aria-hidden="true">check</span>Acessibilidade</li>
              <li><span class="material-symbols-outlined" aria-hidden="true">check</span>Organização</li>
              <li><span class="material-symbols-outlined" aria-hidden="true">check</span>Usabilidade</li>
            </ul>
          </div>
          <div class="col-5 col-md-4 col-lg-3">
            <img src="public/assets/images/home/alvo.jpg" alt="Alvo com uma flecha no centro" class="imagemObjetivo img-fluid rounded-4" width="240" height="240" loading="lazy">
          </div>
        </div>
      </div>
    </section>

    <!-- Chamada final -->
    <section class="secaoChamada text-center" aria-labelledby="tituloChamada">
      <div class="container">
        <h2 id="tituloChamada" class="secaoHome_titulo">Pronto para a sua consulta?</h2>
        <a href="<?= $e($homeCadastro) ?>" class="btn botaoBase botaoBase--secundario btn-lg mt-3">Cadastrar-se!</a>
      </div>
    </section>
  </main>

  <footer class="rodapeHome">
    <div class="container d-flex flex-wrap justify-content-between gap-2">
      <a href="mailto:centralPodopsi@gmail.com">Fale conosco</a>
      <a href="mailto:centralPodopsi@gmail.com">centralPodopsi@gmail.com</a>
    </div>
  </footer>

  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="public/assets/js/componentes.js"></script>
  <script src="public/assets/js/utilitarios.js"></script>
  <script src="public/assets/js/buscaComum.js"></script>
  <script src="public/assets/js/home.js"></script>
</body>

</html>
