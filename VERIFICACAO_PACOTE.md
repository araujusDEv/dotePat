# Verificação do pacote Appet — 07/10/2026

Pacote completo preparado a partir da versão local mais recente: Appet 4.0,
com as correções de campanhas e a recuperação administrativa de 03/10/2026.
Os arquivos do site conferem com a outra cópia atualizada do projeto.
O código funcional foi preservado; esta entrega acrescenta instruções de uso
e reúne todos os arquivos necessários em um único ZIP.

## Ambiente e resultados

- Node.js 22.23.1 e npm 10.9.8.
- Instalação limpa com `npm ci`: as seis dependências foram instaladas usando
  os arquivos travados em `package-lock.json` e o cache local.
- `npm test`: aprovado, sem falhas.
- Pix: formato BR Code, CRC, tipos de chave e limites de valor.
- Campanhas: rascunhos, evidências, análise, revisão, aprovação, pausa,
  reativação, encerramento, organizações e apoio contínuo.
- Adoção: autenticação, aprovação de ONG, publicação, permissões,
  solicitações, conclusão e termo.
- Segurança: headers, acesso a arquivos privados, privacidade de usuários,
  fotos, limites por IP, persistência de IDs e entradas malformadas.
- Migração: inicialização repetida e preservação de contas, senhas,
  vínculos, Pix, totais e demais coleções nos cenários automatizados.
- Administrador: nova senha, rejeição da senha anterior, revogação de
  sessões, preservação dos demais dados e recuperação de uso único.
- 28 páginas HTML, 46 scripts JavaScript e 693 referências locais
  verificados: nenhuma referência local ausente e nenhum erro de sintaxe.
- Conferência no navegador: página inicial e navegação para adoção,
  imagens da inicial carregadas e nenhum erro de console na inicial.
- ZIP extraído e comparado arquivo a arquivo com a versão verificada;
  instalação e inicialização conferidas novamente na cópia extraída.

Os testes usam bancos separados e não alteram a sua hospedagem.
O aviso de recurso experimental do SQLite emitido pelo Node.js nesta
versão é um aviso do runtime; os testes terminaram com sucesso.

## Conteúdo e limites

O ZIP inclui o servidor, as 28 páginas, CSS, JavaScript, imagens, fontes,
bibliotecas do projeto, dados iniciais, testes, arquivos de dependências,
inicializadores, configuração de hospedagem e documentação.

`node_modules` é instalado com `npm ci`. Bancos locais, sessões, arquivos
de ambiente, logs, caches e anexos privados não fazem parte do pacote.
Os registros já publicados dependem do banco que está na hospedagem.

A recuperação pública de senha por e-mail ainda não foi implementada.
O pedido interno de recuperação e a operação administrativa por variáveis
de ambiente mantêm o comportamento explicado em `RECUPERAR_ADMIN.md`.

A verificação confirma os cenários acima no ambiente local. O funcionamento
na hospedagem também depende de Node.js compatível, variáveis de ambiente,
HTTPS e armazenamento do banco. Nenhuma publicação foi executada.
