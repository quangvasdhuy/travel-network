import { Link } from 'react-router-dom';
import { Compass, Users, MapPin, Camera, TrendingUp, Globe, ChevronDown, Plane, Heart, MessageCircle } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Users,
      title: 'Connect with Travelers',
      description: 'Build your travel network and share experiences with fellow adventurers',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: MapPin,
      title: 'Plan Amazing Trips',
      description: 'Create detailed itineraries and discover destinations worldwide',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Camera,
      title: 'Share Your Journey',
      description: 'Post photos, stories, and tips from your travels',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: TrendingUp,
      title: 'Discover Trending Spots',
      description: 'Find popular destinations and hidden gems',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: Globe,
      title: 'Explore the World',
      description: 'Browse curated destinations and travel inspiration',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: Heart,
      title: 'Engage & Inspire',
      description: 'Like, comment, and get inspired by amazing travel stories',
      color: 'from-red-500 to-red-600',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Screen with Background */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2000&auto=format&fit=crop"
            alt="Travel Background"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-primary-800/85 to-blue-900/90"></div>
          {/* Animated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-transparent to-pink-600/20 animate-pulse"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container-custom py-20 px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* Animated Icon */}
            <div className="flex items-center justify-center mb-8 animate-bounce">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-full">
                <Plane className="w-16 h-16" />
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Travel Story
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 text-transparent bg-clip-text">
                Starts Here
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-2xl mx-auto">
              Connect with travelers worldwide. Share your adventures. 
              Discover your next destination.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/register"
                className="group btn bg-white text-primary-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                Start Your Journey
                <Plane className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="btn border-2 border-white/80 backdrop-blur-sm bg-white/10 text-white hover:bg-white/20 px-10 py-4 text-lg font-semibold shadow-xl transition-all"
              >
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="backdrop-blur-sm bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">1000+</div>
                <div className="text-sm text-gray-200">Travelers</div>
              </div>
              <div className="backdrop-blur-sm bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">50+</div>
                <div className="text-sm text-gray-200">Destinations</div>
              </div>
              <div className="backdrop-blur-sm bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">500+</div>
                <div className="text-sm text-gray-200">Stories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/70" />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              All the tools to connect, plan, and share your travel adventures
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group card p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-transparent hover:border-primary-500"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Start in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              Join the community in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Account</h3>
              <p className="text-gray-600">Sign up for free in seconds and set up your traveler profile</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Connect & Share</h3>
              <p className="text-gray-600">Follow travelers, share your trips, and post your travel photos</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Discover & Explore</h3>
              <p className="text-gray-600">Find inspiration, plan your next trip, and explore the world</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop"
            alt="Travel CTA"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 to-blue-900/95"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container-custom text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl mb-10 text-gray-100 max-w-2xl mx-auto">
            Join thousands of travelers sharing their stories and discovering new destinations
          </p>
          <Link
            to="/register"
            className="inline-block btn bg-white text-primary-600 hover:bg-gray-100 px-12 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
          >
            Create Free Account
            <Plane className="inline-block ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Plane className="w-6 h-6 text-primary-400" />
                <span className="text-xl font-bold text-white">TravelNet</span>
              </div>
              <p className="text-sm text-gray-400">
                Your global travel community for sharing adventures and discovering new destinations.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-primary-400 transition-colors">Get Started</Link></li>
                <li><Link to="/trips" className="hover:text-primary-400 transition-colors">Browse Trips</Link></li>
                <li><Link to="/search" className="hover:text-primary-400 transition-colors">Find Travelers</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Careers</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2024 TravelNet. All rights reserved. Made with ❤️ for travelers worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
