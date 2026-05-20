import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="skellywags admin"' },
    });
  }

  let providedPassword = "";
  try {
    const decoded = atob(auth.slice(6));
    const idx = decoded.indexOf(":");
    providedPassword = idx >= 0 ? decoded.slice(idx + 1) : "";
  } catch {
    providedPassword = "";
  }

  if (providedPassword !== password) {
    return new NextResponse("Invalid credentials", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="skellywags admin"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
