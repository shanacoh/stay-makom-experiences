import { Block } from "./types";
import { Button } from "@/components/ui/button";

interface ArticlePreviewProps {
  title: string;
  coverImage: string;
  excerpt: string;
  blocks: Block[];
  author: string;
  category: string;
}

export function ArticlePreview({
  title,
  coverImage,
  excerpt,
  blocks,
  author,
  category,
}: ArticlePreviewProps) {
  const renderBlock = (block: Block) => {
    switch (block.type) {
      case "title":
        const TitleTag = block.level;
        const titleClasses = {
          h1: "text-4xl font-bold mt-8 mb-4",
          h2: "text-3xl font-bold mt-6 mb-3",
          h3: "text-2xl font-semibold mt-5 mb-2",
        };
        return block.content ? (
          <TitleTag className={titleClasses[block.level]}>{block.content}</TitleTag>
        ) : null;

      case "text":
        return block.content ? (
          <p className="text-lg leading-relaxed mb-4 whitespace-pre-wrap">
            {block.content}
          </p>
        ) : null;

      case "image":
        return block.url ? (
          <figure className="my-6">
            <img
              src={block.url}
              alt={block.alt || "Article image"}
              className="w-full rounded-lg shadow-md"
            />
            {block.caption && (
              <figcaption className="text-sm text-muted-foreground text-center mt-2">
                {block.caption}
              </figcaption>
            )}
          </figure>
        ) : null;

      case "cta":
        return block.text ? (
          <div className="my-8 text-center">
            <Button size="lg" asChild>
              <a href={block.url} target="_blank" rel="noopener noreferrer">
                {block.text}
              </a>
            </Button>
          </div>
        ) : null;

      case "quote":
        return block.content ? (
          <blockquote className="my-6 pl-6 border-l-4 border-primary">
            <p className="text-xl italic text-muted-foreground">{block.content}</p>
            {block.author && (
              <cite className="block mt-2 text-sm font-medium">— {block.author}</cite>
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
          <ListTag className={`${listClass} my-4 space-y-2 text-lg`}>
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

  return (
    <article className="max-w-3xl mx-auto">
      {/* Category Badge */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
          {category}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4">{title || "Untitled Article"}</h1>

      {/* Author */}
      <p className="text-muted-foreground mb-6">By {author || "Unknown"}</p>

      {/* Cover Image */}
      {coverImage && (
        <img
          src={coverImage}
          alt={title}
          className="w-full aspect-video object-cover rounded-xl mb-8"
        />
      )}

      {/* Excerpt */}
      {excerpt && (
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          {excerpt}
        </p>
      )}

      {/* Content Blocks */}
      <div className="prose prose-lg max-w-none">
        {blocks.map((block) => (
          <div key={block.id}>{renderBlock(block)}</div>
        ))}
      </div>

      {blocks.length === 0 && (
        <p className="text-muted-foreground text-center py-12">
          No content blocks yet. Start adding blocks to see the preview.
        </p>
      )}
    </article>
  );
}
