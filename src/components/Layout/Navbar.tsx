import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, Users, Bell, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useSocial();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/feed', icon: Home, label: 'Feed' },
    { path: '/upload', icon: PlusSquare, label: 'Upload' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-b border-border z-50 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/feed" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:rotate-3">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ProjectGram
            </span>
          </Link>

          <div className="hidden md:flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-xl 
                    transition-all duration-300 relative group
                    ${active 
                      ? 'text-primary font-medium bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                  `}
                >
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl animate-pulse-glow" />
                  )}
                  <div className="relative transform transition-transform group-hover:scale-110">
                    <Icon size={20} className={active ? 'stroke-[2.5]' : ''} />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-destructive to-destructive/80 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce-in">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:inline relative">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <Link to="/profile" className="hidden md:block group">
            <Avatar className="h-9 w-9 ring-2 ring-primary/20 transition-all group-hover:ring-4 group-hover:ring-primary/30 group-hover:scale-110">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border shadow-lg">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center justify-center flex-1 py-2 relative
                  transition-all duration-300
                  ${active ? 'text-primary' : 'text-muted-foreground'}
                `}
              >
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-b-full" />
                )}
                <div className={`relative transform transition-transform ${active ? 'scale-110' : 'hover:scale-105'}`}>
                  <Icon size={22} className={active ? 'stroke-[2.5]' : ''} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-gradient-to-r from-destructive to-destructive/80 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold animate-bounce-in">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${active ? 'opacity-100' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
