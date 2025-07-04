import { Home, Search, Plus, Package, User } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Link, useLocation } from "wouter";

export default function MobileNav() {
  const { t } = useTranslation();
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: t('nav.home') },
    { href: "/tailors", icon: Search, label: t('nav.find') },
    { href: "/booking", icon: Plus, label: t('nav.book') },
    { href: "/orders", icon: Package, label: t('nav.orders') },
    { href: "/profile", icon: User, label: t('nav.profile') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
      <div className="grid grid-cols-5 h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = location === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive 
                  ? 'text-emerald-600' 
                  : 'text-gray-500 hover:text-emerald-600'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
