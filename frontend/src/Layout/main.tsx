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

    const isHomePage = location.pathname === '/' || location.pathname === '/home';
    const isAdmin = (user?.role ?? '').toString().toUpperCase() === 'ADMIN';
    const isClient = (user?.role ?? '').toString().toUpperCase() === 'CLIENT';
    const paymentDueActive = Boolean(user && !(isAdmin) && (user as any).companyPaymentDue);

    const showToast = (message: string) => {
        try {
            const containerId = 'site-zero-toast-container';
            let container = document.getElementById(containerId);
            if (!container) {
                container = document.createElement('div');
                container.id = containerId;
                container.style.position = 'fixed';
                container.style.right = '16px';
                container.style.bottom = '80px';
                container.style.zIndex = '9999';
                document.body.appendChild(container);
            }
            const toast = document.createElement('div');
            toast.textContent = message;
            toast.style.background = '#111827';
            toast.style.color = 'white';
            toast.style.padding = '8px 12px';
            toast.style.borderRadius = '8px';
            toast.style.marginTop = '8px';
            toast.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 200ms ease, transform 200ms ease';
            container.appendChild(toast);
            requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; });
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => { try { container?.removeChild(toast); } catch (e) {} }, 200); }, 3000);
        } catch (e) {
            try { alert(message); } catch (_) {}
        }
    };

    return (
        <>
            <Header />
            <div className="pb-32">
                <div className={paymentDueActive ? 'pointer-events-none select-none filter blur-sm' : ''}>
                    <Outlet />
                </div>
                {/* Global payment-due modal for logged-in users */}
                {paymentDueActive && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4 text-center">
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">Payment Required</h3>
                            <p className="text-sm text-slate-600 mb-4">Your payment is due. Please contact the administrator.</p>
                            <div className="flex gap-2 justify-center">
                                <button onClick={() => { try { navigator?.clipboard?.writeText('contact@company.com'); } catch(e){} }} className="px-4 py-2 bg-blue-600 text-white rounded">Contact Admin</button>
                                <button onClick={() => { try { const nav = window.location; window.location.href = nav.origin; } catch(e){} }} className="px-4 py-2 bg-gray-100 rounded">Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
                        {user && !isHomePage && !isClient && (
                            <button
                                onClick={() => {
                                    const p = location.pathname;
                                    if (p.startsWith('/home/payments')) {
                                        if (isAdmin) navigate('/home/payments?openAdd=1');
                                        else showToast('Only admins can add payments');
                                    } else if (p.startsWith('/home/expenses')) {
                                        navigate('/home/expenses?openAdd=1');
                                    } else navigate('/home/expenses?openAdd=1');
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