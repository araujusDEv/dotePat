# Appet 4.0 — campanhas com análise administrativa

## O que mudou

- Campanhas independentes de adoção: animal do tutor, grupo de animais ou organização; vincular um animal próprio é opcional. Nenhum anúncio de adoção é criado pelo formulário de campanha.
- Solicitação em cinco etapas, rascunho persistido no servidor, evidências privadas, prévia e envio para análise. Login retorna ao fluxo.
- Minhas campanhas com situação, pendência, justificativa, histórico e próxima ação.
- Administração com filas, documentos privados, registros de verificações, pedido de ajustes, aprovação, reprovação, pausa, reativação e encerramento.
- Edição e versão pública separadas. Finalidade, meta, história, beneficiário, Pix e atualizações financeiras só mudam publicamente depois da aprovação da nova versão.
- Organizações aprovadas têm perfil público e podem solicitar apoio contínuo, sem animal obrigatório e sem meta fictícia. A aprovação da conta não aprova campanhas nem Pix.
- Cadastro: Pessoa física ou ONG / grupo de proteção. O perfil diferencia ONG, grupo independente e organizações antigas cujo tipo ainda não foi informado.
- Situação de adoção e aprovação do anúncio são campos distintos. Editar um animal adotado não o transforma em um animal disponível.
- Nova composição sem fotografia em doações e autenticação; animais em destaque mais próximos do início; menu organizado e estilos compartilhados para formulários e painéis.

## Executar

Use Node.js 22.5 ou superior; a versão verificada foi 22.23.1.

```sh
npm ci
npm start
```

Abra http://127.0.0.1:3000. No Windows, INICIAR.bat instala as dependências quando necessário. No Linux/macOS, iniciar.sh faz o mesmo. A primeira instalação requer internet. As bibliotecas pngjs e pdf-lib validam imagens e PDFs no servidor; o QR continua usando o gerador local existente.

Configure ADMIN_EMAIL e ADMIN_PASSWORD antes da primeira execução de um banco novo. Não coloque senhas no GitHub. Dados de demonstração da versão anterior foram preservados; nenhuma campanha, organização ou arrecadação fictícia dos novos testes foi adicionada ao banco entregue.

## Atualizar um banco existente

1. Pare o servidor.
2. Faça backup da pasta de dados inteira: data ou o caminho definido em DATA_DIR. Preserve também a versão antiga do código para eventual restauração.
3. Substitua os arquivos do código pelo pacote novo, mantendo a pasta de dados e suas variáveis de ambiente. Não sobrescreva seu banco com arquivos de teste.
4. Execute npm ci e npm start. As migrações são automáticas e idempotentes.
5. Confira login, animais, campanhas e /api/health antes de reabrir o acesso público.

A migração mantém IDs, vínculos com animais, chave Pix, total recebido, histórico e autoria das campanhas existentes. Campanhas públicas antigas continuam públicas e recebem um aviso de que não há análise documental registrada nesta versão. Rascunhos antigos continuam privados. O registro original da campanha é preservado internamente para auditoria.

Anúncios antigos em aguardando_aprovacao passam a ter aprovação pendente e situação de adoção separada. Se uma versão anterior já havia sobrescrito a situação antiga, não é possível reconstruir essa informação ausente; use o histórico ou um backup para conferi-la. Animais já marcados como adotados permanecem adotados.

Não execute o código antigo sobre o banco já migrado. Para reverter, restaure juntos o backup do banco e a versão anterior do código.

## Operação

### Responsável

Use Solicitar campanha. Preencha beneficiário, necessidade, evidências, recebimento e revisão. Salve rascunhos antes de sair; o sistema não guarda documentos ou dados sensíveis no localStorage. Selecione uma foto de capa apenas se ela puder ficar pública.

Minhas campanhas mostra os pedidos. Ajustes e reprovações trazem justificativa. Uma campanha aprovada pode receber propostas de atualização, incluindo cuidados, gastos, total recebido e pedido de encerramento. O novo conteúdo fica privado até a decisão administrativa; a versão aprovada continua valendo.

