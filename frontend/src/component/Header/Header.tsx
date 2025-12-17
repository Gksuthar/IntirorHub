import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Building2,
  Home,
  CreditCard,
  FileText,
  TrendingUp,
  Rss,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Settings,
  User,
  Bell,
  Search,
  Sparkles,
  UserPlus,
} from "lucide-react";

const Header: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/payments", icon: CreditCard, label: "Payments" },
    { path: "/boq", icon: FileText, label: "BOQ" },
    { path: "/expenses", icon: TrendingUp, label: "Expenses" },
    { path: "/feed", icon: Rss, label: "Feed" },
    { path: "/invite", icon: UserPlus, label: "Invite" },
  ];

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
            {navLinks.map((link) => {
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

            {/* Project Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                className="flex items-center gap-3 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      3BHK – Shilp Residency
                    </div>
                    <div className="text-xs text-gray-500">Ahmedabad</div>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProjectDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Projects</p>
                  </div>
                  <a
                    href="#"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all no-underline"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center">
                      <span className="text-white font-bold">3B</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">3BHK – Shilp Residency</p>
                      <p className="text-xs text-gray-500">Ahmedabad • Active</p>
                    </div>
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all no-underline"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center">
                      <span className="text-white font-bold">2B</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">2BHK – Green Valley</p>
                      <p className="text-xs text-gray-500">Surat • Completed</p>
                    </div>
                  </a>
                  <hr className="my-2 border-gray-100" />
                  <a
                    href="#"
                    className="flex items-center gap-3 px-4 py-3 text-gray-900 hover:bg-gray-50 transition-all no-underline"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-900 text-xl">+</span>
                    </div>
                    <span className="font-semibold">Create New Project</span>
                  </a>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="relative group"
              >
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dev"
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
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dev"
                        alt="User"
                        className="h-12 w-12 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">John Doe</p>
                        <p className="text-xs text-gray-500">john@sitezero.com</p>
                        <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-semibold bg-[#1a1a1a] text-white">
                          Admin
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <a
                      href="#"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-all no-underline"
                    >
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">My Profile</span>
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-all no-underline"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="text-sm font-medium">Settings</span>
                    </a>
                  </div>
                  <hr className="my-2 border-gray-100" />
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-all no-underline"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </Link>
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
            {navLinks.map((link) => {
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
          
          {/* Mobile Project Selector */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-semibold text-gray-900">3BHK – Shilp Residency</div>
                <div className="text-xs text-gray-500">Ahmedabad</div>
              </div>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
