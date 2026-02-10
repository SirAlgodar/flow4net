import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { linkId, cpfCnpj, device, network, speed, streaming } = body;

    const result = await prisma.testResult.create({
      data: {
        testLinkId: linkId,
        cpfCnpj,
        
        os: device.os,
        browser: device.browser,
        userAgent: device.userAgent,
        ram: device.deviceMemory,
        cpuCores: device.hardwareConcurrency,
        gpu: device.gpu,
        
        publicIp: network.ip,
        connectionType: network.connectionType,
        
        downloadSpeed: speed.download,
        uploadSpeed: speed.upload,
        ping: speed.ping,
        jitter: speed.jitter,
        
        canStream4k: streaming.uhd,
        canStreamHd: streaming.hd,
        
        externalStatus: body.externalStatus
      }
    });

    return NextResponse.json({ success: true, id: result.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to save result' }, { status: 500 });
  }
}
