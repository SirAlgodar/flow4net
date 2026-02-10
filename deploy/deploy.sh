#!/bin/bash

# Configurações
APP_DIR="/var/www/flow4network" # Ajuste conforme necessário
BACKUP_DIR="/var/www/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BRANCH="main" # ou "master" dependendo do repositório
PM2_APP_NAME="flow4network"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Função de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERRO: $1${NC}"
}

# Função de Rollback
rollback() {
    echo -e "${RED}!!! INICIANDO ROLLBACK !!!${NC}"
    if [ -d "$BACKUP_DIR/last_success" ]; then
        log "Restaurando backup anterior..."
        rsync -a --delete "$BACKUP_DIR/last_success/" "$APP_DIR/"
        
        cd "$APP_DIR"
        log "Reinstalando dependências do backup..."
        npm ci --production
        
        log "Reiniciando aplicação com versão anterior..."
        pm2 reload deploy/ecosystem.config.js
        
        echo -e "${GREEN}Rollback concluído com sucesso.${NC}"
    else
        error "Nenhum backup encontrado para rollback!"
    fi
    exit 1
}

# Garantir que estamos no diretório da aplicação
if [ ! -d "$APP_DIR" ]; then
    error "Diretório da aplicação não encontrado: $APP_DIR"
    exit 1
fi

mkdir -p "$BACKUP_DIR"

log "Iniciando deploy..."

# 1. Criar Backup da versão atual (se existir build)
if [ -d "$APP_DIR/.next" ]; then
    log "Criando backup da versão atual..."
    # Salva como 'last_success' para rollback rápido
    rsync -a --delete --exclude 'node_modules' --exclude '.git' "$APP_DIR/" "$BACKUP_DIR/last_success/"
    # Também arquiva com timestamp
    # tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "$APP_DIR" .
fi

# 2. Atualizar código
cd "$APP_DIR" || exit 1
log "Baixando atualizações do git ($BRANCH)..."
git fetch origin
git reset --hard "origin/$BRANCH"

if [ $? -ne 0 ]; then
    error "Falha ao atualizar código git."
    exit 1 # Não faz rollback pois não mudou nada crítico ainda
fi

# 3. Instalar Dependências
log "Instalando dependências..."
npm ci

if [ $? -ne 0 ]; then
    error "Falha na instalação de dependências."
    # Rollback não necessário se falhar no npm ci, mas seguro ter
    rollback
fi

# Carregar variáveis de ambiente explicitamente para garantir que o Prisma as veja
if [ -f .env ]; then
    log "Carregando variáveis de ambiente do .env..."
    export $(grep -v '^#' .env | xargs)
fi

# 4. Migração do Banco de Dados
log "Executando migrações do banco de dados..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    error "Falha na migração do banco de dados."
    rollback
fi

# 5. Build da Aplicação
log "Buildando aplicação Next.js..."
npm run build

if [ $? -ne 0 ]; then
    error "Falha no build da aplicação."
    rollback
fi

# 6. Reiniciar Aplicação via PM2
log "Reiniciando processo PM2..."
pm2 reload deploy/ecosystem.config.js --update-env

if [ $? -ne 0 ]; then
    # Se falhar o reload, tenta start
    pm2 start deploy/ecosystem.config.js
    if [ $? -ne 0 ]; then
        error "Falha ao reiniciar PM2."
        rollback
    fi
fi

# 7. Verificação de Saúde (Health Check simples)
log "Aguardando inicialização para Health Check..."
sleep 10
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/diagnostics/ping) # Ajuste a URL conforme rota de health check

if [[ "$HTTP_CODE" == "200" || "$HTTP_CODE" == "401" ]]; then # 401 aceitável se rota for protegida mas responder
    log "Health Check PASSOU (HTTP $HTTP_CODE)."
else
    error "Health Check FALHOU (HTTP $HTTP_CODE)."
    rollback
fi

log "Deploy finalizado com SUCESSO!"
