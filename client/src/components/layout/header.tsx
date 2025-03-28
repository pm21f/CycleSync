import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { LunaLogo } from "@/components/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Header: React.FC = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/" },
    { name: "Calendar", href: "/calendar" },
    { name: "Insights", href: "/insights" },
    { name: "Resources", href: "/resources" },
    { name: "Community", href: "/community" }
  ];

  return (
    <header className="bg-background shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <LunaLogo className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-semibold text-primary">Luna</span>
              </a>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a 
                  className={`${
                    location === item.href
                      ? "text-primary border-b-2 border-primary"
                      : "text-foreground hover:text-primary"
                  } px-3 py-2 text-sm font-medium`}
                >
                  {item.name}
                </a>
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button className="text-neutral-500 hover:text-primary">
              <i className="ri-notification-3-line text-xl"></i>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-neutral-200 text-neutral-500">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button 
              className="md:hidden text-neutral-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className={`ri-${mobileMenuOpen ? 'close' : 'menu'}-line text-xl`}></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border px-2 pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <a 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location === item.href
                    ? "text-primary bg-muted"
                    : "text-foreground hover:text-primary hover:bg-muted"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
