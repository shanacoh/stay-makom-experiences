import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, MapPin, Star } from "lucide-react";
import { format } from "date-fns";
import NotFound from "./NotFound";
import DOMPurify from "dompurify";
import { useLanguage, getLocalizedField } from "@/hooks/useLanguage";
import { Block } from "@/components/admin/journal/types";

// Embedded Experience Card Component
function EmbeddedExperienceCard({ experienceId }: { experienceId: string }) {
  const { lang } = useLanguage();
  
  const { data: experience, isLoading } = useQuery({
    queryKey: ["embedded-experience", experienceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select(`
          id,
          title,
          title_he,
          slug,
          hero_image,
          base_price,
          currency,
          status,
          hotels!inner(name, name_he, city, city_he, hero_image)
        `)
        .eq("id", experienceId)
        .eq("status", "published")
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!experienceId,
  });

  if (isLoading) {
    return (
      <div className="my-8 p-4 border rounded-lg bg-muted/30 animate-pulse">
        <div className="flex gap-4">
          <div className="w-32 h-24 bg-muted rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return null; // Experience deleted/archived - don't show anything
  }

  const hotel = experience.hotels as any;
  const title = lang === "he" ? experience.title_he || experience.title : experience.title;
  const hotelName = lang === "he" ? hotel?.name_he || hotel?.name : hotel?.name;
  const city = lang === "he" ? hotel?.city_he || hotel?.city : hotel?.city;
  const imageUrl = experience.hero_image || hotel?.hero_image;

  return (
    <Link 
      to={`/experience/${experience.slug}`}
      className="block my-8 group"
    >
      <div className="border rounded-xl overflow-hidden bg-card hover:shadow-lg transition-shadow">
        <div className="flex flex-col sm:flex-row">
          {imageUrl && (
            <div className="sm:w-48 aspect-video sm:aspect-square overflow-hidden">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center">
            <p className="text-sm text-muted-foreground mb-1">{hotelName}</p>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {city}
                </span>
              )}
              <span className="font-semibold text-foreground">
                {experience.currency} {experience.base_price}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

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
        // Rich text content - render as sanitized HTML
        // Transform empty paragraphs to have visible height
        const processedTextContent = block.content
          ? block.content.replace(/<p><\/p>/g, '<p>&nbsp;</p>').replace(/<p>\s*<\/p>/g, '<p>&nbsp;</p>')
          : '';
        return processedTextContent ? (
          <div 
            className="text-lg leading-relaxed mb-6 prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(processedTextContent, {
                ALLOWED_TAGS: [
                  "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3",
                  "ul", "ol", "li", "a", "span",
                ],
                ALLOWED_ATTR: ["href", "target", "rel", "class", "style"],
              }),
            }}
          />
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
              <Link to={block.url}>
                {block.text}
              </Link>
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

      case "experience":
        return block.experience_id ? (
          <EmbeddedExperienceCard experienceId={block.experience_id} />
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
            // Transform empty paragraphs to have visible height
            (() => {
              const processedHtml = html
                .replace(/<p><\/p>/g, '<p>&nbsp;</p>')
                .replace(/<p>\s*<\/p>/g, '<p>&nbsp;</p>');
              return (
                <div
                  className="prose prose-lg max-w-none"
                  style={{ fontSize: "1.125rem", lineHeight: "1.75rem" }}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(processedHtml, {
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
              );
            })()
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
