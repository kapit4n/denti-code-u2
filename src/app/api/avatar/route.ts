import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ message: 'Invalid form data' }, { status: 400 });
  }

  const file = form.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: 'Missing file' }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ message: 'Use JPEG, PNG, or WebP' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: 'Image must be 2 MB or smaller' }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), 'public', 'avatars');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);

  return NextResponse.json({ url: `/avatars/${name}` });
}
