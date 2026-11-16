import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'कोणतीही नोंद आढळली नाही',
  description = 'सध्या येथे कोणतीही माहिती उपलब्ध नाही किंवा शोध निकष जुळत नाहीत.',
  actionText,
  onAction
}) => {
  return (
    <div className="text-center py-12 px-4 rounded-2xl bg-white border border-slate-200/80 p-8 shadow-sm max-w-md mx-auto space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
