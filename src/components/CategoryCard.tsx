import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  image: string;
  slug: string;
}

const CategoryCard = ({ title, description, image, slug }: CategoryCardProps) => {
  return (
    <Link 
      to={`/categories/${slug}`}
      className="group relative overflow-hidden rounded-lg shadow-medium hover:shadow-strong transition-smooth"
    >
      <div className="aspect-[4/3] relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <h3 className="font-serif text-2xl font-bold text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-white/90 mb-3">
            {description}
          </p>
          <div className="flex items-center text-white font-medium text-sm group-hover:translate-x-1 transition-smooth">
            Explore <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;