import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = ({ items = [] }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-300">
      <ol className="flex items-center flex-wrap gap-1.5">
        <li className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>मुख्यपृष्ठ (Home)</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
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
