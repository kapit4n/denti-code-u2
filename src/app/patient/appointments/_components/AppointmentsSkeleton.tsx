export default function AppointmentsSkeleton() {
  const SkeletonCard = () => (
    <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="text-right">
          <div className="h-5 bg-gray-300 rounded w-40 mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-7 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
      <div>
        <div className="h-7 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
