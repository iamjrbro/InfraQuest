# InfraQuest

## Repositório e sincronização

- Este diretório é a fonte de trabalho do jogo. Repositório autorizado pelo usuário: https://github.com/iamjrbro/InfraQuest.git.
- Ao concluir alterações solicitadas neste projeto, execute as verificações apropriadas, crie um commit descritivo e sincronize a alteração com esse repositório. Esta é uma preferência explícita do usuário.
- Leia o estado remoto antes de atualizar a branch; preserve mudanças de outras pessoas e nunca use force push para substituir histórico.
- Use a branch padrão para alterações diretas já autorizadas. Respeite proteções existentes; se necessário, publique em uma branch `codex/` e abra um PR.
- Se a sincronização falhar, preserve os arquivos locais e informe claramente que a alteração ainda não foi publicada no GitHub.
- Nunca envie `data/`, bancos SQLite, contas, cookies, tokens, `.env`, certificados/chaves privados, backups ou arquivos de execução. `.env.example` contém apenas nomes e exemplos de configuração.

## Implementação e validação

- Node.js 24+, módulos ESM, HTTP nativo e SQLite. Entrada: `server.mjs`; interface: `public/`.
- Inicie com `npm start` ou `INICIAR-JOGO.cmd`. O endereço local padrão é http://127.0.0.1:4180.
- Teste funcionalidades de campanha/recompensas com `node tests/app.test.mjs` e salas com `node tests/rooms.test.mjs`. Testes usam bancos temporários; nunca use contas reais para testes.
- Para mudanças visuais pequenas, faça verificações de sintaxe e de renderização adequadas; não repita toda a campanha sem necessidade.
- Preserve a interface rosé/marsala de contraste confortável. Cada planeta tem paleta própria em `questions.mjs`.
- Personagens têm proporções chibi, roupas casuais/cloud/tecnologia, modelos feminino e masculino e catálogo compartilhado.
- A sequência de jogo é portal/pergunta, conversa com Luma, exploração/coleta, novo portal. Não restabeleça uma fila automática de perguntas.
- Pontos de partidas e placares não podem duplicar os pontos de prêmios. Resgates reais precisam de aprovação administrativa.
- Mantenha SSO apenas preparado, sem conectar provedores, até nova autorização do usuário.
