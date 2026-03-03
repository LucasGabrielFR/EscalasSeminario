# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato segue o padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [Não publicado]

> Funcionalidades em desenvolvimento ou planejadas para a próxima versão.

---

## [1.2.0] - 2026-02-27

### Adicionado
- Edição de informações de pessoas (nome e número de WhatsApp)
- Botão de edição individual por pessoa na lista
- Modal de edição com validação de campos

### Alterado
- Interface da view de Pessoas atualizada para suportar ações de edição
- README atualizado com documentação completa das funcionalidades

---

## [1.1.0] - 2026-02-26

### Adicionado
- Empacotamento da aplicação como executável desktop (`.exe`) via **Electron**
- Script `electron:dev` para rodar em modo desenvolvimento como app nativo
- Script `electron:build` para gerar o executável para Windows (x64)
- Arquivo `electron/main.cjs` com configuração da janela principal
- Ícone da aplicação (`public/icon.ico`) para o executável

### Alterado
- Versão do Electron atualizada para `^40.6.1`

### Dependências adicionadas
- `electron`
- `electron-packager`
- `electron-builder`
- `concurrently`
- `wait-on`
- `cross-env`
- `png-to-ico`

---

## [1.0.0] - 2026-02-08

### Adicionado
- **Gerenciamento de Pessoas**: cadastro e exclusão de membros com nome e WhatsApp
- **Gerenciamento de Funções**: cadastro e exclusão de funções/cargos personalizados
- **Geração Automática de Escalas** com algoritmo inteligente:
  - Nenhuma pessoa realiza a mesma função duas vezes na mesma semana
  - Nenhuma pessoa realiza mais de uma função no mesmo dia
  - Maximiza a distribuição usando o maior número possível de pessoas por semana
  - Balanceia a carga ao longo das semanas com base no histórico
- **Configuração flexível de escalas**: nome, número de semanas, dias ativos, pessoas e funções participantes
- **Edição manual** de atribuições individuais após geração
- **Regeneração** de escalas com os mesmos parâmetros
- **Impressão** otimizada com CSS dedicado
- **Notificações Diárias via WAHA (WhatsApp)**:
  - Configuração de horário diário de verificação
  - Modelo de mensagem personalizável com variáveis `{person}`, `{role}`, `{day}`
  - Ativação/desativação das notificações por escala
  - Listagem e remoção das configurações ativas
- Integração com **Supabase** para persistência e sincronização em nuvem em tempo real
- Interface com **React 19 + TypeScript + Vite**
- Estilização com **Tailwind CSS**
- Ícones com **Lucide React**
- Manipulação de datas com **date-fns**

---

[Não publicado]: https://github.com/LucasGabrielFR/EscalasSeminario/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/LucasGabrielFR/EscalasSeminario/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/LucasGabrielFR/EscalasSeminario/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/LucasGabrielFR/EscalasSeminario/releases/tag/v1.0.0
