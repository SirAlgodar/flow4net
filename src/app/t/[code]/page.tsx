import { TestRunner } from '@/components/TestRunner';

export default async function TestPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <TestRunner code={code} />;
}
