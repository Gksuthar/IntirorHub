import Header from "../component/Header/Header";
import { Outlet } from "react-router-dom";
import { Home, CreditCard, FileText, TrendingUp, Rss, Plus } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MainLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const navLinks = [
        { path: "/", icon: Home, label: "Home" },
        { path: "/home/payments", icon: CreditCard, label: "Payments" },
        { path: "/home/boq", icon: FileText, label: "BOQ" },
        { path: "/home/expenses", icon: TrendingUp, label: "Expenses" },
        { path: "/home/feed", icon: Rss, label: "Feed" },
    ];

    const isActive = (path: string) => {
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <Header />
            <Outlet />
                        {/* Global floating add button (navigates to current section add modal) */}
                        {user && (
                            <button
                                onClick={() => {
                                    const p = location.pathname;
                                    if (p.startsWith('/home/payments')) {
                                        // if already on payments page, trigger in-page open
                                        window.dispatchEvent(new CustomEvent('open-add-payment'));
                                    } else if (p.startsWith('/home/expenses')) {
                                        // if already on expenses page, trigger in-page open
                                        window.dispatchEvent(new CustomEvent('open-add-expense'));
                                    } else {
                                        // navigate to expenses page with param for direct open
                                        navigate('/home/expenses?openAdd=1');
                                    }
                                }}
                                title="Add"
                                className={"fixed bottom-24 right-5 z-50 p-4 bg-gray-800 hover:bg-border border-white text-white rounded-full shadow-xl transition active:scale-95"}
                            >
                                <Plus className="h-6 w-6" />
                            </button>
                        )}
            
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