import React from 'react';
import Select from 'react-select';

// Custom styles for react-select
const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'white',
    borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
    borderWidth: '2px',
    borderRadius: '16px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
    minHeight: '48px',
    fontSize: '1rem',
    padding: '0 0.5rem',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: '#3b82f6'
    }
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#dbeafe',
    borderRadius: '8px',
    padding: '2px',
    fontSize: '0.95rem',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#1e40af',
    fontWeight: '500',
    fontSize: '0.95rem',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#1e40af',
    '&:hover': {
      backgroundColor: '#bfdbfe',
      color: '#1e3a8a'
    }
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#dbeafe' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    fontSize: '1rem',
    '&:hover': {
      backgroundColor: state.isSelected ? '#3b82f6' : '#dbeafe'
    }
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  })
};

const DeepDiveUI = ({ 
  stressOptions = [], 
  selectedStressTags = [], 
  onStressTagsChange, 
  maxSelections = 3,
  placeholder = "Choose stress contributors...",
  className = ""
}) => {
  // Convert stressOptions to react-select format if they're strings
  const selectOptions = stressOptions.map((opt, index) => {
    if (typeof opt === 'string') {
      return { 
        label: opt, 
        value: `option_${index}`,
        isDisabled: false
      };
    }
    return {
      ...opt,
      isDisabled: false
    };
  });

  // Convert selectedStressTags to react-select format
  const selectedOptions = selectedStressTags.map(tag => {
    if (typeof tag === 'string') {
      return { label: tag, value: tag };
    }
    return tag;
  });

  const handleChange = (selectedOptions) => {
    if (!selectedOptions) {
      onStressTagsChange([]);
      return;
    }

    // Limit selections if maxSelections is set
    if (maxSelections && selectedOptions.length > maxSelections) {
      const limitedOptions = selectedOptions.slice(0, maxSelections);
      onStressTagsChange(limitedOptions.map(opt => opt.label));
    } else {
      onStressTagsChange(selectedOptions.map(opt => opt.label));
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto bg-white/90 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 flex flex-col gap-4 scale-[1.05] ${className}`}>
      <Select
        options={selectOptions}
        value={selectedOptions}
        isMulti
        maxMenuHeight={200}
        placeholder={placeholder}
        onChange={handleChange}
        isOptionDisabled={(option) => {
          if (!maxSelections) return false;
          const currentCount = selectedStressTags.length;
          const isSelected = selectedStressTags.includes(option.label);
          return currentCount >= maxSelections && !isSelected;
        }}
        noOptionsMessage={() => "No more options available"}
        styles={selectStyles}
        className="text-base"
        classNamePrefix="react-select"
      />
      {selectedStressTags.length > 0 && maxSelections && (
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 mt-2">
          <p className="text-base text-blue-700">
            <span className="font-semibold">Selected:</span> {selectedStressTags.length}/{maxSelections} stress contributors
          </p>
          {selectedStressTags.length === maxSelections && (
            <p className="text-sm text-blue-600 mt-1">
              You've selected the maximum number of contributors. You can change your selections if needed.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DeepDiveUI; 