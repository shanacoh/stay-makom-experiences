import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import NotFound from "./NotFound";
import DOMPurify from "dompurify";
import { useLanguage, getLocalizedField } from "@/hooks/useLanguage";
import { Block } from "@/components/admin/journal/types";

const JournalPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();

  const { data: post, isLoading } = useQuery({
    queryKey: ["journal-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_posts" as any)
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .not("published_at", "is", null)
        .single();

      if (error) throw error;
      return data as any;
    },
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      Stories: "bg-[#D72638]",
      Places: "bg-amber-500",
      Guides: "bg-blue-500",
      People: "bg-green-500",
    };
    return colors[category as keyof typeof colors] || "bg-gray-500";
  };

  // Parse blocks from JSON string, fallback to legacy HTML
  const parseContent = (content: string): { blocks: Block[] | null; html: string | null } => {
    if (!content) return { blocks: null, html: null };
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return { blocks: parsed, html: null };
      }
      return { blocks: null, html: content };
    } catch {
      // Legacy HTML content
      return { blocks: null, html: content };
    }
  };

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case "title":
        const TitleTag = block.level;
        const titleClasses = {
          h1: "text-4xl font-bold mt-10 mb-4",
          h2: "text-3xl font-bold mt-8 mb-3",
          h3: "text-2xl font-semibold mt-6 mb-2",
        };
        return block.content ? (
          <TitleTag className={titleClasses[block.level]}>{block.content}</TitleTag>
        ) : null;

      case "text":
        return block.content ? (
          <p className="text-lg leading-relaxed mb-6 whitespace-pre-wrap">
            {block.content}
          </p>
        ) : null;

      case "image":
        return block.url ? (
          <figure className="my-8">
            <img
              src={block.url}
              alt={block.alt || "Article image"}
              className="w-full rounded-lg shadow-md"
            />
            {block.caption && (
              <figcaption className="text-sm text-muted-foreground text-center mt-3">
                {block.caption}
              </figcaption>
            )}
          </figure>
        ) : null;

      case "cta":
        return block.text ? (
          <div className="my-10 text-center">
            <Button size="lg" asChild>
              <a href={block.url} target="_blank" rel="noopener noreferrer">
                {block.text}
              </a>
            </Button>
          </div>
        ) : null;

      case "quote":
        return block.content ? (
          <blockquote className="my-8 pl-6 border-l-4 border-primary">
            <p className="text-xl italic text-muted-foreground leading-relaxed">
              {block.content}
            </p>
            {block.author && (
              <cite className="block mt-3 text-sm font-medium not-italic">
                — {block.author}
              </cite>
            )}
          </blockquote>
        ) : null;

      case "list":
        const ListTag = block.style === "bullet" ? "ul" : "ol";
        const listClass =
          block.style === "bullet"
            ? "list-disc list-inside"
            : "list-decimal list-inside";
        return block.items.some((item) => item) ? (
          <ListTag className={`${listClass} my-6 space-y-2 text-lg`}>
            {block.items
              .filter((item) => item)
              .map((item, i) => (
                <li key={i}>{item}</li>
              ))}
          </ListTag>
        ) : null;

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="h-8 bg-muted rounded w-32 mb-8 animate-pulse" />
          <div className="h-12 bg-muted rounded mb-4 animate-pulse" />
          <div className="h-6 bg-muted rounded w-48 mb-8 animate-pulse" />
          <div className="aspect-[16/9] bg-muted rounded mb-12 animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return <NotFound />;
  }

  const title = getLocalizedField(post, "title", lang) || post.title_en;
  const excerpt = getLocalizedField(post, "excerpt", lang) || post.excerpt_en;
  const content = getLocalizedField(post, "content", lang) || post.content_en;
  const { blocks, html } = parseContent(content);
  const isRTL = lang === "he";

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <SEOHead
        titleEn={post.seo_title_en || post.title_en}
        titleHe={post.seo_title_he || post.title_he}
        titleFr={post.seo_title_fr}
        descriptionEn={post.meta_description_en || post.excerpt_en}
        descriptionHe={post.meta_description_he || post.excerpt_he}
        descriptionFr={post.meta_description_fr}
        ogTitleEn={post.og_title_en || post.seo_title_en || post.title_en}
        ogTitleHe={post.og_title_he || post.seo_title_he || post.title_he}
        ogTitleFr={post.og_title_fr || post.seo_title_fr}
        ogDescriptionEn={post.og_description_en || post.meta_description_en || post.excerpt_en}
        ogDescriptionHe={post.og_description_he || post.meta_description_he || post.excerpt_he}
        ogDescriptionFr={post.og_description_fr || post.meta_description_fr}
        ogImage={post.og_image || post.cover_image}
      />
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-20" dir={isRTL ? "rtl" : "ltr"}>
        <Link to="/journal">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className={`w-4 h-4 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`} />
            {isRTL ? "חזרה ליומן" : "Back to Journal"}
          </Button>
        </Link>

        <article>
          <div className="flex items-center gap-3 mb-6">
            <Badge className={`${getCategoryColor(post.category)} text-white`}>
              {post.category}
            </Badge>
            {post.published_at && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.published_at), "MMMM d, yyyy")}
              </div>
            )}
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6">
            {title}
          </h1>

          {post.author_name && (
            <p className="text-lg text-muted-foreground mb-12">
              {isRTL ? `מאת ${post.author_name}` : `By ${post.author_name}`}
            </p>
          )}

          {post.cover_image && (
            <div className="aspect-[16/9] rounded-lg overflow-hidden mb-12">
              <img
                src={post.cover_image}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {excerpt && (
            <div className="text-xl leading-relaxed mb-10 text-muted-foreground font-serif">
              {excerpt}
            </div>
          )}

          {/* Render block-based content */}
          {blocks && blocks.length > 0 ? (
            <div className="prose prose-lg max-w-none">
              {blocks.map((block) => (
                <div key={block.id}>{renderBlock(block)}</div>
              ))}
            </div>
          ) : html ? (
            // Fallback to legacy HTML content
            <div
              className="prose prose-lg max-w-none"
              style={{ fontSize: "1.125rem", lineHeight: "1.75rem" }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(html, {
                    ALLOWED_TAGS: [
                      "p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6",
                      "ul", "ol", "li", "a", "blockquote", "img", "pre", "code", "span", "div",
                    ],
                    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "class", "style"],
                  }),
                }}
                className="whitespace-pre-wrap"
              />
            </div>
          ) : null}
        </article>

        <div className="mt-16 pt-8 border-t">
          <Link to="/journal">
            <Button variant="outline" size="lg">
              <ArrowLeft className={`w-4 h-4 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`} />
              {isRTL ? "עוד סיפורים" : "More Stories"}
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JournalPost;
