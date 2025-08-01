import { Home, CreditCard, Plus, BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';


interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Inicio' },
  { id: 'accounts', icon: CreditCard, label: 'Cuentas' },
  { id: 'new', icon: Plus, label: 'Nuevo' },
  { id: 'reports', icon: BarChart3, label: 'Reportes' }
];

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="safe-area-bottom">
        <div className="flex items-center justify-around py-2 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 min-w-16 transition-all duration-200",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-2 rounded-full transition-all duration-200",
                  isActive ? "bg-primary/10 scale-110" : "hover:bg-muted"
                )}>
                  <Icon size={20} className={cn(
                    "transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <span className={cn(
                  "text-xs font-medium mt-1 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};