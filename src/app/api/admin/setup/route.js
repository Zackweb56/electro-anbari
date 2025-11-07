import { NextResponse } from 'next/server';

export async function POST(request) {
  // Setup route is disabled for security reasons
  return NextResponse.json(
    { error: 'Setup route is disabled' },
    { status: 403 }
  );
}

export async function GET(request) {
  // Setup route is disabled for security reasons
  return NextResponse.json(
    { error: 'Setup route is disabled' },
    { status: 403 }
  );
}
