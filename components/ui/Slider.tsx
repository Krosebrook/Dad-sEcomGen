import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value?: number[];
    onValueChange?: (value: number[]) => void;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
        const [internalValue, setInternalValue] = React.useState(value ? value[0] : 0);

        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = parseFloat(event.target.value);
            setInternalValue(newValue);
            if (onValueChange) {
                onValueChange([newValue]);
            }
        };
        
        React.useEffect(() => {
            if (value) {
                setInternalValue(value[0]);
            }
        }, [value]);

        const percentage = ((internalValue - Number(min)) / (Number(max) - Number(min))) * 100;

        const trackStyle = {
            background: `linear-gradient(to right, #1e293b 0%, #1e293b ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`
        };
         const darkTrackStyle = {
            background: `linear-gradient(to right, #f8fafc 0%, #f8fafc ${percentage}%, #334155 ${percentage}%, #334155 100%)`
        };


        return (
            <input
                type="range"
                ref={ref}
                min={min}
                max={max}
                step={step}
                value={internalValue}
                onChange={handleChange}
                className={`w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb ${className}`}
                style={document.documentElement.classList.contains('dark') ? darkTrackStyle : trackStyle}
                {...props}
            />
        );
    }
);
Slider.displayName = 'Slider';

// Add some basic styles for the slider thumb to the document head
const styleElement = document.createElement('style');
styleElement.innerHTML = `
    .slider-thumb::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        background: #1e293b;
        border: 2px solid #f8fafc;
        border-radius: 50%;
        cursor: pointer;
    }
    .dark .slider-thumb::-webkit-slider-thumb {
        background: #f8fafc;
        border: 2px solid #1e293b;
    }
    .slider-thumb::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: #1e293b;
        border: 2px solid #f8fafc;
        border-radius: 50%;
        cursor: pointer;
    }
    .dark .slider-thumb::-moz-range-thumb {
        background: #f8fafc;
        border: 2px solid #1e293b;
    }
`;
document.head.appendChild(styleElement);