Contas de organizações pendentes não têm acesso operacional até sua aprovação. Após aprovação, entre novamente e complete Minha organização. O tipo de organização é informado no cadastro; a interface não certifica formalização jurídica.

### Administração

Acesse Administração → Analisar campanhas. Abra a solicitação, consulte os anexos e registre o que realmente foi verificado. Contato com clínica ou fornecedor é uma tarefa humana: marque a opção somente se tiver realizado o contato e registre a fonte independente.

Para aprovar, é obrigatório registrar uma verificação da rodada atual e um resumo público específico do que foi analisado. Não exponha documentos, dados privados ou promessas de garantia no resumo. Pedir ajustes, reprovar, pausar e encerrar exigem justificativa. Administrador, data e decisão ficam no histórico.

Solicitações de alteração passam por nova rodada de análise. Ao aprovar uma atualização com pedido de encerramento, a campanha é encerrada e deixa de gerar Pix. A administração também pode pausar ou encerrar diretamente uma campanha já aprovada.

As notificações são internas ao Appet; não há envio de e-mail ou SMS nem prazo de análise automático.

## Pix e totais

O recebedor pode ser tutor, organização, responsável, clínica/fornecedor ou outro terceiro. Para clínica/fornecedor ou outro terceiro, informe motivo e autorização; anexe a comprovação adequada para a equipe. A declaração do solicitante não comprova titularidade.

O QR Code e o Copia e Cola usam a chave da versão aprovada. Gerar código, copiar, compartilhar ou informar intenção de doar não confirma pagamento. O dinheiro vai diretamente à conta vinculada à chave. O site não consulta o banco, não confirma o nome digitado e não processa transferências.

Totais são informados após conferência humana e publicados após análise, com data. Códigos estáticos já copiados não podem ser revogados pelo site; uma pausa bloqueia novas gerações e oculta a chave na interface, mas não invalida cópias antigas.

## Segurança de evidências

- Documentos ficam em uma tabela privada do SQLite, dentro de DATA_DIR, fora das rotas estáticas públicas.
- Downloads exigem sessão do responsável ou administrador, usam Content-Disposition attachment, nosniff, no-store e CSP sandbox.
- Até 12 arquivos por campanha e 50 MB de evidências por responsável. PDF: até 4 MB, 50 páginas, parse estrutural, rejeição de criptografia e ações/scripts detectados. Fotos: convertidas no navegador para PNG, decodificadas e regravadas no servidor; limite de 4 MB, 4096 px por lado e 12 megapixels.
- Apenas a foto de capa selecionada e aprovada é servida publicamente. Um documento não pode ser usado como capa. APIs públicas usam lista explícita de campos.
- Validação de formato não comprova a verdade do caso e não substitui análise humana. Não há antivírus ou detecção de fraude por IA.
- Controle de proprietário, revisão de versão, limites por IP e chave idempotente impedem aprovações indevidas, sobrescritas comuns e repetição da criação por reenvio.

## Hospedagem

É um Web Service Node, não um site estático. O render.yaml usa npm ci e npm start. Para preservar contas, campanhas e anexos no Render, utilize armazenamento persistente e configure DATA_DIR para esse disco. O plano gratuito continua adequado apenas para demonstrações descartáveis, pois seu armazenamento é temporário. GitHub e Render não são atualizados pela entrega deste ZIP.

## Testes

```sh
npm test
```

Os testes criam bancos temporários e iniciam node server.js. Não usam nem alteram o banco da aplicação.

- Pix: exemplo de CRC do BCB, tipos de chave, valor, limites e caracteres.
- Workflow: pessoa, organização aprovada/pendente, administrador, visitante, animal sem adoção, grupo, apoio contínuo, rascunho, envio, correção, reprovação, reenvio, aprovação, pausa, retomada, encerramento solicitado, revisão de Pix/meta/total, notificações e limites.
- Privacidade: acesso cruzado negado, documento privado, capa pública somente aprovada, PDF/imagem inválidos, bloqueio de vínculos de terceiros e de autoaprovação.
- Regressão: autenticação, aprovação de organização, adoção até contrato, segurança HTTP, arquivos privados, IDs persistentes e entradas malformadas.
- Migração: preservação de contas/senhas e coleções, campanhas antigas, valores, Pix e vínculos; segunda inicialização não repete a migração.

