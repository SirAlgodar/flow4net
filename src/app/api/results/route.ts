import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation Schema for Robustness
const ResultSchema = z.object({
  linkId: z.string().optional(),
  testLinkId: z.string().optional(),
  cpfCnpj: z.string().optional().nullable(),
  identificador: z.string().optional().nullable(),
  
  // Device
  deviceType: z.string().optional(),
  plataforma: z.string().optional(),
  os: z.string().optional(),
  browser: z.string().optional(),
  browserVersion: z.string().optional(),
  versao: z.string().optional(),
  userAgent: z.string().optional(),
  ram: z.string().optional(),
  memoria: z.string().optional(),
  cpuCores: z.number().optional(),
  processadores: z.number().optional(),
  gpu: z.string().optional(),
  device: z.object({
    os: z.string().optional(),
    browser: z.string().optional(),
    userAgent: z.string().optional(),
    deviceMemory: z.union([z.number(), z.string()]).optional(),
    hardwareConcurrency: z.number().optional(),
    gpu: z.string().optional(),
  }).optional(),

  // Network
  ip: z.string().optional(),
  publicIp: z.string().optional(),
  ipv6: z.string().optional(),
  isIpv6: z.union([z.boolean(), z.string()]).optional(),
  asn: z.string().optional(),
  provider: z.string().optional(),
  provedor: z.string().optional(),
  connectionType: z.string().optional(),
  localIp: z.string().optional(),
  network: z.object({
    ip: z.string().optional(),
    ipv6: z.string().optional(),
    connectionType: z.string().optional(),
  }).optional(),

  // MTU/MSS
  mtu: z.union([z.number(), z.string()]).optional(),
  mss: z.union([z.number(), z.string()]).optional(),

  // Speed
  downloadAvg: z.number().optional(),
  downloadMax: z.number().optional(),
  uploadAvg: z.number().optional(),
  uploadMax: z.number().optional(),
  ping: z.number().optional(),
  jitter: z.number().optional(),
  jitterStatus: z.string().optional(),
  speed: z.object({
    download: z.number().optional(),
    upload: z.number().optional(),
    ping: z.number().optional(),
    jitter: z.number().optional(),
  }).optional(),

  // Streaming
  sdStatus: z.string().optional(),
  hdStatus: z.string().optional(),
  ultraHdStatus: z.string().optional(),
  status4k: z.string().optional(),
  liveStatus: z.string().optional(),
  streaming: z.object({
    hd: z.boolean().optional(),
    uhd: z.boolean().optional(),
  }).optional(),

  // Quality
  qualitySpeed: z.number().optional(),
  qualityLatency: z.number().optional(),
  packetLoss: z.number().optional(),
  signalStatus: z.string().optional(),

  // Metrics (JSON)
  pageLoadMetrics: z.any().optional(),
  externalStatus: z.any().optional(),
});

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Starting result save process...`);

  try {
    const body = await request.json();
    
    // 1. Validation
    const parseResult = ResultSchema.safeParse(body);
    if (!parseResult.success) {
      console.error(`[${requestId}] Validation failed:`, parseResult.error.format());
      return NextResponse.json(
        { error: 'Invalid data format', details: parseResult.error.format() }, 
        { status: 400 }
      );
    }
    
    const validBody = parseResult.data;

    // 2. Extract and Normalize Data
    // Extract linkId and remove it from the data object to avoid Prisma unknown argument error
    const { testLinkId, linkId, ...restBody } = validBody;
    const rawLinkId = linkId || testLinkId;

    if (!rawLinkId) {
        console.warn(`[${requestId}] Missing testLinkId`);
        return NextResponse.json({ error: 'testLinkId is required' }, { status: 400 });
    }

    // Verify if testLink exists to prevent foreign key errors
    // (Optional optimization: Prisma will throw if not found, but checking helps precise error msg)

    const data = {
        testLink: {
            connect: { id: rawLinkId }
        },
        cpfCnpj: restBody.cpfCnpj || restBody.identificador,
        
        // Device
        deviceType: restBody.deviceType || restBody.plataforma, 
        os: restBody.os || restBody.plataforma || (restBody.device?.os),
        browser: restBody.browser || (restBody.device?.browser),
        browserVersion: restBody.versao || restBody.browserVersion,
        userAgent: restBody.userAgent || (restBody.device?.userAgent),
        ram: restBody.memoria || (restBody.device?.deviceMemory?.toString()), 
        cpuCores: restBody.processadores || (restBody.device?.hardwareConcurrency),
        gpu: restBody.gpu || (restBody.device?.gpu),
        
        // Network
        publicIp: restBody.ip || restBody.publicIp || (restBody.network?.ip),
        isIpv6: restBody.isIpv6 === "Sim" || restBody.isIpv6 === true,
        provider: restBody.provedor || restBody.provider,
        connectionType: restBody.connectionType || (restBody.network?.connectionType),
        localIp: restBody.localIp,

        // MTU/MSS
        mtu: Number(restBody.mtu) || undefined,
        mss: Number(restBody.mss) || undefined,
        
        // Speed
        downloadAvg: Number(restBody.downloadAvg) || Number(restBody.speed?.download) || undefined,
        downloadMax: Number(restBody.downloadMax) || undefined,
        uploadAvg: Number(restBody.uploadAvg) || Number(restBody.speed?.upload) || undefined,
        uploadMax: Number(restBody.uploadMax) || undefined,
        ping: Number(restBody.ping) || Number(restBody.speed?.ping) || undefined,
        jitter: Number(restBody.jitter) || Number(restBody.speed?.jitter) || undefined,
        jitterStatus: restBody.jitterStatus,
        
        // Streaming
        sdStatus: restBody.sdStatus,
        hdStatus: restBody.hdStatus || (restBody.streaming?.hd ? "OK" : "Dificuldades"),
        ultraHdStatus: restBody.ultraHdStatus || (restBody.streaming?.uhd ? "OK" : "Dificuldades"),
        status4k: restBody.status4k,
        liveStatus: restBody.liveStatus,
        
        // Quality
        qualitySpeed: Number(restBody.qualitySpeed) || undefined,
        qualityLatency: Number(restBody.qualityLatency) || undefined,
        packetLoss: Number(restBody.packetLoss) || undefined,
        signalStatus: restBody.signalStatus,
        
        // Metrics
        pageLoadMetrics: restBody.pageLoadMetrics,
        externalStatus: restBody.externalStatus
    };

    console.log(`[${requestId}] Saving to database for Link ID: ${rawLinkId}`);

    const result = await prisma.testResult.create({
      data
    });

    console.log(`[${requestId}] Successfully saved result ID: ${result.id}`);

    return NextResponse.json({ success: true, id: result.id });
  } catch (e: any) {
    console.error(`[${requestId}] Error saving result:`, e);
    
    // Detailed error handling for Prisma
    if (e.code === 'P2025') {
        return NextResponse.json({ error: 'Test Link ID not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to save result', details: e.message }, { status: 500 });
  }
}
