
import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/auth/me`, { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/logout`, {
        withCredentials: true
      });
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    {name: 'Campaigns', path: '/campaigns'},
    { name: 'Create Campaign', path: '/create-campaign' },
    { name: 'Referrals', path: '/my-referrals' },
    { name: 'Customers', path: '/customers' },
    { name: 'Analytics', path: '/analytics' },
    // { name: 'Add Customers', path: '/upload-crm' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Toggle button for small screens */}
      <div className="md:hidden p-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-indigo-600 focus:outline-none"
        >
          ☰
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 sm:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white border-r shadow-lg z-40 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:block`}
      >
        <div className="flex flex-col justify-between h-full px-5 py-6">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600 mb-6">Referly</h1>

            {user ? (
              <div className="mb-6">
                <p className="text-sm text-gray-600">Logged in as {user.name}</p>
                <p className="font-medium text-gray-900 truncate">{user.email}</p>
                <p className="text-green-500 text-sm mt-1">✅ Logged in</p>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">You're not logged in</p>
                <a
                  href={`${process.env.REACT_APP_BACKEND_URL}/auth/google`}
                  className="inline-block bg-indigo-600 text-white text-sm px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Login with Google
                </a>
              </div>
            )}

            <nav className="space-y-2">
              {navLinks.map(({ name, path }) => (
                <Link
                  key={path}
                  to={path}
                  className={`block px-3 py-2 rounded text-sm font-medium transition ${
                    isActive(path)
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsOpen(false)} // close sidebar on mobile
                >
                  {name}
                </Link>
              ))}
            </nav>
          </div>

          {user && (
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700 px-3 py-2 rounded hover:bg-red-50 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;