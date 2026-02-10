import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Support both flat structure (from manual form) and nested (from legacy runner if any)
    const rawLinkId = body.linkId || body.testLinkId;
    if (!rawLinkId) {
        throw new Error('testLinkId is missing');
    }

    const data = {
        testLinkId: rawLinkId,
        cpfCnpj: body.cpfCnpj || body.identificador,
        
        // Device
        deviceType: body.deviceType || body.plataforma, // Mapping 'plataforma' to deviceType/os logic if needed
        os: body.os || body.plataforma || (body.device?.os),
        browser: body.browser || (body.device?.browser),
        browserVersion: body.versao || body.browserVersion,
        userAgent: body.userAgent || (body.device?.userAgent),
        ram: body.memoria || (body.device?.deviceMemory?.toString()), // Convert to string
        cpuCores: body.processadores || (body.device?.hardwareConcurrency),
        gpu: body.gpu || (body.device?.gpu),
        
        // Network
        publicIp: body.ip || body.publicIp || (body.network?.ip),
        ipv6: body.ipv6 || (body.network?.ipv6),
        isIpv6: body.isIpv6 === "Sim" || body.isIpv6 === true, // Handle "Não é IPv6" string vs boolean if needed
        provider: body.provedor || body.provider,
        connectionType: body.connectionType || (body.network?.connectionType),
        localIp: body.localIp,

        // MTU/MSS
        mtu: Number(body.mtu) || undefined,
        mss: Number(body.mss) || undefined,
        
        // Speed
        downloadAvg: Number(body.downloadAvg) || Number(body.speed?.download) || undefined,
        downloadMax: Number(body.downloadMax) || undefined,
        uploadAvg: Number(body.uploadAvg) || Number(body.speed?.upload) || undefined,
        uploadMax: Number(body.uploadMax) || undefined,
        ping: Number(body.ping) || Number(body.speed?.ping) || undefined,
        jitter: Number(body.jitter) || Number(body.speed?.jitter) || undefined,
        jitterStatus: body.jitterStatus,
        
        // Streaming
        sdStatus: body.sdStatus,
        hdStatus: body.hdStatus || (body.streaming?.hd ? "OK" : "Dificuldades"),
        ultraHdStatus: body.ultraHdStatus || (body.streaming?.uhd ? "OK" : "Dificuldades"),
        status4k: body.status4k,
        liveStatus: body.liveStatus,
        
        // Quality
        qualitySpeed: Number(body.qualitySpeed) || undefined,
        qualityLatency: Number(body.qualityLatency) || undefined,
        packetLoss: Number(body.packetLoss) || undefined,
        signalStatus: body.signalStatus,
        
        // Metrics
        pageLoadMetrics: body.pageLoadMetrics,
        externalStatus: body.externalStatus
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
