import { Sparkles } from 'lucide-react';

export default function EmptyBrandState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Sparkles className="w-10 h-10 text-(--color-text-muted) mb-3" />
      <p className="text-(--color-text-secondary) font-medium">
        No brand data available
      </p>
      <p className="text-(--color-text-tertiary) text-sm mt-1">
        Generate a startup concept to view brand identity
      </p>
    </div>
  );
}
