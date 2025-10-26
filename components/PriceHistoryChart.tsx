import React, { useState, useMemo, useRef } from 'react';
import { PriceHistoryPoint } from '../types';

interface PriceHistoryChartProps {
    data: PriceHistoryPoint[];
    currency: string;
}

const formatCurrency = (cents: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
};

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ data, currency }) => {
    const [activePoint, setActivePoint] = useState<{ point: PriceHistoryPoint; x: number; y: number } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const width = 250;
    const height = 50;
    const padding = 5;

    const { points, path, minPrice, maxPrice } = useMemo(() => {
        if (!data || data.length < 2) {
            return { points: [], path: '', minPrice: 0, maxPrice: 0 };
        }

        const prices = data.map(d => d.priceCents);
        const minP = Math.min(...prices);
        const maxP = Math.max(...prices);
        const priceRange = maxP - minP === 0 ? 1 : maxP - minP;

        const generatedPoints = data.map((point, i) => {
            const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
            const y = padding + (1 - (point.priceCents - minP) / priceRange) * (height - 2 * padding);
            return { x, y, point };
        });

        const generatedPath = generatedPoints.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');
        
        return { points: generatedPoints, path: generatedPath, minPrice: minP, maxPrice: maxP };
    }, [data, width, height, padding]);

    const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current || points.length === 0) return;

        const svgRect = svgRef.current.getBoundingClientRect();
        const mouseX = event.clientX - svgRect.left;

        const index = Math.round(((mouseX - padding) / (width - 2 * padding)) * (data.length - 1));
        
        if (index >= 0 && index < points.length) {
            setActivePoint(points[index]);
        }
    };

    const handleMouseLeave = () => {
        setActivePoint(null);
    };

    if (!data || data.length < 2) {
        return <div className="h-[50px] flex items-center justify-center text-xs text-slate-400">Not enough price data.</div>;
    }

    return (
        <div className="relative">
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Price History (30d)</h4>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${width} ${height}`}
                className="w-full max-w-[250px] overflow-visible"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <path d={path} fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                {activePoint && (
                    <>
                        <line x1={activePoint.x} y1={0} x2={activePoint.x} y2={height} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
                        <circle cx={activePoint.x} cy={activePoint.y} r="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2" />
                    </>
                )}
            </svg>
            {activePoint && (
                <div 
                    className="absolute z-10 p-2 text-xs bg-slate-900 text-white rounded-md shadow-lg pointer-events-none"
                    style={{
                        left: `${(activePoint.x / width) * 100}%`,
                        bottom: '100%',
                        transform: 'translateX(-50%) translateY(-8px)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <div>{formatCurrency(activePoint.point.priceCents, currency)}</div>
                    <div className="text-slate-300">{new Date(activePoint.point.date).toLocaleDateString()}</div>
                </div>
            )}
             <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>{formatCurrency(minPrice, currency)}</span>
                <span>{formatCurrency(maxPrice, currency)}</span>
            </div>
        </div>
    );
};

export default PriceHistoryChart;
