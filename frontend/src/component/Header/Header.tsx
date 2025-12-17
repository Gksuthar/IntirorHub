import React, { useState, useEffect, useMemo } from "react";
import SiteSidebar from "../SiteSidebar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  Home,
  CreditCard,
  FileText,
  TrendingUp,
  Rss,
  Menu,
  X,
  LogOut,
  User,
  Bell,
  Search,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSite } from "../../context/SiteContext";

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Removed unused isProjectDropdownOpen
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSiteSidebarOpen, setIsSiteSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { sites, activeSite, setActiveSite, openCreateSite } = useSite();
  const isAdmin = user?.role === "ADMIN";

  const navLinks = useMemo(
    () => [
      { path: "/", icon: Home, label: "Home", adminOnly: false },
      { path: "/payments", icon: CreditCard, label: "Payments", adminOnly: false },
      { path: "/boq", icon: FileText, label: "BOQ", adminOnly: false },
      { path: "/expenses", icon: TrendingUp, label: "Expenses", adminOnly: false },
      { path: "/feed", icon: Rss, label: "Feed", adminOnly: false },
      { path: "/invite", icon: UserPlus, label: "Invite", adminOnly: true },
    ],
    []
  );

  const visibleNavLinks = useMemo(
    () => navLinks.filter((link) => !link.adminOnly || isAdmin),
    [isAdmin, navLinks]
  );

  // Removed unused companyLabel
  const displayName = user?.name?.trim() || user?.email?.split("@")?.[0] || "Member";
  const displayEmail = user?.email || "";
  const roleLabel = user?.role
    ? `${user.role.charAt(0)}${user.role.slice(1).toLowerCase()}`
    : "Member";
  const avatarSeed = useMemo(() => encodeURIComponent(displayEmail || displayName || "User"), [displayEmail, displayName]);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    // Removed setIsProjectDropdownOpen(false)
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-gray-200/50" 
          : "bg-white/60 backdrop-blur-lg"
      }`}
    >
      <div className="px-4 md:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <div className="relative">
              <div className="relative bg-[#1a1a1a] p-2.5 rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#1a1a1a] tracking-tight">
                SiteZero
              </span>
              <span className="text-[10px] text-gray-400 font-medium -mt-1">
                Interior Management
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2 bg-gray-100/80 rounded-2xl p-1.5">
            {visibleNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link no-underline ${
                    isActive(link.path) ? "nav-link-active" : "nav-link-inactive"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search Button */}
            <button className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300">
              <Search className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Search...</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded-lg text-[10px] text-gray-400 font-mono shadow-sm">
                ⌘K
              </kbd>
            </button>

            {/* Notifications */}
            <button className="relative p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* Project Dropdown removed as per request */}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="relative group"
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                  alt="User"
                  className="relative h-11 w-11 rounded-full border-2 border-white shadow-lg object-cover"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                        alt="User"
                        className="h-12 w-12 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{displayName}</p>
                        {displayEmail && <p className="text-xs text-gray-500">{displayEmail}</p>}
                        <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-semibold bg-[#1a1a1a] text-white">
                          {roleLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <button
                      type="button"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">My Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        navigate('/manage-sites');
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm font-medium">Manage Sites</span>
                    </button>
                    {isAdmin && (
                      <Link
                        to="/invite"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-all no-underline"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span className="text-sm font-medium">Invite teammates</span>
                      </Link>
                    )}
                  </div>
                  <hr className="my-2 border-gray-100" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button - Hidden since we use bottom nav */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hidden p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-4">
          <nav className="flex flex-col gap-2">
            {visibleNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`nav-link no-underline ${
                    isActive(link.path) ? "nav-link-active" : "nav-link-inactive"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Site Management Sidebar */}
      <SiteSidebar
        isOpen={isSiteSidebarOpen}
        onClose={() => setIsSiteSidebarOpen(false)}
        sites={sites}
        activeSiteId={activeSite?.id}
        onSwitchSite={(siteId) => setActiveSite(siteId)}
        onCreateSite={() => {
          setIsSiteSidebarOpen(false);
          openCreateSite();
        }}
      />
    </header>
  );
};

export default Header;
