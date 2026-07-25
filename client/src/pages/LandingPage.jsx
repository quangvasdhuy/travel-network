import { Link } from 'react-router-dom';
import { Compass, Users, MapPin, Camera, TrendingUp, Globe } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Users,
      title: 'Connect with Travelers',
      description: 'Build your travel network and share experiences with fellow adventurers',
    },
    {
      icon: MapPin,
      title: 'Plan Amazing Trips',
      description: 'Create detailed itineraries and discover destinations worldwide',
    },
    {
      icon: Camera,
      title: 'Share Your Journey',
      description: 'Post photos, stories, and tips from your travels',
    },
    {
      icon: TrendingUp,
      title: 'Discover Trending Spots',
      description: 'Find popular destinations and hidden gems',
    },
    {
      icon: Globe,
      title: 'Explore the World',
      description: 'Browse curated destinations and travel inspiration',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-blue-800 text-white">
        <div className="container-custom py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Compass className="w-16 h-16" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Connect. Share. Explore.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Join the global travel community and discover your next adventure
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Your Travel Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              TravelNet provides all the tools to connect with travelers, plan trips, and share your adventures
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                10+
              </div>
              <div className="text-lg text-gray-600">
                Curated Destinations
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                ∞
              </div>
              <div className="text-lg text-gray-600">
                Travel Connections
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                24/7
              </div>
              <div className="text-lg text-gray-600">
                Share Anytime
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join TravelNet today and connect with travelers from around the world
          </p>
          <Link
            to="/register"
            className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg inline-block"
          >
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container-custom text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Compass className="w-6 h-6" />
            <span className="text-lg font-bold">TravelNet</span>
          </div>
          <p className="text-sm">
            © 2024 TravelNet. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
