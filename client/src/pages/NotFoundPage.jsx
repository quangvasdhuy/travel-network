import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <Compass className="w-24 h-24 text-primary-600 mx-auto mb-6 animate-spin" style={{ animationDuration: '3s' }} />
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Lạc đường rồi sao?
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Trang bạn tìm không tồn tại. Hãy quay lại hành trình của mình nhé.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard"
            className="btn btn-primary flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Về bảng tin</span>
          </Link>
          <Link
            to="/"
            className="btn btn-outline flex items-center justify-center space-x-2"
          >
            <Compass className="w-5 h-5" />
            <span>Về trang giới thiệu</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
