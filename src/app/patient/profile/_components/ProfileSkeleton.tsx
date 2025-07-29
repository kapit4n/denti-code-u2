export default function ProfileSkeleton() {
  const SkeletonField = () => (
    <div>
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
    </div>
  );

  return (
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-7 bg-gray-300 rounded w-1/3"></div>
        <div className="h-10 bg-gray-300 rounded w-28"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        <SkeletonField />
        <SkeletonField />
        <SkeletonField />
        <SkeletonField />
        <SkeletonField />
        <SkeletonField />
        <div className="md:col-span-2">
          <SkeletonField />
        </div>
        <div className="md:col-span-2">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}
