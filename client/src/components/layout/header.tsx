import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { LunaLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

const Header: React.FC = () => {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/" },
    { name: "Calendar", href: "/calendar" },
    { name: "Insights", href: "/insights" },
    { name: "Resources", href: "/resources" },
    { name: "Community", href: "/community" }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
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
          
          {isAuthenticated && (
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a 
                    className={`${
                      location === item.href
                        ? "text-primary border-b-2 border-primary"
                        : "text-neutral-600 hover:text-primary"
                    } px-3 py-2 text-sm font-medium`}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
          )}
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button className="text-neutral-500 hover:text-primary">
                  <i className="ri-notification-3-line text-xl"></i>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarFallback className="bg-neutral-200 text-neutral-500">
                        {user?.name ? user.name.charAt(0).toUpperCase() : user?.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button 
                  className="md:hidden text-neutral-500"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <i className={`ri-${mobileMenuOpen ? 'close' : 'menu'}-line text-xl`}></i>
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden bg-white border-t border-neutral-200 px-2 pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <a 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location === item.href
                    ? "text-primary bg-neutral-50"
                    : "text-neutral-600 hover:text-primary hover:bg-neutral-50"
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
