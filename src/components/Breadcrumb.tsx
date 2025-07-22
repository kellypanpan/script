import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs based on current path if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Home', href: '/' }
    ];

    // Map path segments to readable names
    const pathNameMap: Record<string, string> = {
      'studio': 'AI Studio',
      'script-doctor': 'Script Doctor',
      'dashboard': 'Creation Center',
      'pricing': 'Pricing',
      'blog': 'Blog',
      'generate': 'Script Generator'
    };

    pathSegments.forEach((segment, index) => {
      const isLast = index === pathSegments.length - 1;
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      
      breadcrumbs.push({
        name: pathNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: isLast ? undefined : path,
        current: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumb for home page or single-level pages
  }

  return (
    <nav className="flex bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8" aria-label="Breadcrumb">
      <div className="max-w-7xl mx-auto w-full">
        <ol className="flex items-center space-x-2 py-3">
          {breadcrumbItems.map((item, index) => (
            <li key={item.name} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}
              
              {item.href ? (
                <Link
                  to={item.href}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {index === 0 && <Home className="h-4 w-4" />}
                  <span>{item.name}</span>
                </Link>
              ) : (
                <span className="flex items-center space-x-1 text-sm font-medium text-gray-900">
                  {index === 0 && <Home className="h-4 w-4" />}
                  <span>{item.name}</span>
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;