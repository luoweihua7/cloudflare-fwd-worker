import useReflare from 'reflare';
import isValidDomain from 'is-valid-domain';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const reflare = await useReflare();

    const uri = new URL(request.url);
    const { host, pathname } = uri;
    const [domain, ...paths] = pathname.split('/').filter((_) => _);

    if (!isValidDomain(domain)) {
      return new Response('', { status: 404 });
    }

    reflare.push({
      path: '/*',
      upstream: {
        domain,
        protocol: 'https',
        onRequest: (request: Request, url: string): Request => {
          const targetUrl = uri.href.replace(uri.origin, uri.protocol + '/');
          return new Request(targetUrl, request);
        },
      },
      cors: {
        origin: true,
      },
    });

    return reflare.handle(request);
  },
};
