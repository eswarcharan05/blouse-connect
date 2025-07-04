import { Bell, Slice, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "@/components/language-switcher";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Header() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  return (
    <header className="bg-white shadow-sm border-b-2 border-golden-400 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-royal-600 rounded-lg flex items-center justify-center">
              <Slice className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-800 font-serif">
              {t('app.name')}
            </h1>
          </Link>
          
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-emerald-600 transition-colors">
              {t('nav.home')}
            </Link>
            <Link href="/tailors" className="text-gray-700 hover:text-emerald-600 transition-colors">
              {t('nav.find')}
            </Link>
            <Link href="/booking" className="text-gray-700 hover:text-emerald-600 transition-colors">
              {t('nav.book')}
            </Link>
            <Link href="/orders" className="text-gray-700 hover:text-emerald-600 transition-colors">
              {t('nav.orders')}
            </Link>
            <Link href="/learning" className="text-gray-700 hover:text-emerald-600 transition-colors">
              {t('nav.learning')}
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </div>
            
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profileImageUrl || ''} />
              <AvatarFallback className="bg-gradient-to-br from-golden-400 to-emerald-600 text-white">
                <User size={16} />
              </AvatarFallback>
            </Avatar>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/api/logout'}
            >
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
