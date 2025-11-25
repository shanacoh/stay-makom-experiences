interface Include {
  id: string;
  title: string;
  description?: string | null;
  icon_url?: string | null;
}

interface WhatsIncludedPhotosProps {
  includes?: Include[] | null;
}

const WhatsIncludedPhotos = ({ includes }: WhatsIncludedPhotosProps) => {
  // Create placeholder items if fewer than 2
  const displayItems = [...(includes || [])];
  while (displayItems.length < 2) {
    displayItems.push({
      id: `placeholder-${displayItems.length}`,
      title: 'Included',
      description: 'To be determined',
      icon_url: null,
    });
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold">What's included</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {displayItems.map((item) => {
          const isPlaceholder = item.id.startsWith('placeholder');
          return (
            <div key={item.id} className={`group space-y-2 sm:space-y-3 ${isPlaceholder ? 'opacity-50' : ''}`}>
              <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                <img 
                  src={item.icon_url || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&sig=${item.id}`} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                />
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <div className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Included
                </div>
                <p className="text-xs sm:text-sm font-medium leading-tight">{item.title}</p>
                {item.description && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WhatsIncludedPhotos;
