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
      className="group relative overflow-hidden rounded-xl shadow-soft hover:shadow-strong transition-smooth"
    >
      <div className="aspect-[5/2] relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-smooth" />
        
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <h3 className="font-sans text-2xl md:text-3xl font-bold text-white text-center uppercase tracking-tight">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;