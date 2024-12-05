import { ArrowUp, ArrowDown, Minus, Star } from 'lucide-react';
import { ChartMovement } from '../types/hot50';
import { cn } from '../lib/utils';

interface ChartPositionProps {
  current: number;
  previous: number | null;
  weeksOnChart: number;
  className?: string;
}

export function ChartPosition({ current, previous, weeksOnChart, className }: ChartPositionProps) {
  const movement: ChartMovement = getChartMovement(current, previous);
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-shrink-0 w-12 h-12 bg-surface-secondary rounded-lg flex items-center justify-center">
        <span className="text-xl font-bold text-cream">#{current}</span>
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          {movement.type === 'new' && (
            <Star className="w-4 h-4 text-cream" />
          )}
          {movement.type === 'up' && (
            <ArrowUp className="w-4 h-4 text-green-500" />
          )}
          {movement.type === 'down' && (
            <ArrowDown className="w-4 h-4 text-red-500" />
          )}
          {movement.type === 'same' && (
            <Minus className="w-4 h-4 text-text-secondary" />
          )}
          
          <span className="text-sm text-text-secondary">
            {movement.type === 'new' ? 'New Entry' :
             movement.type === 'same' ? 'No Change' :
             `${movement.difference} ${movement.type}`}
          </span>
        </div>
        
        <span className="text-xs text-text-secondary">
          {weeksOnChart} {weeksOnChart === 1 ? 'week' : 'weeks'} on chart
        </span>
      </div>
    </div>
  );
}

function getChartMovement(current: number, previous: number | null): ChartMovement {
  if (previous === null) {
    return { type: 'new' };
  }
  
  if (current === previous) {
    return { type: 'same' };
  }
  
  if (current < previous) {
    return { type: 'up', difference: previous - current };
  }
  
  return { type: 'down', difference: current - previous };
}