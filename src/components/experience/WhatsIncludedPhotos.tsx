interface WhatsIncludedPhotosProps {
  includes?: string[] | null;
}

const WhatsIncludedPhotos = ({ includes }: WhatsIncludedPhotosProps) => {
  if (!includes || includes.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="font-sans text-3xl font-bold">What's included</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {includes.map((item, index) => (
          <div key={index} className="group space-y-3">
            <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden">
              <img 
                src={`https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&sig=${index}`} 
                alt={item} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Included
              </div>
              <p className="text-sm font-medium leading-tight">{item}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhatsIncludedPhotos;
