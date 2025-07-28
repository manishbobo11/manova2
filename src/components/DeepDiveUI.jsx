import React, { useState, useEffect } from 'react';
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

// Shimmer loading component
const ShimmerLoader = () => (
  <div className="w-full bg-white/90 rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col gap-4 animate-pulse">
    {/* Shimmer for the select control */}
    <div className="w-full h-12 bg-gray-200 rounded-2xl"></div>
    {/* Shimmer for the selection counter */}
    <div className="p-3 bg-gray-100 rounded-xl">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  </div>
);

const DeepDiveUI = ({ 
  stressOptions = [], 
  selectedStressTags = [], 
  onStressTagsChange, 
  maxSelections = 3,
  placeholder = "Choose stress contributors...",
  className = "",
  questionId = null, // Add questionId prop for API calls
  isLoading = false // Add isLoading prop for external loading states
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOptions() {
      setLoading(true);
      try {
        // Try to fetch dynamic contributors from API based on question ID
        if (questionId) {
          console.log(`🔍 Fetching dynamic contributors for question: ${questionId}`);
          const res = await fetch(`http://localhost:8001/api/contributors?qid=${questionId}`);
          if (res.ok) {
            const data = await res.json();
            console.log(`✅ Received ${data.length} dynamic contributors for ${questionId}`);
            setOptions(data);
          } else {
            console.log(`⚠️ API returned ${res.status}, falling back to provided options`);
            setOptions(stressOptions);
          }
        } else {
          // Use provided stressOptions if no questionId
          console.log('📋 Using provided stress options (no question ID)');
          setOptions(stressOptions);
        }
      } catch (e) {
        console.error('❌ Error loading contributors:', e);
        console.log('🔄 Falling back to provided stress options');
        setOptions(stressOptions);
      }
      setLoading(false);
    }
    
    fetchOptions();
  }, [questionId, stressOptions]);

  // Show shimmer loader while loading (either API loading or external loading)
  if (loading || isLoading) {
    return <ShimmerLoader />;
  }

  // Convert stressOptions to react-select format if they're strings
  const selectOptions = options.map((opt, index) => {
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
    <div className={`w-full bg-white/90 rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col gap-4 ${className}`}>
      <Select
        options={selectOptions}
        value={selectedOptions}
        isMulti
        maxMenuHeight={300}
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