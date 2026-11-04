import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiUser, FiLogIn, FiUserPlus } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  // Don't show the marketing header on pages that use DashboardLayout - they
  // already have their own sidebar / mobile navigation.
  const dashboardPages = [
    "/dashboard",
    "/send-money",
    "/transactions",
    "/all-transactions",
    "/profile",
    "/settings",
    "/fraud-detection",
  ];

  if (dashboardPages.some((path) => location.pathname.startsWith(path))) {
    return null;
  }

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Digital Wallet
        </Link>
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600">
            Home
          </Link>
          <Link to="#features" className="text-gray-700 hover:text-blue-600">
            Features
          </Link>
          <Link to="#pricing" className="text-gray-700 hover:text-blue-600">
            Pricing
          </Link>
          <Link to="#contact" className="text-gray-700 hover:text-blue-600">
            Contact
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </Link>
              <div className="relative group">
                <button className="flex items-center text-gray-700 hover:text-blue-600">
                  <FiUser className="mr-1" />
                  {user?.username}
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="text-gray-700 hover:text-blue-600 flex items-center"
              >
                <FiLogIn className="mr-1" />
                Login
              </Link>
              <Link to="/auth/signup">
                <Button size="sm" className="flex items-center">
                  <FiUserPlus className="mr-1" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 focus:outline-none"
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <nav className="px-4 py-2 space-y-2">
            <Link
              to="/"
              className="block text-gray-700 hover:text-blue-600"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="#features"
              className="block text-gray-700 hover:text-blue-600"
              onClick={() => setMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="#pricing"
              className="block text-gray-700 hover:text-blue-600"
              onClick={() => setMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="#contact"
              className="block text-gray-700 hover:text-blue-600"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block text-gray-700 hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="block text-gray-700 hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-blue-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="block text-gray-700 hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/auth/signup"
                  className="block text-gray-700 hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
