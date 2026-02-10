import { z } from 'zod';

// Helper for parsing numbers that might be entered as strings
// z.coerce.number() handles both number and string inputs
const numericString = z.coerce.number().min(0, "O valor deve ser positivo");

const percentString = z.coerce.number().min(0).max(100, "A porcentagem deve ser entre 0 e 100");

export const TestResultSchema = z.object({
  // Identificação
  solicitante: z.string().optional(),
  identificador: z.string().min(11, "CPF/CNPJ inválido").optional(),
  realizadoEm: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date()).optional(),
  duracao: z.string().optional(),

  // Dispositivo
  plataforma: z.string().min(1, "Plataforma é obrigatória"),
  navegador: z.string().min(1, "Navegador é obrigatório"),
  versao: z.string().optional(),
  processadores: numericString.optional(),
  memoria: z.string().optional(), // "1 GB ou mais"
  gpu: z.string().optional(),
  userAgent: z.string().optional(),

  // Internet
  provedor: z.string().min(1, "Provedor é obrigatório"),
  ip: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^$/, "IP inválido").optional(),
  ipv6: z.string().optional(), // "Não é IPv6" or IP address
  isIpv6: z.boolean().optional(),
  localIp: z.string().optional(),

  // MTU e MSS
  mtu: z.coerce.number().min(576, "MTU inválido (min 576)").max(1500, "MTU inválido (max 1500)"),
  mss: z.coerce.number().min(536, "MSS inválido (min 536)").max(1460, "MSS inválido (max 1460)"),

  // Teste de Velocidade
  downloadAvg: numericString,
  downloadMax: numericString.optional(),
  uploadAvg: numericString,
  uploadMax: numericString.optional(),
  ping: numericString,
  jitter: numericString,
  jitterStatus: z.string().optional(), // "Crítico", "Bom", etc.

  // Streaming Status
  sdStatus: z.union([z.string(), z.boolean()]).optional(),
  hdStatus: z.union([z.string(), z.boolean()]).optional(),
  ultraHdStatus: z.union([z.string(), z.boolean()]).optional(),
  liveStatus: z.union([z.string(), z.boolean()]).optional(),
  status4k: z.union([z.string(), z.boolean()]).optional(),

  // Qualidade de Banda
  qualitySpeed: numericString.optional(),
  qualityLatency: numericString.optional(),
  packetLoss: percentString.optional(),
  signalStatus: z.string().optional(),

  // Page Load Metrics (Optional structured data)
  pageLoadMetrics: z.array(z.object({
    name: z.string(),
    min: numericString.optional(),
    max: numericString.optional(),
    avg: numericString.optional(),
    packetLoss: percentString.optional()
  })).optional()
});

export type TestResultFormData = z.infer<typeof TestResultSchema>;
export type TestResultFormInput = z.input<typeof TestResultSchema>;
