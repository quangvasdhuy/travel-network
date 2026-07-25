const PostSkeleton = () => (
  <div className="card p-6 animate-pulse">
    {/* Header */}
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    </div>

    {/* Content */}
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>

    {/* Image placeholder */}
    <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>

    {/* Actions */}
    <div className="flex items-center space-x-6 pt-4 border-t">
      <div className="h-6 bg-gray-200 rounded w-16"></div>
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

const ProfileSkeleton = () => (
  <div className="card p-6 animate-pulse">
    {/* Cover Image */}
    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>

    {/* Profile Info */}
    <div className="flex items-start space-x-4 mb-6">
      <div className="w-24 h-24 bg-gray-200 rounded-full -mt-12"></div>
      <div className="flex-1 mt-4">
        <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    </div>

    {/* Bio */}
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-4 gap-4">
      <div className="h-16 bg-gray-200 rounded"></div>
      <div className="h-16 bg-gray-200 rounded"></div>
      <div className="h-16 bg-gray-200 rounded"></div>
      <div className="h-16 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const TripSkeleton = () => (
  <div className="card p-6 animate-pulse">
    {/* Title and Status */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="flex space-x-2">
        <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
        <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
      </div>
    </div>

    {/* Description */}
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-4/5"></div>
    </div>

    {/* Details */}
    <div className="space-y-3 mb-4">
      <div className="h-4 bg-gray-200 rounded w-56"></div>
      <div className="h-4 bg-gray-200 rounded w-40"></div>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </div>

    {/* Budget */}
    <div className="pt-4 border-t">
      <div className="h-4 bg-gray-200 rounded w-48"></div>
    </div>
  </div>
);

const UserCardSkeleton = () => (
  <div className="flex items-center space-x-3 animate-pulse">
    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-24"></div>
    </div>
    <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
  </div>
);

const StatsCardSkeleton = () => (
  <div className="card p-4 animate-pulse">
    <div className="flex items-center justify-between mb-2">
      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
    </div>
    <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
    <div className="h-3 bg-gray-200 rounded w-20"></div>
  </div>
);

const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="card overflow-hidden">
    {/* Header */}
    <div className="bg-gray-50 px-6 py-4 border-b">
      <div className="grid gap-4 animate-pulse" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {[...Array(columns)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>

    {/* Rows */}
    {[...Array(rows)].map((_, rowIndex) => (
      <div key={rowIndex} className="px-6 py-4 border-b last:border-b-0">
        <div className="grid gap-4 animate-pulse" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const FormSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i}>
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    ))}
    <div className="flex space-x-4">
      <div className="h-10 bg-gray-200 rounded w-32"></div>
      <div className="h-10 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

const LoadingSkeleton = {
  Post: PostSkeleton,
  Profile: ProfileSkeleton,
  Trip: TripSkeleton,
  UserCard: UserCardSkeleton,
  StatsCard: StatsCardSkeleton,
  Table: TableSkeleton,
  Form: FormSkeleton,
};

export default LoadingSkeleton;
