import React, { useState } from 'react';
import { SelectOption } from '@/services/types/onboarding/data';

interface MultiSelectProps {
  label: string;
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  loading?: boolean;
  placeholder?: string;
  className?: string;
  showDescription?: boolean;
}

export default function MultiSelect({
  label,
  options,
  value,
  onChange,
  loading = false,
  placeholder = 'Select options...',
  className = '',
  showDescription = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (showDescription && option.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedLabels = options
    .filter(option => value.includes(option.value))
    .map(option => option.label);

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-200 mb-1">
        {label}
      </label>
      <div className="relative">
        <div
          className="min-h-[42px] p-2 border rounded-md bg-gray-800 border-gray-600 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          {value.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedLabels.map(label => (
                <span
                  key={label}
                  className="px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg">
            <input
              type="text"
              className="w-full p-2 border-b border-gray-600 bg-gray-700 text-white rounded-t-md"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="max-h-60 overflow-auto">
              {loading ? (
                <div className="p-2 text-gray-400">Loading...</div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-2 text-gray-400">No options found</div>
              ) : (
                filteredOptions.map(option => (
                  <div
                    key={option.value}
                    className={`p-2 hover:bg-gray-700 cursor-pointer ${
                      value.includes(option.value) ? 'bg-blue-600' : ''
                    }`}
                    onClick={() => {
                      const newValue = value.includes(option.value)
                        ? value.filter(v => v !== option.value)
                        : [...value, option.value];
                      onChange(newValue);
                    }}
                  >
                    <div className="text-white">{option.label}</div>
                    {showDescription && option.description && (
                      <div className="text-sm text-gray-400">
                        {option.description}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 