export type RatingRefreshRowStatus = "updated" | "skipped" | "error";

export type RatingRefreshRowResult = {
  name: string;
  slug: string;
  previousRating: number;
  previousReviews: number;
  newRating: number | null;
  newReviews: number | null;
  status: RatingRefreshRowStatus;
  reason?: string;
};

export type RatingRefreshSummary = {
  total: number;
  updated: number;
  skipped: number;
  errors: number;
  rows: RatingRefreshRowResult[];
};
