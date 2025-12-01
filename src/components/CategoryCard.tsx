import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage, getLocalizedField } from "@/hooks/useLanguage";

interface CategoryCardProps {
  category: {
    name: string;
    name_he: string | null;
    intro_rich_text: string | null;
    intro_rich_text_he: string | null;
    hero_image: string | null;
    slug: string;
  };
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const { lang } = useLanguage();
  const title = getLocalizedField(category, 'name', lang) as string;
  const image = category.hero_image || '';
  
  return (
    <Link 
      to={`/category/${category.slug}?lang=${lang}`}
      className="group relative overflow-hidden rounded-xl shadow-soft hover:shadow-strong transition-smooth"
    >
      <div className="aspect-square relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-smooth" />
        
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <h3 className="font-sans text-2xl md:text-3xl font-bold text-white text-center uppercase tracking-tight flex flex-col">
            {title.split(' ').map((word, index) => (
              <span key={index}>{word}</span>
            ))}
          </h3>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;