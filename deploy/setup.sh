#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Iniciando configuração do ambiente de produção...${NC}"

# Atualizar sistema
echo "Atualizando pacotes do sistema..."
sudo apt-get update && sudo apt-get upgrade -y

# Instalar dependências básicas
echo "Instalando dependências básicas (git, curl, build-essential)..."
sudo apt-get install -y git curl build-essential nginx

# Instalar Node.js (v20 LTS recomendado para Next.js 14+)
if ! command -v node &> /dev/null; then
    echo "Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js já instalado: $(node -v)"
fi

# Instalar PM2 globalmente
if ! command -v pm2 &> /dev/null; then
    echo "Instalando PM2..."
    sudo npm install -g pm2
    # Configurar PM2 para iniciar no boot
    pm2 startup
else
    echo "PM2 já instalado: $(pm2 -v)"
fi

# Instalar/Verificar Banco de Dados (MariaDB)
# Nota: Em produção, recomenda-se um servidor de banco de dados separado ou RDS/CloudSQL.
# Este script instala localmente para VPS "tudo em um".
if ! command -v mariadb &> /dev/null; then
    echo "Instalando MariaDB Server..."
    sudo apt-get install -y mariadb-server
    sudo systemctl start mariadb
    sudo systemctl enable mariadb
    echo -e "${RED}IMPORTANTE: Execute 'sudo mysql_secure_installation' manualmente após este script para proteger o banco de dados.${NC}"
else
    echo "MariaDB já instalado."
fi

# Configurar Firewall (UFW)
echo "Configurando Firewall (UFW)..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo -e "${GREEN}Configuração do ambiente concluída!${NC}"
echo "Próximos passos:"
echo "1. Clone o repositório em /var/www/flow4network (ou diretório de preferência)"
echo "2. Configure o arquivo .env"
echo "3. Execute o script deploy.sh"
