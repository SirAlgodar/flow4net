# Documentação Técnica: Flow4Network

## Funcionalidades Implementadas

### 1. Salvamento de Resultados de Testes (API Robusta)
A funcionalidade de salvamento de resultados foi aprimorada para garantir robustez, integridade dos dados e rastreabilidade.

#### Implementação
- **Arquivo:** `src/app/api/results/route.ts`
- **Validação:** Utilização da biblioteca `zod` para garantir que o payload da requisição esteja conforme o esperado antes de interagir com o banco de dados.
- **Rastreabilidade:** Geração de um `requestId` único para cada tentativa de salvamento, facilitando o rastreamento nos logs.
- **Logs:** Implementação de logs estruturados (Start, Validation Error, Saving, Success, Error) para monitoramento.
- **Tratamento de Erros:**
  - `400 Bad Request`: Se a validação falhar ou `testLinkId` estiver ausente. Retorna detalhes dos campos inválidos.
  - `404 Not Found`: Se o `linkId` fornecido não existir no banco de dados (código de erro Prisma P2025).
  - `500 Internal Server Error`: Para falhas inesperadas no banco de dados ou servidor.

#### Exemplo de Payload Válido (JSON)
```json
{
  "testLinkId": "uuid-do-link",
  "cpfCnpj": "123.456.789-00",
  "deviceType": "Desktop",
  "speed": {
    "download": 100.5,
    "upload": 50.2,
    "ping": 10,
    "jitter": 2
  },
  "streaming": {
    "hd": true,
    "uhd": false
  }
}
```

### 2. Interface de Informações de Rede (WiFi Info)
Uma interface visual para exibir informações da conexão de rede e solicitar permissões (no contexto web).

#### Implementação
- **Componente:** `src/components/WifiInfo.tsx`
- **Integração:** Adicionado ao fluxo de execução em `src/components/TestRunner.tsx`.
- **API Utilizada:** `Network Information API` (`navigator.connection`).
- **Limitações Web:**
  - Devido a restrições de segurança dos navegadores modernos, informações como SSID e Intensidade de Sinal (dBm) não são acessíveis diretamente via JavaScript em páginas web padrão.
  - A implementação foca em exibir o que é possível: Tipo de Conexão (wifi, 4g, etc.), Latência Estimada (RTT), Velocidade de Downlink Estimada e Modo de Economia de Dados.
- **Fluxo de Permissão:**
  - O componente exibe um botão "Permitir Acesso à Rede" que simula o fluxo de solicitação e ativa os listeners para atualizações em tempo real da conexão.

## Testes e Verificação

### Teste da API de Resultados (cURL)
Para verificar o salvamento de resultados, utilize o seguinte comando:

```bash
curl -X POST http://localhost:3100/api/results \
  -H "Content-Type: application/json" \
  -d '{
    "testLinkId": "SEU_UUID_AQUI",
    "cpfCnpj": "000.000.000-00",
    "speed": { "download": 100, "upload": 50, "ping": 10, "jitter": 5 }
  }'
```

**Resultado Esperado:**
- Sucesso: `{"success": true, "id": "..."}` com status 200.
- Erro (ID Inválido): `{"error": "Test Link ID not found"}` com status 404.
- Erro (Dados Inválidos): `{"error": "Invalid data format", "details": ...}` com status 400.

### Teste de Integração (Frontend)
1. Acesse um link de teste válido (ex: `/t/CODIGO`).
2. Verifique se o componente "Informações de Rede" aparece antes do botão de iniciar.
3. Clique em "Permitir Acesso à Rede" e observe os dados (Tipo, Velocidade, Latência) serem preenchidos.
4. Execute o teste completo.
5. Verifique no console do navegador e no terminal do servidor se os logs de salvamento aparecem (ex: `[uuid] Successfully saved result ID: ...`).
