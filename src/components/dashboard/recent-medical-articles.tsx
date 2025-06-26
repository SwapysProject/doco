"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Loader2, AlertTriangle } from "lucide-react";

interface Article {
  id: number;
  title: string;
  text: string;
  summary?: string;
  url: string;
  image?: string;
  video?: string;
  publish_date?: string;
  author?: string;
  authors?: string[];
  language?: string;
  source_country?: string;
  sentiment?: number;
}

export function WorldNewsCard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/worldnews")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.news)) {
          setArticles(data.news);
          setError(null);
        } else {
          setError("Failed to load articles");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load articles");
        setLoading(false);
      });
  }, []);

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-black dark:text-white" />
          BBC Health News ({articles.length} articles)
        </CardTitle>
        <Link href="https://www.bbc.com/news/health" target="_blank">
          <Button
            variant="outline"
            size="sm"
            className="transition-all duration-200 hover:scale-105"
          >
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-600 text-center py-8">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-black dark:text-white">Loading articles...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-black dark:text-white">No recent articles found</p>
          </div>
        ) : (
          <ul>
            {articles.map((article, idx) => (
              <li
                key={article.id}
                className="py-5 border-b last:border-b-0 border-black dark:border-white"
                style={{
                  animationDelay: `${idx * 100}ms`,
                  animation: "fadeInUp 0.5s ease-out forwards",
                }}
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group whitespace-normal"
                >
                  <div className="font-semibold text-black dark:text-white text-base group-hover:underline mb-3">
                    {article.title}
                  </div>
                  {article.summary && (
                    <div className="text-base text-black dark:text-white mb-4 whitespace-normal leading-relaxed">
                      {article.summary.slice(0, 400)}{article.summary.length > 400 ? "..." : ""}
                    </div>
                  )}
                  {article.text && article.text !== article.summary && (
                    <div className="text-sm text-black dark:text-white mb-4 whitespace-normal leading-relaxed">
                      {article.text.slice(0, 450)}{article.text.length > 450 ? "..." : ""}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-black dark:text-white">
                    <span>{article.author || "BBC Health"}</span>
                    <span>
                      {article.publish_date
                        ? new Date(article.publish_date).toLocaleDateString()
                        : "—"}
                    </span>
                    <span className="ml-auto text-black dark:text-white group-hover:underline">
                      Read Article
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
