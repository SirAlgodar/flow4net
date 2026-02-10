# Guia de Deploy e Atualização Automatizada - Flow4Network

Este documento detalha o procedimento para realizar o deploy da aplicação Flow4Network em um servidor VPS (Ubuntu/Debian) e configurar atualizações automatizadas.

## 📋 Pré-requisitos

- Servidor VPS com Ubuntu 20.04 ou superior.
- Acesso Root ou usuário com privilégios `sudo`.
- Domínio configurado apontando para o IP da VPS (opcional, mas recomendado).

## 🚀 1. Configuração Inicial do Servidor

1.  **Acesse a VPS via SSH:**
    ```bash
    ssh usuario@seu-ip-vps
    ```

2.  **Transfira o script de setup:**
    Você pode criar o arquivo manualmente ou transferi-lo da sua máquina local.
    ```bash
    # Na VPS, crie o arquivo
    nano setup.sh
    # Cole o conteúdo de deploy/setup.sh
    chmod +x setup.sh
    ./setup.sh
    ```
    *Este script instalará Node.js, PM2, Nginx, Git e configurará o Firewall.*

3.  **Configuração de Segurança do Banco de Dados (Se instalado localmente):**
    ```bash
    sudo mysql_secure_installation
    ```
    Siga as instruções para definir a senha root e remover acessos inseguros.

## 📦 2. Instalação da Aplicação

1.  **Clone o Repositório:**
    ```bash
    cd /opt
    sudo git clone https://github.com/SirAlgodar/flow4net.git flow4network
    sudo chown -R $USER:$USER flow4network
    cd flow4network
    ```

2.  **Configure as Variáveis de Ambiente:**
    ```bash
    cp .env.example .env
    nano .env
    ```
    Edite o `.env` com suas configurações de produção:
    - `DATABASE_URL`: `mysql://usuario:senha@localhost:3306/flow4network`
    - `JWT_SECRET`: Uma string longa e aleatória.
    - `NEXT_PUBLIC_API_URL`: A URL do seu domínio (ex: `https://seu-dominio.com`).

3.  **Primeiro Deploy:**
    Execute o script de deploy para instalar dependências, migrar banco e buildar.
    ```bash
    chmod +x deploy/deploy.sh
    ./deploy/deploy.sh
    ```

## 🌐 3. Configuração do Servidor Web (Nginx ou Apache)

A aplicação roda nativamente na porta **3100** (ajustável no `.env`). É necessário configurar um proxy reverso para acessar via porta 80 (HTTP) ou 443 (HTTPS).

### Opção A: Nginx (Recomendado)

1.  **Crie a configuração do site:**
    ```bash
    sudo nano /etc/nginx/sites-available/flow4network
    ```
    Copie o conteúdo de `deploy/nginx.conf`. **Atenção:** Certifique-se que o `proxy_pass` aponta para `http://localhost:3100` (ou a porta definida no seu `.env`).

2.  **Ative o site:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/flow4network /etc/nginx/sites-enabled/
    sudo nginx -t # Testa a configuração
    sudo systemctl restart nginx
    ```

### Opção B: Apache

1.  **Habilite os módulos de proxy:**
    ```bash
    sudo a2enmod proxy proxy_http rewrite
    ```

2.  **Crie a configuração do VirtualHost:**
    ```bash
    sudo nano /etc/apache2/sites-available/flow4network.conf
    ```
    Copie o conteúdo de `deploy/apache.conf`. Ajuste o `ServerName` e certifique-se que as portas batem com a aplicação (default 3100).

3.  **Ative o site:**
    ```bash
    sudo a2ensite flow4network
    sudo systemctl restart apache2
    ```

### 🔒 HTTPS (Opcional)

A aplicação funciona perfeitamente via HTTP. O HTTPS é configurado no Nível do Servidor Web (Nginx/Apache), não na aplicação Node.js.

Se desejar HTTPS, utilize o Certbot:

*   **Nginx:** `sudo certbot --nginx -d seu-dominio.com`
*   **Apache:** `sudo certbot --apache -d seu-dominio.com`

---

## 🔄 4. Automação de Atualizações

Para manter a aplicação atualizada automaticamente com a branch `main`:

1.  **Teste o script de atualização:**
    ```bash
    chmod +x deploy/update.sh
    ./deploy/update.sh
    ```
    Verifique os logs em `logs/deploy.log`.

2.  **Configure o Cron Job:**
    Edite o crontab do usuário:
    ```bash
    crontab -e
    ```
    Adicione a linha para verificar atualizações diariamente às 04:00 AM:
    ```
    0 4 * * * /opt/flow4network/deploy/update.sh
    ```

## ✅ 5. Checklist de Verificação Pós-Deploy

Após o deploy, execute os seguintes testes para garantir a integridade:


- [ ] **Acesso Web**: O site carrega em `http://seu-dominio.com` (ou HTTPS)?
- [ ] **API**: A rota `/api/diagnostics/ping` retorna 200 OK?
- [ ] **Banco de Dados**: O login no painel administrativo funciona?
- [ ] **Logs**: Verifique se há erros no PM2: `pm2 logs flow4network`.
- [ ] **Rollback**: Teste se o script de rollback funciona simulando uma falha (opcional).

## 🛠️ Comandos Úteis

- **Ver logs da aplicação**: `pm2 logs flow4network`
- **Ver status do PM2**: `pm2 status`
- **Reiniciar manualmente**: `pm2 restart flow4network`
- **Parar aplicação**: `pm2 stop flow4network`
- **Ver logs de deploy**: `tail -f logs/deploy.log`

## ⚠️ Resolução de Problemas

- **Erro 502 Bad Gateway**: O Node.js não está rodando. Verifique `pm2 status` e `pm2 logs`.
- **Erro de Conexão DB**: Verifique `DATABASE_URL` no `.env` e se o MariaDB está rodando (`systemctl status mariadb`).
- **Permissões**: Certifique-se que o usuário do deploy tem permissão de escrita em `/opt/flow4network`.
