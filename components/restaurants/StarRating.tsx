interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  className?: string;
}

export function StarRating({ rating, reviewCount, className }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="flex items-center text-amber-500">
        {Array.from({ length: 5 }).map((_, index) => {
          if (index < fullStars) {
            return <span key={index}>★</span>;
          }

          if (index === fullStars && hasHalfStar) {
            return <span key={index}>☆</span>;
          }

          return (
            <span key={index} className="text-amber-200">
              ★
            </span>
          );
        })}
      </div>
      <p className="text-sm text-zinc-600">
        {rating.toFixed(1)}
        {typeof reviewCount === "number" && reviewCount > 0
          ? ` · ${reviewCount.toLocaleString("es-HN")} valoraciones públicas`
          : ""}
      </p>
    </div>
  );
}
