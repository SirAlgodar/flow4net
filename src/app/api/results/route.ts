import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extract linkId and remove it from the data object to avoid Prisma unknown argument error
    const { testLinkId, linkId, ...restBody } = body;
    const rawLinkId = linkId || testLinkId;

    if (!rawLinkId) {
        throw new Error('testLinkId is missing');
    }

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
        ipv6: restBody.ipv6 || (restBody.network?.ipv6),
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

    const result = await prisma.testResult.create({
      data
    });

    return NextResponse.json({ success: true, id: result.id });
  } catch (e) {
    console.error('Error saving result:', e);
    return NextResponse.json({ error: 'Failed to save result' }, { status: 500 });
  }
}
