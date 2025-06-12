import React from 'react';
import { Link, NavLink as RouterNavLink } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from './UserMenu';

interface NavLinkProps {
  to: string;
  text: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, text }) => {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 ${
          isActive
            ? 'border-indigo-500 text-gray-900'
            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
        }`
      }
    >
      {text}
    </RouterNavLink>
  );
};

const Navbar = () => {
  const { user, userRole } = useAuth();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link to="/" className="flex flex-shrink-0 items-center">
              <span className="text-xl font-bold text-gray-900">
                ClariQuest
              </span>
            </Link>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink to="/businesses" text="Businesses" />
                <NavLink to="/link-generator" text="Link Generator" />
                <NavLink to="/instagram-campaigns" text="Instagram Campaigns" />
                <NavLink to="/instagram-messaging" text="Instagram Messaging" />
                <NavLink to="/ai-insights" text="AI Insights" />
                <NavLink to="/python-script" text="Python Script" />
                <NavLink to="/database" text="Database" />
                {userRole === 'admin' && (
                  <NavLink to="/user-management" text="User Management" />
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <UserMenu />
            ) : (
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
