import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const isHomeBreadcrumb = (item) => {
  if (!item || item.link !== '/') return false;
  const normalizedLabel = String(item.label || '').trim().toLowerCase();
  return (
    normalizedLabel === 'home' ||
    normalizedLabel === 'मुख्यपृष्ठ' ||
    normalizedLabel === 'मुख्यपृष्ठ (home)'
  );
};

export const Breadcrumbs = ({ items = [] }) => {
  const { isMarathi } = useLanguage();

  // Strip any leading Home entry since the root Home link is always rendered first
  const displayItems = [...items];
  while (displayItems.length > 0 && isHomeBreadcrumb(displayItems[0])) {
    displayItems.shift();
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-300">
      <ol className="flex items-center flex-wrap gap-1.5">
        <li className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'मुख्यपृष्ठ (Home)' : 'Home'}</span>
          </Link>
        </li>

        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              {isLast || !item.link ? (
                <span className="font-semibold text-yellow-400" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.link} className="hover:text-white transition-colors">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
