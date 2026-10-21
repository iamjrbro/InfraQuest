# InfraQuest — Reinos do Céu

RPG educacional em português sobre sistemas operacionais, cloud e IAM. Explore seis planetas, personalize seu personagem e transforme aprendizado em conquistas.

## Executar

Requer **Node.js 24 ou superior**. O jogo principal usa módulos nativos, sem instalação de dependências.

```sh
npm start
```

No Windows, também é possível abrir `INICIAR-JOGO.cmd`. Acesse **http://127.0.0.1:4180** e mantenha o servidor em execução.

1. Crie uma conta com usuário, email e senha de pelo menos 12 caracteres.
2. Escolha jogar contra Mimo ou criar/entrar em uma sala por ID de time.
3. Crie seu personagem e escolha um planeta.
4. Use WASD/setas para andar, E para interagir e Espaço para pular. Também é possível clicar para caminhar e usar os controles na tela.

## O jogo

- **120 fases**, com 20 desafios em cada planeta.
- **Exploração entre desafios:** encontre um portal, responda, converse com Luma sobre a descoberta e recolha fragmentos para abrir o próximo caminho.
- **Personagens:** modelos feminino/masculino, 18 roupas, cabelos, tons de pele, olhos, sapatos e acessórios combináveis.
- **Solo:** corrida contra Mimo, com três ritmos e placar independente dos prêmios.
- **Salas:** até oito jogadores por sala, código de time, presença e placar compartilhados. Cada conta mantém sua campanha e seu saldo.
- **Visual:** interface rosé/marsala, com cores temáticas próprias para cada planeta.

| Planeta | Tema | Paleta |
| --- | --- | --- |
| Planeta Raios | Linux e sistemas | Dourado e ocre |
| Aurora Celeste | Windows e fundamentos | Coral e pêssego |
| Clouds | Cloud e computação | Azul celeste |
| Mist Valley | Redes e armazenamento | Verde e turquesa |
| Nimbus Citadel | IAM e segurança | Violeta e lavanda |
| Storm Haven | Resiliência e operações | Azul profundo e cinza |

## Pontos e prêmios

Cada acerto inédito da campanha concede **25 pontos e 100 XP**, até 3.000 pontos. Revisões e partidas não repetem esses créditos.

| Prêmio | Pontos |
| --- | ---: |
| Garrafa de água | 300 |
| Lanche completo | 500 |
| Day off | 2.000 |

Solicitações reservam o saldo e aguardam aprovação administrativa. Recusa ou cancelamento antes da aprovação devolve os pontos. A entrega/concessão é registrada pelo administrador; o jogo não compra produtos nem agenda folgas automaticamente.

Cadastre a conta do administrador e execute `CONFIGURAR-ADMIN.cmd`, ou:

```sh
node admin.mjs grant nome-do-usuario
```

## Configuração e dados

Copie `.env.example` para `.env` se precisar alterar porta ou endereço. O banco é criado em `data/infraquest.sqlite`. **Dados de contas, sessões e configurações privadas não fazem parte deste repositório.**

Senhas são derivadas com scrypt e salt individual. Sessões usam cookies HttpOnly. O email é um identificador; verificação por email e recuperação de senha ainda não estão configuradas.

Os botões de **Microsoft** e **AWS IAM Identity Center** estão preparados, mas os provedores permanecem desconectados. O adaptador SAML opcional requer dependência e configuração adicionais. Consulte [CONFIGURAR-SSO.txt](CONFIGURAR-SSO.txt) antes de habilitar qualquer integração.

Para amigos em computadores diferentes, todos precisam acessar um mesmo servidor compartilhado. O ID identifica uma sala dentro desse servidor. O padrão escuta apenas em `127.0.0.1`; a configuração de rede/hospedagem está em [LEIA-ME.txt](LEIA-ME.txt). Em produção, use HTTPS, controle de ingresso e armazenamento persistente. GitHub armazena o código; este app Node não funciona como um site estático no GitHub Pages.

## Testes

```sh
npm test
```

Ou execute separadamente:

```sh
node tests/app.test.mjs
node tests/rooms.test.mjs
```

Os testes usam bancos temporários e verificam campanha, exploração, saldo, resgates, aprovação, isolamento de contas, salas e robô.

## Manutenção

Este repositório é a fonte das próximas alterações do projeto. As instruções para validar e sincronizar mudanças estão em [AGENTS.md](AGENTS.md).
