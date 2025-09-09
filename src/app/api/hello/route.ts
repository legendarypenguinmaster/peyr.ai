import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Hello from the App API!',
    timestamp: new Date().toISOString(),
    method: 'GET'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      message: 'Data received successfully!',
      receivedData: body,
      timestamp: new Date().toISOString(),
      method: 'POST'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON data' },
      { status: 400 }
    );
  }
}
