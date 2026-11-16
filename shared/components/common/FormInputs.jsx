import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  id,
  name,
  className = '',
  required = false,
  ...props
}) => {
  const inputId = id || name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        required={required}
        className={`w-full rounded-lg border px-3.5 py-2 text-sm text-slate-800 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500/20 focus:border-gurukul-saffron-500 ${
          error ? 'border-red-400 bg-red-50/30' : 'border-slate-300 bg-white'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};

export const Select = ({
  label,
  error,
  options = [],
  id,
  name,
  className = '',
  required = false,
  ...props
}) => {
  const selectId = id || name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        required={required}
        className={`w-full rounded-lg border px-3.5 py-2 text-sm text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500/20 focus:border-gurukul-saffron-500 bg-white ${
          error ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
        } ${className}`}
        {...props}
      >
        {options.map((opt, i) => {
          if (typeof opt === 'string') {
            return <option key={i} value={opt}>{opt}</option>;
          }
          return <option key={opt.value || i} value={opt.value}>{opt.label}</option>;
        })}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export const Textarea = ({
  label,
  error,
  id,
  name,
  rows = 3,
  className = '',
  required = false,
  ...props
}) => {
  const areaId = id || name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={areaId} className="block text-xs font-semibold text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={areaId}
        name={name}
        rows={rows}
        required={required}
        className={`w-full rounded-lg border px-3.5 py-2 text-sm text-slate-800 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gurukul-saffron-500/20 focus:border-gurukul-saffron-500 ${
          error ? 'border-red-400 bg-red-50/30' : 'border-slate-300 bg-white'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
