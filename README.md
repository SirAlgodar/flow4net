# Flow4Network

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

**Flow4Network** é uma solução completa para diagnóstico e testes de qualidade de conexão de rede. Projetada para provedores de internet (ISPs) e suporte técnico, a plataforma permite a criação de links de teste personalizados para clientes, coleta de métricas detalhadas (velocidade, latência, jitter, perda de pacotes) e análise da qualidade da experiência (QoE) para serviços como streaming e VoIP.

---

## 📋 Funcionalidades Principais

*   **Testes de Diagnóstico Completos**:
    *   Velocidade (Download/Upload).
    *   Latência (Ping) e Jitter.
    *   Análise de WiFi (Sinal, Frequência, SSID) e Redes Móveis.
    *   Verificação de conectividade com serviços externos (Google, Facebook, Netflix, etc.).
*   **Gestão de Links de Teste**:
    *   Criação de links rápidos, identificados ou anônimos.
    *   Configuração personalizada de parâmetros de teste.
    *   Expiração automática de links.
*   **Painel Administrativo**:
    *   Dashboard com visão geral de métricas.
    *   Relatórios detalhados de testes realizados.
    *   Gerenciamento de usuários com hierarquia e permissões (RBAC).
*   **Segurança e Identificação**:
    *   Autenticação via JWT.
    *   Distinção visual entre testes realizados por Operadores vs. Clientes.
    *   Logs de auditoria.

## 🚀 Tecnologias Utilizadas

*   **Frontend/Backend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
*   **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
*   **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
*   **Banco de Dados**: [MariaDB](https://mariadb.org/) / MySQL
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **Validação**: Zod
*   **Ícones**: Lucide React

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

*   [Node.js](https://nodejs.org/) (v18 ou superior)
*   [MariaDB](https://mariadb.org/) ou MySQL Server
*   Git

## 🔧 Instalação e Configuração

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/Flowbix/Flow4Network_v2.git
    cd Flow4Network_v2
    ```

2.  **Instale as dependências**:
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente**:
    Crie um arquivo `.env` na raiz do projeto com base no exemplo abaixo:

    ```env
    # Database Configuration
    DATABASE_URL="mysql://usuario:senha@localhost:3306/flow4network"

    # Auth Secret
    JWT_SECRET="seu-segredo-super-seguro"
    ```

4.  **Configure o Banco de Dados**:
    Gere o cliente Prisma e execute as migrações (ou push para desenvolvimento):

    ```bash
    npx prisma generate
    npx prisma db push
    ```

    *(Opcional) Popule o banco com dados iniciais:*
    ```bash
    npm run prisma:seed
    ```

## ▶️ Como Usar

### Ambiente de Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3100`.

*   **Painel Admin**: Acesse `/login` (Credenciais padrão dependem do seed, geralmente `admin` / `admin123`).
*   **Realizar Teste**: Utilize um link gerado pelo painel admin (ex: `/t/CODIGO`).

### Build de Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
npm start
```

## 📚 Documentação da API

A API segue os padrões RESTful e é utilizada internamente pelo frontend. Alguns endpoints principais incluem:

*   `GET /api/admin/tests`: Lista os testes realizados.
*   `GET /api/admin/links`: Gerencia links de teste.
*   `POST /api/auth/login`: Autenticação de usuários.
*   `POST /api/diagnostics`: Recebimento de resultados de testes.

*Nota: A documentação completa da API (Swagger/OpenAPI) está em desenvolvimento.*

## 🤝 Contribuição

Contribuições são bem-vindas! Siga os passos abaixo:

1.  Faça um Fork do projeto.
2.  Crie uma Branch para sua Feature (`git checkout -b feature/MinhaFeature`).
3.  Faça o Commit de suas mudanças (`git commit -m 'Adiciona MinhaFeature'`).
4.  Faça o Push para a Branch (`git push origin feature/MinhaFeature`).
5.  Abra um Pull Request.

## 📝 Licença

Este projeto está licenciado sob a licença **ISC**. Consulte o arquivo `package.json` para mais detalhes.

## 📊 Status do Projeto

*   **Versão Atual**: 1.0.0
*   **Cobertura de Testes**: Parcial (Em expansão)
*   **Status**: Em Desenvolvimento Ativo

---

Desenvolvido por **Flowbix**.
