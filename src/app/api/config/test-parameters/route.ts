
import { NextRequest, NextResponse } from 'next/server';
import { detectPlatform, getPlatformSpecificConfig } from '@/lib/platform-utils';

export async function GET(req: NextRequest) {
  const userAgent = req.headers.get('user-agent') || '';
  const platform = detectPlatform(userAgent);
  const config = getPlatformSpecificConfig(platform);

  return NextResponse.json({
    platform,
    config
  });
}
