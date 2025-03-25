import React from "react";
import { Button } from "./ui/button";
import { Search, ShoppingCart, Menu, X } from "lucide-react";

interface HeaderProps {
  onPurchaseClick?: () => void;
  title?: string;
  subtitle?: string;
}

const Header = ({
  onPurchaseClick = () => {},
  title = "The Million Dollar Vibe Page",
  subtitle = "Purchase pixel blocks to showcase your vibe coding skills, projects and startups",
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full h-20 bg-gray-900 border-b border-gray-800 text-white flex items-center justify-between px-4 md:px-8 fixed top-0 left-0 z-50">
      {/* Logo and Title */}
      <div className="flex items-center">
        <a
          href="/"
          className="mr-4 text-xl md:text-2xl font-bold hover:opacity-90 transition-opacity"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            {title}
          </span>
          <p className="text-xs md:text-sm text-gray-400 font-normal mt-1">
            {subtitle}
          </p>
        </a>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6">
        <nav className="flex items-center space-x-6">
          <a
            href="/"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            Home
          </a>
          <a
            href="/faq"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            FAQ
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            onClick={onPurchaseClick}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-5 py-2 shadow-lg hover:shadow-purple-500/20 transition-all duration-300 font-medium"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy Pixels
          </Button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMenu}
          className="text-gray-300 hover:text-white hover:bg-gray-800"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-gray-900 border-b border-gray-800 p-4 md:hidden">
          <nav className="flex flex-col space-y-4">
            <a
              href="/"
              className="text-gray-300 hover:text-purple-400 transition-colors"
            >
              Home
            </a>
            <a
              href="/faq"
              className="text-gray-300 hover:text-purple-400 transition-colors"
            >
              FAQ
            </a>
            <Button
              onClick={onPurchaseClick}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-5 py-2 shadow-lg hover:shadow-purple-500/20 transition-all duration-300 font-medium mt-2 w-full"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy Pixels
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
