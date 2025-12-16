import Header from "../component/Header/Header";
import { Outlet } from "react-router-dom";
import { Home, CreditCard, FileText, TrendingUp, Rss } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const MainLayout = () => {
    const location = useLocation();
    
    const navLinks = [
        { path: "/", icon: Home, label: "Home" },
        { path: "/payments", icon: CreditCard, label: "Payments" },
        { path: "/boq", icon: FileText, label: "BOQ" },
        { path: "/expenses", icon: TrendingUp, label: "Expenses" },
        { path: "/feed", icon: Rss, label: "Feed" },
    ];

    const isActive = (path: string) => {
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <Header />
            <Outlet />
            
            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
                <div className="flex items-center justify-around max-w-md mx-auto">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all no-underline ${
                                    isActive(link.path)
                                        ? "text-gray-900"
                                        : "text-gray-400"
                                }`}
                            >
                                <Icon className={`h-6 w-6 ${isActive(link.path) ? "text-gray-900" : "text-gray-400"}`} />
                                <span className="text-xs font-medium">{link.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
};

export default MainLayout;