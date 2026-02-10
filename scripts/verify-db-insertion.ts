import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pdfData = {
  // Identificação
  cpfCnpj: "07881658363",
  
  // Dispositivo
  deviceType: "Android 10",
  os: "Android 10",
  browser: "Chrome",
  browserVersion: "144",
  userAgent: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36",
  ram: "1 GB ou mais",
  cpuCores: 7,
  gpu: "Mali-G52 MC2",

  // Rede
  provider: "BRISANET SERVICOS DE TELECOMUNICACOES S.A",
  publicIp: "177.37.162.103",
  isIpv6: false,
  mtu: 1110,
  mss: 1070,

  // Speed
  downloadAvg: 6.2,
  downloadMax: 6.21,
  uploadAvg: 7.6,
  uploadMax: 7.73,
  ping: 34.0,
  jitter: 75.0,
  jitterStatus: "Crítico",

  // Streaming
  sdStatus: "OK",
  hdStatus: "OK",
  ultraHdStatus: "Dificuldades",
  liveStatus: "Dificuldades",
  status4k: "Dificuldades",

  // Qualidade
  qualitySpeed: 0.78,
  qualityLatency: 0.17,
  packetLoss: 0.0,
  signalStatus: "Sinal Bom",
  
  // External Status (mock)
  externalStatus: {
    "Google": "ESTÁVEL",
    "Netflix": "ESTÁVEL",
    "Facebook": "ESTÁVEL"
  }
};

async function verifyDbInsertion() {
  console.log("🚀 Iniciando verificação de inserção no banco de dados...");
  
  try {
    // 1. Create a TestLink to associate (optional but good for consistency)
    console.log("1. Criando TestLink temporário...");
    const testLink = await prisma.testLink.create({
      data: {
        code: `VERIFY_${Date.now()}`,
        type: "QUICK"
      }
    });
    console.log(`   ✅ TestLink criado: ${testLink.id}`);

    // 2. Insert TestResult
    console.log("2. Inserindo dados extraídos do PDF...");
    const result = await prisma.testResult.create({
      data: {
        testLinkId: testLink.id,
        ...pdfData
      }
    });
    console.log(`   ✅ Resultado inserido com sucesso: ${result.id}`);

    // 3. Verify Data Integrity
    console.log("3. Verificando integridade dos dados salvos...");
    const saved = await prisma.testResult.findUnique({
      where: { id: result.id }
    });

    if (!saved) throw new Error("Resultado não encontrado após inserção!");

    // Checks
    const errors: string[] = [];
    if (saved.mtu !== 1110) errors.push(`MTU incorreto: ${saved.mtu} != 1110`);
    if (saved.mss !== 1070) errors.push(`MSS incorreto: ${saved.mss} != 1070`);
    if (saved.downloadAvg !== 6.2) errors.push(`Download incorreto: ${saved.downloadAvg} != 6.2`);
    if (saved.ultraHdStatus !== "Dificuldades") errors.push(`Status UHD incorreto: ${saved.ultraHdStatus}`);
    
    if (errors.length > 0) {
      console.error("❌ Falha na verificação de dados:");
      errors.forEach(e => console.error("   - " + e));
      process.exit(1);
    } else {
      console.log("   ✅ Todos os campos verificados correspondem ao esperado.");
    }

    // Cleanup
    console.log("4. Limpando dados de teste...");
    await prisma.testResult.delete({ where: { id: result.id } });
    await prisma.testLink.delete({ where: { id: testLink.id } });
    console.log("   ✅ Limpeza concluída.");

    console.log("🎉 VERIFICAÇÃO BEM-SUCEDIDA!");

  } catch (error) {
    console.error("❌ Erro durante a verificação:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDbInsertion();
