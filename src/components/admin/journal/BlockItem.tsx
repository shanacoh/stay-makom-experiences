import { useState } from "react";
import { Block, BlockType } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GripVertical,
  Trash2,
  Type,
  FileText,
  Image,
  MousePointerClick,
  Quote,
  List,
  Plus,
  X,
} from "lucide-react";

interface BlockItemProps {
  block: Block;
  onChange: (block: Block) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  isHebrew?: boolean;
}

const blockTypeIcons: Record<BlockType, React.ReactNode> = {
  title: <Type className="w-4 h-4" />,
  text: <FileText className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  cta: <MousePointerClick className="w-4 h-4" />,
  quote: <Quote className="w-4 h-4" />,
  list: <List className="w-4 h-4" />,
};

const blockTypeLabels: Record<BlockType, string> = {
  title: "Title",
  text: "Text",
  image: "Image",
  cta: "CTA Button",
  quote: "Quote",
  list: "List",
};

export function BlockItem({
  block,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isHebrew = false,
}: BlockItemProps) {
  const [isDragging, setIsDragging] = useState(false);

  const inputClass = isHebrew ? "bg-[#EAF4FF]" : "";
  const dir = isHebrew ? "rtl" : "ltr";

  const renderBlockContent = () => {
    switch (block.type) {
      case "title":
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Select
                value={block.level}
                onValueChange={(value: "h1" | "h2" | "h3") =>
                  onChange({ ...block, level: value })
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">H1</SelectItem>
                  <SelectItem value="h2">H2</SelectItem>
                  <SelectItem value="h3">H3</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={block.content}
                onChange={(e) => onChange({ ...block, content: e.target.value })}
                placeholder="Enter title..."
                className={`flex-1 font-semibold ${inputClass}`}
                dir={dir}
              />
            </div>
          </div>
        );

      case "text":
        return (
          <Textarea
            value={block.content}
            onChange={(e) => onChange({ ...block, content: e.target.value })}
            placeholder="Write your paragraph here..."
            rows={4}
            className={inputClass}
            dir={dir}
          />
        );

      case "image":
        return (
          <div className="space-y-3">
            <ImageUpload
              label="Image"
              bucket="journal-images"
              value={block.url}
              onChange={(url) => onChange({ ...block, url })}
            />
            <Input
              value={block.alt}
              onChange={(e) => onChange({ ...block, alt: e.target.value })}
              placeholder="Alt text (for accessibility)"
              className={inputClass}
              dir={dir}
            />
            <Input
              value={block.caption}
              onChange={(e) => onChange({ ...block, caption: e.target.value })}
              placeholder="Caption (optional)"
              className={inputClass}
              dir={dir}
            />
          </div>
        );

      case "cta":
        return (
          <div className="space-y-3">
            <Input
              value={block.text}
              onChange={(e) => onChange({ ...block, text: e.target.value })}
              placeholder="Button text (e.g., Book Now)"
              className={inputClass}
              dir={dir}
            />
            <Input
              value={block.url}
              onChange={(e) => onChange({ ...block, url: e.target.value })}
              placeholder="URL (e.g., https://example.com)"
            />
            {/* CTA Preview */}
            {block.text && (
              <div className="pt-2">
                <span className="text-xs text-muted-foreground mb-2 block">Preview:</span>
                <Button className="pointer-events-none">
                  {block.text}
                </Button>
              </div>
            )}
          </div>
        );

      case "quote":
        return (
          <div className="space-y-3">
            <Textarea
              value={block.content}
              onChange={(e) => onChange({ ...block, content: e.target.value })}
              placeholder="Enter quote..."
              rows={3}
              className={`italic ${inputClass}`}
              dir={dir}
            />
            <Input
              value={block.author}
              onChange={(e) => onChange({ ...block, author: e.target.value })}
              placeholder="Author (optional)"
              className={inputClass}
              dir={dir}
            />
          </div>
        );

      case "list":
        return (
          <div className="space-y-3">
            <Select
              value={block.style}
              onValueChange={(value: "bullet" | "numbered") =>
                onChange({ ...block, style: value })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bullet">Bullet</SelectItem>
                <SelectItem value="numbered">Numbered</SelectItem>
              </SelectContent>
            </Select>
            <div className="space-y-2">
              {block.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-muted-foreground w-6 text-center">
                    {block.style === "bullet" ? "•" : `${index + 1}.`}
                  </span>
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...block.items];
                      newItems[index] = e.target.value;
                      onChange({ ...block, items: newItems });
                    }}
                    placeholder="List item..."
                    className={`flex-1 ${inputClass}`}
                    dir={dir}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newItems = block.items.filter((_, i) => i !== index);
                      onChange({ ...block, items: newItems.length ? newItems : [""] });
                    }}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange({ ...block, items: [...block.items, ""] })}
              >
                <Plus className="w-4 h-4 mr-1" /> Add item
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`border rounded-lg bg-card transition-all ${
        isDragging ? "opacity-50 border-primary" : ""
      }`}
    >
      {/* Block Header */}
      <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
        <div
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          draggable
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        
        <div className="flex items-center gap-2 text-sm font-medium">
          {blockTypeIcons[block.type]}
          {blockTypeLabels[block.type]}
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={isFirst}
            className="h-7 w-7"
          >
            ↑
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={isLast}
            className="h-7 w-7"
          >
            ↓
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-7 w-7 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Block Content */}
      <div className="p-4">{renderBlockContent()}</div>
    </div>
  );
}
