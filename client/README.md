# TravelNet - Frontend

Modern React frontend for the Tourist Social Network platform.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **date-fns** - Date formatting

## Features

### ✅ Implemented (Task 12)

- React app with Vite
- React Router setup with protected routes
- Authentication UI (Login/Register)
- Authentication context with JWT
- API service layer with interceptors
- Responsive navigation
- Loading states
- Toast notifications
- Landing page
- Dashboard with feed
- Profile pages
- Search interface
- Explore page
- 404 page

### 📋 Structure

```
client/
├── public/
├── src/
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── LoadingSpinner.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── EditProfilePage.jsx
│   │   ├── ExplorePage.jsx
│   │   ├── SearchPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on port 3000

### Installation

1. Install dependencies:
```powershell
cd client
npm install
```

2. Create environment file:
```powershell
Copy-Item .env.example .env
```

3. Update `.env` if needed:
```
VITE_API_URL=http://localhost:3000
```

### Development

Start the development server:
```powershell
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```powershell
npm run build
```

Preview production build:
```powershell
npm run preview
```

## Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (requires authentication)
- `/dashboard` - User dashboard with feed
- `/profile/:username` - User profile
- `/profile/edit` - Edit own profile
- `/explore` - Discover trending destinations and popular posts
- `/search` - Search users, destinations, and posts
- `/404` - Not found page

## API Integration

The app uses Axios with interceptors for:
- Automatic JWT token attachment
- Token refresh on 401 errors
- Request/response logging

### API Services

All API calls are organized in `src/services/api.js`:

- **authAPI** - Authentication endpoints
- **userAPI** - User management
- **connectionAPI** - Social connections
- **destinationAPI** - Destinations
- **tripAPI** - Trip planning
- **postAPI** - Posts and interactions
- **searchAPI** - Search functionality
- **discoveryAPI** - Discovery and recommendations

## Authentication Flow

1. User logs in or registers
2. Backend returns `accessToken` and `refreshToken`
3. Tokens stored in localStorage
4. `accessToken` added to all requests via interceptor
5. On 401 error, automatically refresh token
6. If refresh fails, redirect to login

## Styling

Uses Tailwind CSS with custom components:

- `.btn` - Base button styles
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary button
- `.btn-outline` - Outlined button
- `.input` - Form input
- `.card` - Card container
- `.container-custom` - Content container

## State Management

- **AuthContext** - Global authentication state
- Component state with useState
- No additional state management library (Zustand installed but not yet used)

## Next Steps (Tasks 13-16)

### Task 13: Profile & Dashboard UI
- [ ] Enhanced profile pages with stats
- [ ] Profile editing with photo upload
- [ ] User statistics display
- [ ] Followers/following lists

### Task 14: Trip Planning Interface
- [ ] Trip creation wizard
- [ ] Trip list view
- [ ] Trip detail pages
- [ ] Destination selection

### Task 15: Social Feed & Discovery
- [ ] Post creation with media
- [ ] Enhanced feed with infinite scroll
- [ ] Like/comment interactions
- [ ] Discovery algorithms UI

### Task 16: Polish & Responsive Design
- [ ] Mobile optimization
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Accessibility improvements
- [ ] Performance optimization

## Development Guidelines

### Component Structure
```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const MyComponent = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Effects, handlers, etc.

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="container-custom py-8">
      {/* Component content */}
    </div>
  );
};

export default MyComponent;
```

### API Calls
```jsx
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const handleAction = async () => {
  try {
    const response = await userAPI.someMethod(data);
    toast.success('Success!');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error occurred');
  }
};
```

## Known Issues

- None yet

## License

MIT
