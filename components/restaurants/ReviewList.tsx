import type { RestaurantReview } from "@/types/restaurant";
import { StarRating } from "@/components/restaurants/StarRating";

interface ReviewListProps {
  reviews: RestaurantReview[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <article key={review.id} className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-zinc-900">{review.author}</p>
              <p className="text-xs text-zinc-500">{review.date}</p>
            </div>
            <StarRating rating={review.rating} />
          </div>
          <p className="text-sm text-zinc-700">{review.comment}</p>
        </article>
      ))}
    </div>
  );
}
