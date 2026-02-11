import React, { useState, useRef, useEffect } from 'react';
import { NODE_COLORS } from '../../constants/colors';
import { Check } from 'lucide-react';

const ColorPicker = ({ value, onChange, label = '', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedColor = NODE_COLORS.find((c) => c.value === value) || NODE_COLORS[0];

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border-2 border-gray-300"
            style={{ backgroundColor: selectedColor.value }}
          />
          <span className="text-gray-900">{selectedColor.name}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="grid grid-cols-5 gap-2">
            {NODE_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => {
                  onChange(color.value);
                  setIsOpen(false);
                }}
                className="relative w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: color.value,
                  borderColor: value === color.value ? '#1f2937' : 'transparent',
                }}
                title={color.name}
              >
                {value === color.value && (
                  <Check size={16} className="absolute inset-0 m-auto text-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
