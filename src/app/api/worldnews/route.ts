export async function GET() {
  // Using BBC Health RSS feed via rss2json.com (free, no API key required)
  const url = "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/health/rss.xml";

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === "ok" && Array.isArray(data.items)) {
      // Transform RSS data to match your expected format - increased to 11 articles
      const transformedNews = data.items.slice(0, 11).map((item: any, index: number) => ({
        id: index + 1,
        title: item.title,
        text: item.description || item.content || "",
        summary: item.description || "",
        url: item.link,
        image: "", // Remove images
        publish_date: item.pubDate,
        author: item.author || "BBC Health",
        authors: [item.author || "BBC Health"],
        source_country: "UK",
        language: "en"
      }));

      return new Response(JSON.stringify({ news: transformedNews }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Failed to load articles" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to fetch news" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
