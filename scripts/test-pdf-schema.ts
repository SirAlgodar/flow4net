import { TestResultSchema } from '../src/lib/schemas/test-result';

const pdfData = {
  solicitante: "Solicitante",
  identificador: "07881658363",
  realizadoEm: "2026-01-26T11:03:52", // ISO format
  duracao: "54 segundos",
  plataforma: "Android 10",
  navegador: "Chrome",
  versao: "144",
  processadores: 7,
  memoria: "1 GB ou mais",
  gpu: "Mali-G52 MC2",
  userAgent: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36",
  provedor: "BRISANET SERVICOS DE TELECOMUNICACOES S.A",
  ip: "177.37.162.103",
  ipv6: "Não é IPv6",
  mtu: 1110,
  mss: 1070,
  downloadAvg: 6.2,
  downloadMax: 6.21,
  uploadAvg: 7.6,
  uploadMax: 7.73,
  ping: 34,
  jitter: 75,
  jitterStatus: "Crítico",
  sdStatus: "OK",
  hdStatus: "OK",
  ultraHdStatus: "Dificuldades",
  liveStatus: "Dificuldades",
  status4k: "Dificuldades",
  qualitySpeed: 0.78,
  qualityLatency: 0.17,
  packetLoss: 0,
  signalStatus: "Sinal Bom"
};

async function runTest() {
  console.log("Testing TestResultSchema with PDF data...");
  try {
    const result = TestResultSchema.parse(pdfData);
    console.log("✅ Validation Successful!");
    console.log("Parsed Data:", result);
  } catch (error) {
    console.error("❌ Validation Failed:", error);
    process.exit(1);
  }
}

runTest();
