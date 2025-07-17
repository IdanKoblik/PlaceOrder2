import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Table } from '../../../shared/types';

interface TableLayoutProps {
  tables: Table[];
  selectedArea: 'bar' | 'inside' | 'outside';
  selectedTables: string[];
  onTableSelect: (tableId: string) => void;
  getTableStatus: (tableId: string) => string;
  date: string;
  time: string;
}

export const TableLayout: React.FC<TableLayoutProps> = ({
  tables,
  selectedArea,
  selectedTables,
  onTableSelect,
  getTableStatus,
  date,
  time
}) => {
  const { t } = useLanguage();
  
  const areaSize = {
    bar: { width: 450, height: 220 },
    inside: { width: 420, height: 240 },
    outside: { width: 380, height: 220 }
  };

  const currentAreaTables = tables.filter(table => table.area === selectedArea);
  const { width, height } = areaSize[selectedArea];

  const getStatusColor = (status: string, isSelected: boolean) => {
    if (isSelected) return 'ring-4 ring-blue-400 bg-blue-100 border-blue-500';
    
    switch (status) {
      case 'available':
        return 'bg-emerald-100 border-emerald-500 hover:bg-emerald-200';
      case 'reserved':
        return 'bg-amber-100 border-amber-500';
      case 'occupied':
        return 'bg-red-100 border-red-500';
      case 'maintenance':
        return 'bg-gray-100 border-gray-400';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getTableShape = (area: string) => {
    switch (area) {
      case 'bar':
        return 'w-16 h-8 rounded-sm'; // Rectangular bar seats
      case 'inside':
        return 'w-12 h-12 rounded-lg'; // Square tables
      case 'outside':
        return 'w-14 h-14 rounded-full'; // Round patio tables
      default:
        return 'w-12 h-12 rounded-lg';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {t(`areas.${selectedArea}`)}
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-100 border-2 border-emerald-500 rounded"></div>
            <span>{t('table.available')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-100 border-2 border-amber-500 rounded"></div>
            <span>{t('table.reserved')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
            <span>{t('table.occupied')}</span>
          </div>
        </div>
      </div>

      <div 
        className="relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 mx-auto"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {currentAreaTables.map((table) => {
          const status = getTableStatus(table.id, date, time);
          const isSelected = selectedTables.includes(table.id);
          const isSelectable = status === 'available' || isSelected;

          return (
            <button
              key={table.id}
              onClick={() => isSelectable && onTableSelect(table.id)}
              disabled={!isSelectable}
              className={`absolute border-2 transition-all duration-200 flex items-center justify-center text-xs font-medium
                ${getTableShape(selectedArea)} 
                ${getStatusColor(status, isSelected)}
                ${isSelectable ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-not-allowed opacity-60'}
              `}
              style={{
                left: `${table.position.x}px`,
                top: `${table.position.y}px`,
              }}
              title={`${table.name} - ${t('table.capacity')}: ${table.capacity.min}-${table.capacity.max}`}
            >
              <div className="text-center">
                <div className="font-semibold">{table.name.split(' ')[1] || table.name}</div>
                <div className="text-xs opacity-75">{table.capacity.min}-{table.capacity.max}</div>
              </div>
            </button>
          );
        })}

        {selectedArea === 'bar' && (
          <div className="absolute top-2 left-2 text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded">
            Bar Counter
          </div>
        )}
        
        {selectedArea === 'outside' && (
          <div className="absolute top-2 left-2 text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded">
            🌿 Patio Garden
          </div>
        )}
      </div>

      {selectedTables.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-800 mb-1">
            {t('table.selectTables')}:
          </div>
          <div className="text-sm text-blue-600">
            {selectedTables.map(id => {
              const table = tables.find(t => t.id === id);
              return table?.name;
            }).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};
