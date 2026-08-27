import { Link } from 'react-router-dom';
import { Compass, Users, MapPin, Camera, TrendingUp, Globe, ChevronDown, Plane, Heart, MessageCircle } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Users,
      title: 'Kết nối với người mê xê dịch',
      description: 'Xây dựng mạng lưới bạn đồng hành và chia sẻ trải nghiệm cùng nhau',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: MapPin,
      title: 'Lên kế hoạch cho chuyến đi',
      description: 'Tạo lịch trình chi tiết và khám phá điểm đến khắp thế giới',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Camera,
      title: 'Chia sẻ hành trình',
      description: 'Đăng ảnh, câu chuyện và mẹo hay từ những chuyến đi của bạn',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: TrendingUp,
      title: 'Khám phá điểm đến hot',
      description: 'Tìm những nơi đang được yêu thích và cả những viên ngọc ẩn',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: Globe,
      title: 'Khám phá thế giới',
      description: 'Duyệt các điểm đến chọn lọc và tìm cảm hứng du lịch',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: Heart,
      title: 'Tương tác & truyền cảm hứng',
      description: 'Thích, bình luận và lấy cảm hứng từ những câu chuyện du lịch tuyệt vời',
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
            alt="Ảnh nền du lịch"
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
              Câu chuyện du lịch của bạn
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 text-transparent bg-clip-text">
                Bắt đầu từ đây
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-2xl mx-auto">
              Kết nối với những người mê du lịch trên khắp thế giới. Chia sẻ hành trình của bạn.
              Và tìm ra điểm đến tiếp theo.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/register"
                className="group btn bg-white text-primary-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                Bắt đầu hành trình
                <Plane className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="btn border-2 border-white/80 backdrop-blur-sm bg-white/10 text-white hover:bg-white/20 px-10 py-4 text-lg font-semibold shadow-xl transition-all"
              >
                Đăng nhập
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="backdrop-blur-sm bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">1000+</div>
                <div className="text-sm text-gray-200">Thành viên</div>
              </div>
              <div className="backdrop-blur-sm bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">50+</div>
                <div className="text-sm text-gray-200">Điểm đến</div>
              </div>
              <div className="backdrop-blur-sm bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">500+</div>
                <div className="text-sm text-gray-200">Câu chuyện</div>
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
              Tất cả những gì bạn cần
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Đầy đủ công cụ để kết nối, lên kế hoạch và chia sẻ hành trình của bạn
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
              Bắt đầu chỉ với 3 bước
            </h2>
            <p className="text-xl text-gray-600">
              Tham gia cộng đồng chỉ trong vài phút
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Tạo tài khoản</h3>
              <p className="text-gray-600">Đăng ký miễn phí trong vài giây và thiết lập hồ sơ của bạn</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Kết nối & chia sẻ</h3>
              <p className="text-gray-600">Theo dõi mọi người, chia sẻ chuyến đi và đăng ảnh du lịch của bạn</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Tìm kiếm & khám phá</h3>
              <p className="text-gray-600">Tìm cảm hứng, lên kế hoạch cho chuyến đi kế tiếp và khám phá thế giới</p>
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
            alt="Ảnh kêu gọi hành động"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 to-blue-900/95"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container-custom text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Sẵn sàng cho chuyến phiêu lưu của bạn?
          </h2>
          <p className="text-xl mb-10 text-gray-100 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn người đang chia sẻ câu chuyện và khám phá những điểm đến mới
          </p>
          <Link
            to="/register"
            className="inline-block btn bg-white text-primary-600 hover:bg-gray-100 px-12 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
          >
            Tạo tài khoản miễn phí
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
                Cộng đồng du lịch toàn cầu để chia sẻ hành trình và khám phá những điểm đến mới.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-primary-400 transition-colors">Bắt đầu</Link></li>
                <li><Link to="/trips" className="hover:text-primary-400 transition-colors">Xem chuyến đi</Link></li>
                <li><Link to="/search" className="hover:text-primary-400 transition-colors">Tìm bạn đồng hành</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Công ty</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Tuyển dụng</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Chính sách bảo mật</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Điều khoản sử dụng</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2024 TravelNet. Bảo lưu mọi quyền. Được tạo với ❤️ dành cho những người yêu du lịch.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
