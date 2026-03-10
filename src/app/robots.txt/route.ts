export async function GET() {
  const body = `User-agent: *
Allow: /

Sitemap: https://www.padelmanual.com/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=86400',
    },
  });
}
