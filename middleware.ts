import { rewrite } from '@vercel/functions';

const MAXX_HOST = 'maxxtoken.app';

/** Site-root assets Astro and shared public files — must not get /maxxtoken prefixed. */
const PASSTHROUGH_PREFIXES = ['/_astro/', '/assets/'];

function isMaxxHost(hostname: string) {
  return hostname === MAXX_HOST || hostname === `www.${MAXX_HOST}`;
}

function isPassthroughAsset(pathname: string) {
  return PASSTHROUGH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
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

  if (isPassthroughAsset(pathname)) {
    return;
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
