import { rewrite } from '@vercel/functions';

const MAXX_HOST = 'maxxtoken.app';

function isMaxxHost(hostname: string) {
  return hostname === MAXX_HOST || hostname === `www.${MAXX_HOST}`;
}

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const { hostname, pathname } = url;

  if (!isMaxxHost(hostname)) {
    return;
  }

  if (hostname === `www.${MAXX_HOST}`) {
    url.hostname = MAXX_HOST;
    return Response.redirect(url.toString(), 301);
  }

  if (pathname === '/' || pathname === '') {
    return rewrite(new URL('/maxxtoken', request.url));
  }

  if (pathname.startsWith('/maxxtoken')) {
    return rewrite(new URL(pathname, request.url));
  }

  return rewrite(new URL(`/maxxtoken${pathname}`, request.url));
}

export const config = {
  matcher: ['/(.*)'],
};
