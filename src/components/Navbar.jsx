import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FaFilm, FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-20 bg-black/20 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <FaFilm className="text-accent text-2xl" />
          <span className="font-bold text-xl">CineBook</span>
        </Link>

        <div className="flex items-center gap-4">
          {user && user.role === "admin" && (
            <Link
              to="/admin"
              className="text-sm font-semibold text-accent hover:text-yellow-300 transition"
            >
              Admin
            </Link>
          )}

          {user && (
            <Link
              to="/my-bookings"
              className="text-sm font-semibold hover:text-accent transition"
            >
              My Bookings
            </Link>
          )}

          {!user && (
            <>
              <Link to="/login" className="btn-outline text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Register
              </Link>
            </>
          )}

          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                <FaUserCircle className="text-accent" />
                <span>{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-outline text-xs sm:text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
