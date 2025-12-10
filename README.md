# Space Invaders - Projeto Final

![Badge JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Badge HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Badge CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

## 📋 Sobre o Projeto

Este projeto foi criado com a intenção de homenagear o lendário **Space Invaders**.

## 🕹️ Como Jogar

1.  Faça **Login** ou **Cadastre-se** na tela inicial.
2.  No menu principal, clique em **JOGAR**.
3.  **Controles:**
    * `Seta Esquerda` / `Seta Direita`: Mover a nave.
    * `Espaço`: Atirar.
4.  Destrua todos os aliens para avançar de nível.
5.  Evite os tiros inimigos e não deixe a horda tocar no chão!

## 🛠️ Tecnologias Utilizadas

* **HTML5** (Estrutura e Canvas)
* **CSS3** (Estilização e Responsividade básica)
* **JavaScript (ES6+)**
    * Classes e POO (Player, Alien, Bullet, Ufo).
    * Manipulação de Arrays ( map, filter, splice).
    * Event Listeners (Teclado e UI).
    * Áudio API (Efeitos sonoros e música de fundo).

## 🧠 Arquitetura e Lógica

O projeto foi dividido em 4 módulos principais para facilitar a manutenção:

### 1. Core Engine (`GameLoop`)
O coração do jogo utiliza `requestAnimationFrame` para garantir 60 FPS.
- **Responsabilidade:** Limpar tela, atualizar posições, checar colisões e desenhar.
- **Destaque:** Uso de loops reversos (`for i--`) para remover inimigos/balas sem quebrar o índice do array.

### 2. Entidades (POO)
Classes encapsuladas para cada elemento:
- `Player`: Gerencia input do teclado e limites da tela.
- `Alien`: Gerencia renderização de sprites variados (Green/Yellow/Red).
- `Ufo`: Comportamento autônomo e aleatório.

### 3. Gerenciamento de Estado (State Management)
Sistema centralizado para controlar:
- `gameRunning`: Flag para pausar/iniciar.
- `level`: Controle de dificuldade progressiva.
- `enemyDirection`: Sincronização da horda.

### 4. Persistência de Dados
Integração com `localStorage` para salvar:
- Cadastro de Usuários (JSON stringify/parse).
- High Scores (ordenação de array para Ranking).

Projeto Desenvolvido por: Eduardo do Carmo Pereira
