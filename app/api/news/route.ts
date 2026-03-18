export async function GET() {
  const res = await fetch(
    `https://gnews.io/api/v4/top-headlines?country=in&lang=en&max=10&apikey=${process.env.GNEWS_KEY}`,
    { next: { revalidate: 3000 } },
  );

  const data = await res.json();
  return Response.json(data);
}
