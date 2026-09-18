import { StarRating } from '@/components/StarRating';

type ReviewWithUser = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: { name: string };
};

export function ReviewList({ reviews }: { reviews: ReviewWithUser[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-vivo-black/50">No reviews yet — be the first to share your thoughts.</p>;
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li key={review.id} className="card p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-vivo-black">{review.user.name}</span>
            <StarRating rating={review.rating} size="sm" />
          </div>
          <p className="mt-2 text-sm text-vivo-black/70">{review.comment}</p>
          <p className="mt-2 text-xs text-vivo-black/40">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
