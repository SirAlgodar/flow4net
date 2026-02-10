
# Guia de Acesso Público e Testes Externos

Este documento detalha a estratégia e os passos para tornar a solução de diagnósticos acessível externamente para testes em dispositivos móveis e remotos.

## 1. Estratégia de Acesso (Tunneling)

Para ambientes de desenvolvimento e teste sem IP público fixo, utilizamos **Tunneling** seguro.

### Opção A: Ngrok (Recomendado para testes rápidos)

O `ngrok` cria um túnel seguro do seu localhost para uma URL pública.

**Pré-requisitos:**
1. Instale o ngrok: `npm install -g ngrok` (ou baixe em ngrok.com)
2. Crie uma conta gratuita para obter seu Authtoken.

**Como Iniciar:**
No terminal do servidor (onde o Next.js está rodando na porta 3100):

```bash
ngrok http 3100
```

O terminal exibirá uma URL pública, ex: `https://a1b2-c3d4.ngrok-free.app`.

### Opção B: Cloudflare Tunnel (Mais estável)

**Como Iniciar:**
```bash
brew install cloudflared
cloudflared tunnel --url http://localhost:3100
```

## 2. Configuração de CORS e Segurança

O sistema foi configurado para aceitar conexões de origens externas seguras.

**Arquivo:** `next.config.ts`
Foi atualizado para permitir headers de origens variadas necessárias para o funcionamento dos testes de velocidade e API.

**API Pública:**
Os endpoints de teste (`/api/links/[code]`, `/api/results`) são públicos, mas protegidos logicamente:
- Apenas códigos de link válidos e não expirados podem iniciar testes.
- Resultados são vinculados estritamente ao ID do link.

## 3. Como Realizar Testes Externos

### Passo 1: Gerar um Link de Teste
1. Acesse o Painel Admin (`/admin/links/new`) na rede local.
2. Crie um novo link (ex: Tipo Rápido).
3. Copie o código gerado (ex: `4nRXmt`).

### Passo 2: Acessar no Dispositivo Externo
No celular ou computador remoto (4G/5G ou outra rede Wi-Fi):
1. Abra o navegador.
2. Acesse a URL pública gerada pelo túnel + o caminho do teste.
   
   **Exemplo:**
   `https://a1b2-c3d4.ngrok-free.app/t/4nRXmt`

### Passo 3: Executar o Diagnóstico
1. A interface de teste carregará.
2. Clique em "Iniciar Diagnóstico".
3. O sistema validará automaticamente:
   - Tipo de Dispositivo e Navegador
   - Conectividade (Ping, Jitter)
   - Velocidade (Download/Upload)
   - Streaming e Qualidade de Vídeo
4. Ao final, os resultados são enviados automaticamente para o painel.

## 4. Monitoramento

Acompanhe os testes em tempo real no Painel Administrativo:
- **Status:** `/admin/tests` (Verifique se o teste mudou de "Pendente" para "Concluído" e veja os detalhes).
- **Relatórios:** `/admin/reports` (O novo teste aparecerá nos gráficos de volume e tipos).

## 5. Exemplo de Integração via API (Opcional)

Para sistemas externos que desejam submeter resultados programaticamente:

**Endpoint:** `POST /api/results`
**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "linkId": "uuid-do-link",
  "device": { "type": "mobile", "os": "Android" },
  "network": { "ip": "200.x.x.x", "provider": "ISP X" },
  "speed": { "download": 50.5, "upload": 20.1, "ping": 15, "jitter": 2 }
}
```
