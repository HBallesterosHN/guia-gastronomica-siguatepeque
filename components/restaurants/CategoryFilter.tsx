import Link from "next/link";
import { RESTAURANT_CATEGORIES, type RestaurantCategory } from "@/types/restaurant";
import { categoryLabels } from "@/lib/category";

interface CategoryFilterProps {
  selected?: RestaurantCategory;
}

export function CategoryFilter({ selected }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/restaurantes"
        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
          !selected
            ? "bg-emerald-600 text-white"
            : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-100"
        }`}
      >
        Todos
      </Link>
      {RESTAURANT_CATEGORIES.map((category) => (
        <Link
          key={category}
          href={`/restaurantes?categoria=${category}`}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            selected === category
              ? "bg-emerald-600 text-white"
              : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-100"
          }`}
        >
          {categoryLabels[category]}
        </Link>
      ))}
    </div>
  );
}
