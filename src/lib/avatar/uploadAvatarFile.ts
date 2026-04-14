export async function uploadAvatarFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/avatar', { method: 'POST', body: fd });
  const data = (await res.json().catch(() => ({}))) as { message?: string; url?: string };
  if (!res.ok) {
    throw new Error(data.message || `Upload failed (${res.status})`);
  }
  if (!data.url || typeof data.url !== 'string') {
    throw new Error('Invalid upload response');
  }
  return data.url;
}
