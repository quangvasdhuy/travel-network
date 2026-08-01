import { Link } from 'react-router-dom';
import { User, MapPin } from 'lucide-react';
import { getProfilePhotoUrl } from '../utils/imageUtils';

const UserCard = ({ user, showFollowButton = false, onFollowToggle, isFollowing = false }) => {
  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <Link to={`/profile/${user.username}`} className="flex items-center space-x-3 flex-1">
          {user.profile?.profilePhoto ? (
            <img
              src={getProfilePhotoUrl(user.profile.profilePhoto)}
              alt={user.username}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-primary-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {user.profile?.firstName} {user.profile?.lastName}
            </p>
            <p className="text-sm text-gray-600 truncate">@{user.username}</p>
            {user.profile?.location && (
              <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">
                  {user.profile.location.city}, {user.profile.location.country}
                </span>
              </div>
            )}
          </div>
        </Link>
        
        {showFollowButton && onFollowToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onFollowToggle(user.id);
            }}
            className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'} text-sm px-4 py-1`}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>
      
      {user.profile?.bio && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
          {user.profile.bio}
        </p>
      )}
      
      {user.stats && (
        <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
          <span>{user.stats.postCount || 0} posts</span>
          <span>{user.stats.followerCount || 0} followers</span>
        </div>
      )}
    </div>
  );
};

export default UserCard;
