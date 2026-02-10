#!/bin/bash

LOG_FILE="/opt/flow4network/logs/deploy.log"
DEPLOY_SCRIPT="/opt/flow4network/deploy/deploy.sh"

mkdir -p "$(dirname "$LOG_FILE")"

echo "=== Iniciando Atualização Automática: $(date) ===" >> "$LOG_FILE"

if [ -f "$DEPLOY_SCRIPT" ]; then
    chmod +x "$DEPLOY_SCRIPT"
    "$DEPLOY_SCRIPT" >> "$LOG_FILE" 2>&1
else
    echo "Erro: Script de deploy não encontrado em $DEPLOY_SCRIPT" >> "$LOG_FILE"
fi

echo "=== Fim da Atualização: $(date) ===" >> "$LOG_FILE"
