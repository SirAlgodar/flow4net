# Processo de Coleta de Dados

Este documento descreve o processo de coleta de dados de testes de rede, conforme especificado no relatório padrão (PDF).

## Modelo de Dados

Os dados são coletados e armazenados no banco de dados seguindo o modelo `TestResult`. A validação é garantida pelo schema Zod (`src/lib/schemas/test-result.ts`).

### Campos Principais

1.  **Identificação**: CPF/CNPJ, Data, Duração.
2.  **Dispositivo**: Plataforma, Navegador, Hardware (CPU, RAM, GPU).
3.  **Rede**: Provedor, IP, IPv6, MTU, MSS.
4.  **Velocidade**: Download/Upload (Média e Máximo), Ping, Jitter.
5.  **Streaming**: Status para SD, HD, Ultra HD, 4K, Live.
6.  **Qualidade**: Velocidade, Latência, Perda de Pacotes, Sinal.

## Formulário de Coleta

Foi criado um formulário de coleta manual para entrada ou correção de dados.

- **Localização**: `/admin/results/entry`
- **Componente**: `src/components/admin/ManualDataCollectionForm.tsx`
- **Validação**: Realizada em tempo real usando `zod` e `react-hook-form`. Campos inválidos são destacados em vermelho com mensagens de erro.

## Execução de Testes de Validação

### 1. Validação do Schema (Lógica)
Para verificar se o esquema de dados está capturando corretamente os campos do relatório padrão, execute o script de teste de schema:

```bash
npx tsx scripts/test-pdf-schema.ts
```
Este script valida um objeto mock contendo os dados extraídos do PDF de exemplo contra o schema de validação Zod.

### 2. Validação de Persistência (Banco de Dados)
Para garantir que os dados podem ser salvos corretamente no banco de dados com a estrutura atualizada, execute:

```bash
npx tsx scripts/verify-db-insertion.ts
```
Este script:
1. Cria um Link de Teste temporário.
2. Insere um registro completo baseado no PDF de exemplo.
3. Lê o registro do banco e verifica se os valores (ex: MTU, MSS, Velocidades) correspondem exatamente.
4. Remove os dados de teste ao finalizar.

> **Nota**: Certifique-se de que as migrações do banco de dados foram aplicadas (`npx prisma migrate dev`) antes de executar este teste.

## Instruções para Usuários

1.  Acesse a área administrativa e navegue para "Entrada de Resultados" (`/admin/results/entry`).
2.  Preencha os campos conforme os dados apresentados no relatório ou na ferramenta de teste.
3.  **Atenção aos campos críticos**:
    - **MTU/MSS**: Devem estar dentro dos limites (576-1500 para MTU).
    - **IP**: Deve ser um endereço IPv4 válido.
    - **Valores Numéricos**: Utilize ponto (.) para decimais se necessário.
4.  O botão "Salvar Resultado" só será habilitado se todos os campos obrigatórios estiverem preenchidos corretamente.
5.  Ao salvar, os dados serão validados e enviados para o sistema.

## Visualização de Resultados

Os resultados detalhados podem ser visualizados na lista de testes.

1.  Acesse "Gerenciamento de Testes" (`/admin/tests`).
2.  Clique em "Ver Detalhes" em uma execução de teste.
3.  O modal exibirá todas as informações coletadas, incluindo:
    -   **Hardware e Sistema**: CPU, RAM, GPU, Navegador e Versão.
    -   **Rede Avançada**: MTU, MSS, IP Local, IPv6.
    -   **Identificação**: CPF/CNPJ (se informado).
    -   **Qualidade e Métricas**: Suporte 4K, Ping, Jitter, etc.
4.  É possível exportar os dados completos em formato **CSV** ou **JSON** clicando nos botões correspondentes no rodapé do modal.
