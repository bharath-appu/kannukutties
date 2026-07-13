import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl || !url.startsWith(supabaseUrl)) {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }

  try {
    const response = await fetch(url)

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch media' }, { status: response.status })
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const body = await response.arrayBuffer()

    const isPdf = contentType === 'application/pdf'
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': isPdf ? 'inline' : 'inline',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Media fetch failed' }, { status: 502 })
  }
}
