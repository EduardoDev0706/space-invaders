Plano de Desenvolvimento: Space Invaders Web

Este documento descreve o roteiro passo a passo para desenvolver um clone do Space Invaders rodando no navegador, utilizando HTML, CSS e JavaScript puro (Vanilla JS).

1. Arquitetura e Estrutura de Arquivos

Para um projeto organizado, sugere-se a seguinte estrutura de pastas. Embora seja possível fazer tudo em um arquivo só, separar facilita a manutenção.

index.html: A estrutura da página.

style.css: O visual (telas de login, canvas do jogo, ranking).

script.js: Toda a lógica do jogo e manipulação de dados.

assets/: Pasta para imagens (naves, aliens) e sons.

2. Fase 1: Estrutura Visual (HTML & CSS)

O objetivo inicial é criar as "telas" do sistema. Como não usaremos navegação complexa entre páginas, faremos uma Single Page Application (SPA) simples, onde escondemos e mostramos divs via CSS.

Passos:

Container Principal: Criar uma div #app que conterá tudo.

Tela de Login:

Formulário com campo para "Nome do Jogador".

Botão "Entrar".

Tela de Menu:

Botões: "Jogar", "Ranking", "Sair".

Tela de Jogo:

Elemento <canvas> (onde o jogo roda).

Painel de HUD (Heads-Up Display) para mostrar Pontuação e Tempo atual.

Tela de Game Over/Ranking:

Tabela para listar os top 5 ou 10 jogadores.

Botão "Voltar ao Menu".

Dica de CSS: Use classes utilitárias como .hidden { display: none; } no JavaScript para alternar entre essas telas.

3. Fase 2: O Motor do Jogo (Canvas & Game Loop)

Esta é a parte mais complexa. O jogo roda dentro do elemento <canvas> e precisa de um loop de atualização constante.

Passos:

Configuração do Canvas: Obter o contexto 2D (ctx = canvas.getContext('2d')).

O Game Loop: Criar uma função update() que chama a si mesma usando requestAnimationFrame. Isso garante que o jogo rode suavemente (geralmente a 60fps).

Ordem do Loop: Limpar Tela -> Atualizar Posições -> Checar Colisões -> Desenhar Tudo.

Classe do Jogador (Nave):

Propriedades: x, y, width, height, speed.

Métodos: draw(), moveRight(), moveLeft().

Controles: Adicionar eventListeners para as setas do teclado (keydown, keyup).

Classe do Projétil (Tiro):

O tiro deve subir (diminuir Y). Quando sair da tela, deve ser removido do array de tiros para economizar memória.

4. Fase 3: Inimigos e Colisões

Aqui o jogo ganha vida. Os inimigos precisam se mover em bloco.

Passos:

Grid de Inimigos: Criar um array de objetos Alien. Eles começam no topo.

Movimento da Horda:

A lógica clássica: Todos movem para a direita. Quando um toca a borda, todos descem uma linha e invertem a direção para a esquerda.

Sistema de Colisão:

A cada frame, verificar se:

Retângulo do Tiro intercepta Retângulo do Alien -> Remove Alien, Remove Tiro, Soma Pontos.

Retângulo do Alien intercepta Retângulo do Jogador -> Game Over.

Alien chega na parte inferior da tela -> Game Over.

Tiro dos Inimigos: Aleatoriamente, alguns aliens devem disparar contra o jogador.

5. Fase 4: Sistema de Login, Pontuação e Tempo

Integração da lógica do jogo com os requisitos do trabalho da faculdade.

Passos:

Gerenciamento de Estado:

Variáveis globais: currentUser, currentScore, startTime, elapsedTime.

Contador de Tempo:

Ao iniciar o jogo (Start), salvar o Date.now().

No loop do jogo, calcular (Date.now() - startTime) / 1000 para obter os segundos.

Persistência de Dados (LocalStorage):

Como não usaremos Banco de Dados externo (backend), usaremos o window.localStorage do navegador.

Estrutura do JSON:

[
  { "nome": "Ana", "score": 500, "tempo": 120 },
  { "nome": "Carlos", "score": 300, "tempo": 45 }
]


Salvando o Recorde:

Ao dar "Game Over", ler o array do localStorage.

Adicionar o novo resultado.

Ordenar o array pelo Score (decrescente).

Salvar de volta no localStorage.

6. Fase 5: Polimento e Entrega

Últimos ajustes para garantir a nota máxima.

Responsividade: Garantir que o canvas não quebre se a janela for redimensionada (ou definir um tamanho fixo centralizado).

Reset: Garantir que ao clicar em "Jogar Novamente", as variáveis (score, posição dos aliens) sejam resetadas corretamente.

Comentários: Como é um trabalho acadêmico, comente extensivamente o código explicando o que cada função faz.

Cronograma Sugerido

Dia 1: Criar HTML/CSS das telas e fazer a troca de telas via JS.

Dia 2: Configurar o Canvas e fazer a nave do jogador mover e atirar.

Dia 3: Implementar a matriz de inimigos e o movimento deles.

Dia 4: Colisões e lógica de Game Over.

Dia 5: Implementar o Ranking com LocalStorage e cronômetro.

Dia 6: Testes e correção de bugs.