Na interface foram exercitados login com retorno, rascunho, upload, prévia, envio, análise e aprovação. Conferidos layouts em desktop e celular (390 e 320 px), modo escuro e menu móvel. As capturas usam dados explicitamente fictícios de um banco temporário separado.

Nenhuma transferência real, verificação de clínica, validação de documento real ou publicação em produção foi realizada.

## Materiais necessários

### Para publicar um caso real

- História verdadeira, cidade, responsável e contato público autorizado; finalidade, composição de custos e meta quando houver.
- Animal individual: foto atual identificável. Tratamento/cirurgia: orçamento ou relatório veterinário legível em PDF e dados que permitam a análise humana.
- Grupo/abrigo: evidências coerentes com a necessidade, como orçamento de ração, registros das atividades e fotos autorizadas.
- Nome e chave Pix do recebedor; relação com a campanha. Para terceiros, justificativa e autorização de uso dos dados.
- Verificações realizadas pelo administrador e registros posteriores de recebimentos/gastos. Não envie esses documentos pelo repositório público.

### Melhorias estéticas opcionais

| Material | Uso | Orientação e dimensão recomendada |
|---|---|---|
| Foto do beneficiário autorizada para divulgação | Capa da campanha | Horizontal 4:3, 1200 × 900 px; manter o assunto central |
| Logo ou imagem representativa da organização | Perfil público | Quadrada, 512 × 512 px, PNG |
| Foto institucional para autenticação | Login/cadastro, se desejado | Vertical 2:3, 1200 × 1800 px; sem dados privados |

O layout funciona sem novas fotografias. Imagens ilustrativas nunca devem ser apresentadas como evidência de um caso real.

## Arquivos principais

- server.js: integra o serviço de campanhas, migra contas e separa aprovação de adoção.
- lib/campaigns.cjs: persistência, permissões, transições, revisão, anexos privados, notificações, organizações e migração.
- lib/pix.cjs e js/vendor/qrcode.min.js: geradores Pix preservados.
- solicitar-campanha.html e js/pages/solicitar-campanha.js: formulário em etapas.
- campanhas.html e js/pages/campanhas.js: acompanhamento e administração.
- organizacoes.html e js/pages/organizacoes.js: perfis, apoio contínuo e prestação de contas.
- doacoes.html e js/pages/doacoes.js: catálogo público, análise divulgada e Pix aprovado.
- js/campaign-common.js e css/campaign-workspace.css: componentes, uploads e estilos compartilhados.
- js/auth.js, login.html, registro.html e respectivos scripts: tipos de conta e retorno ao fluxo.
- js/nav.js, index.html, admin.html e painéis: navegação e hierarquia.
- package.json, package-lock.json, scripts de início e render.yaml: instalação e execução.
- tests/workflow.cjs, tests/migration.cjs e testes anteriores ajustados: validação automatizada.

## Marca Appet

Nome atualizado para Appet nas telas, títulos, mensagens, navegação, termos gerados e documentação. O nome interno do banco adotapet.db, as chaves de preferências, os e-mails das contas existentes e o identificador do serviço Render foram preservados para manter compatibilidade. A troca da marca não muda o endereço publicado. As imagens antigas não utilizadas foram preservadas; o compartilhamento da inicial usa a foto sem o nome antigo.

## Abrir o ZIP no Windows

Extraia o ZIP inteiro usando Extrair tudo ou Extrair para…; depois execute INICIAR.bat na pasta extraída. Abrir o BAT dentro do WinRAR pode executar apenas esse arquivo em uma pasta temporária, causando erro de package-lock.json ausente. O inicializador agora identifica a pasta incompleta antes de chamar o npm.
