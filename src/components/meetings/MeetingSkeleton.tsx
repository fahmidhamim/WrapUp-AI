import { Skeleton } from "@/components/ui/skeleton";

export function MeetingSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="glass rounded-xl divide-y divide-border/40 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 min-h-[64px]">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/5" />
          </div>
          <Skeleton className="hidden md:block h-5 w-16 rounded-full" />
          <Skeleton className="hidden lg:block h-5 w-20 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}
