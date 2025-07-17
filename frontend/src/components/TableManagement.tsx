import React, { useState, useRef, useCallback } from 'react';
import { Plus, Edit, Trash2, Save, X, Move, Settings, Download, Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Table } from '../../../shared/types';

interface TableManagementProps {
  tables: Table[];
  onUpdateTables: (tables: Table[]) => void;
  isLoading?: boolean;
}

interface DragState {
  isDragging: boolean;
  tableId: string | null;
  offset: { x: number; y: number };
}

export const TableManagement: React.FC<TableManagementProps> = ({
  tables,
  onUpdateTables,
  isLoading = false
}) => {
  const { t } = useLanguage();
  const [selectedArea, setSelectedArea] = useState<'bar' | 'inside' | 'outside'>('inside');
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    tableId: null,
    offset: { x: 0, y: 0 }
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  const areaSize = {
    bar: { width: 450, height: 220 },
    inside: { width: 420, height: 240 },
    outside: { width: 380, height: 220 }
  };

  const currentAreaTables = tables.filter(table => table.area === selectedArea);
  const { width, height } = areaSize[selectedArea];

  const getTableShape = (area: string) => {
    switch (area) {
      case 'bar':
        return 'w-16 h-8 rounded-sm';
      case 'inside':
        return 'w-12 h-12 rounded-lg';
      case 'outside':
        return 'w-14 h-14 rounded-full';
      default:
        return 'w-12 h-12 rounded-lg';
    }
  };

  const handleExportTables = () => {
    // Convert tables to SQLite INSERT statements
    const sqlStatements = tables.map(table => {
      return `INSERT INTO tables (id, name, area, min_capacity, max_capacity, is_adjustable, position_x, position_y, is_active) VALUES ('${table.id}', '${table.name}', '${table.area}', ${table.capacity.min}, ${table.capacity.max}, ${table.isAdjustable ? 1 : 0}, ${table.position.x}, ${table.position.y}, ${table.isActive ? 1 : 0});`;
    });

    const sqlContent = `-- Table data export
-- Generated on ${new Date().toISOString()}

CREATE TABLE IF NOT EXISTS tables (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  min_capacity INTEGER NOT NULL,
  max_capacity INTEGER NOT NULL,
  is_adjustable INTEGER NOT NULL DEFAULT 1,
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1
);

${sqlStatements.join('\n')}`;

    // Create and download the file
    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tables-export-${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Also export as JSON for backup
    const jsonContent = JSON.stringify(tables, null, 2);
    const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonA = document.createElement('a');
    jsonA.href = jsonUrl;
    jsonA.download = `tables-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(jsonA);
    jsonA.click();
    document.body.removeChild(jsonA);
    URL.revokeObjectURL(jsonUrl);
  };

  const handleLoadSampleTables = async () => {
    if (confirm(t('table.loadSampleTables') + '?')) {
      const sampleTables: Table[] = [
        // Bar Area - Counter seats
        { id: 'bar-1', name: 'Bar 1-2', area: 'bar', capacity: { min: 1, max: 2 }, isAdjustable: true, position: { x: 100, y: 20 }, isActive: true },
        { id: 'bar-2', name: 'Bar 3-4', area: 'bar', capacity: { min: 1, max: 2 }, isAdjustable: true, position: { x: 180, y: 20 }, isActive: true },
        { id: 'bar-3', name: 'Bar 5-6', area: 'bar', capacity: { min: 1, max: 2 }, isAdjustable: true, position: { x: 260, y: 20 }, isActive: true },
        { id: 'bar-4', name: 'Bar 7-8', area: 'bar', capacity: { min: 1, max: 2 }, isAdjustable: true, position: { x: 340, y: 20 }, isActive: true },
        
        // Inside Dining - Flexible tables
        { id: 'in-1', name: 'Table 1', area: 'inside', capacity: { min: 2, max: 4 }, isAdjustable: true, position: { x: 80, y: 80 }, isActive: true },
        { id: 'in-2', name: 'Table 2', area: 'inside', capacity: { min: 2, max: 4 }, isAdjustable: true, position: { x: 200, y: 80 }, isActive: true },
        { id: 'in-3', name: 'Table 3', area: 'inside', capacity: { min: 4, max: 6 }, isAdjustable: true, position: { x: 320, y: 80 }, isActive: true },
        { id: 'in-4', name: 'Table 4', area: 'inside', capacity: { min: 2, max: 4 }, isAdjustable: true, position: { x: 80, y: 160 }, isActive: true },
        { id: 'in-5', name: 'Table 5', area: 'inside', capacity: { min: 4, max: 8 }, isAdjustable: true, position: { x: 200, y: 160 }, isActive: true },
        { id: 'in-6', name: 'Table 6', area: 'inside', capacity: { min: 2, max: 4 }, isAdjustable: true, position: { x: 320, y: 160 }, isActive: true },
        
        // Outside Patio - Fixed tables
        { id: 'out-1', name: 'Patio 1', area: 'outside', capacity: { min: 2, max: 2 }, isAdjustable: false, position: { x: 60, y: 60 }, isActive: true },
        { id: 'out-2', name: 'Patio 2', area: 'outside', capacity: { min: 4, max: 4 }, isAdjustable: false, position: { x: 180, y: 60 }, isActive: true },
        { id: 'out-3', name: 'Patio 3', area: 'outside', capacity: { min: 2, max: 2 }, isAdjustable: false, position: { x: 300, y: 60 }, isActive: true },
        { id: 'out-4', name: 'Patio 4', area: 'outside', capacity: { min: 6, max: 6 }, isAdjustable: false, position: { x: 120, y: 140 }, isActive: true },
        { id: 'out-5', name: 'Patio 5', area: 'outside', capacity: { min: 4, max: 4 }, isAdjustable: false, position: { x: 240, y: 140 }, isActive: true },
      ];
      
      await onUpdateTables(sampleTables);
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, tableId: string) => {
    e.preventDefault();
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    setDragState({
      isDragging: true,
      tableId,
      offset: {
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2
      }
    });
  }, [tables]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.tableId || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(width - 60, e.clientX - containerRect.left - dragState.offset.x));
    const newY = Math.max(0, Math.min(height - 60, e.clientY - containerRect.top - dragState.offset.y));

    const updatedTables = tables.map(table =>
      table.id === dragState.tableId
        ? { ...table, position: { x: newX, y: newY } }
        : table
    );

    onUpdateTables(updatedTables);
  }, [dragState, width, height, tables, onUpdateTables]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      tableId: null,
      offset: { x: 0, y: 0 }
    });
  }, []);

  const handleAddTable = () => {
    const newTable: Table = {
      id: `${selectedArea}-${Date.now()}`,
      name: `${selectedArea === 'bar' ? 'Bar' : selectedArea === 'inside' ? 'Table' : 'Patio'} ${currentAreaTables.length + 1}`,
      area: selectedArea,
      capacity: { min: 2, max: 4 },
      isAdjustable: true,
      position: { 
        x: selectedArea === 'bar' ? 50 : 50, 
        y: selectedArea === 'bar' ? 50 : 50 
      },
      isActive: true
    };

    onUpdateTables([...tables, newTable]);
    setEditingTable(newTable);
    setIsAddingTable(false);
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
  };

  const handleSaveTable = (updatedTable: Table) => {
    const updatedTables = tables.map(table =>
      table.id === updatedTable.id ? updatedTable : table
    );
    onUpdateTables(updatedTables);
    setEditingTable(null);
  };

  const handleDeleteTable = (tableId: string) => {
    if (confirm(t('actions.delete') + '?')) {
      const updatedTables = tables.filter(table => table.id !== tableId);
      onUpdateTables(updatedTables);
    }
  };

  const handleToggleActive = (tableId: string) => {
    const updatedTables = tables.map(table =>
      table.id === tableId ? { ...table, isActive: !table.isActive } : table
    );
    onUpdateTables(updatedTables);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{t('table.tableManagement')}</h2>
        <div className="flex items-center gap-3">
          {tables.length === 0 && (
            <button
              onClick={handleLoadSampleTables}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Upload size={16} />
              {t('table.loadSampleTables')}
            </button>
          )}
          <button
            onClick={handleExportTables}
            disabled={tables.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={16} />
            {t('table.exportTables')}
          </button>
          <button
            onClick={() => setIsAddingTable(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            {t('table.addTable')}
          </button>
        </div>
      </div>

      {/* Area Selection */}
      <div className="flex gap-2">
        {(['bar', 'inside', 'outside'] as const).map(area => (
          <button
            key={area}
            onClick={() => setSelectedArea(area)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedArea === area
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t(`areas.${area}`)}
          </button>
        ))}
      </div>

      {/* Table Layout Editor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {t(`areas.${selectedArea}`)} Layout
          </h3>
          <div className="text-sm text-gray-600">
            {tables.length > 0 ? t('table.dragToReposition') : t('table.noTablesConfigured')}
          </div>
        </div>

        <div 
          ref={containerRef}
          className="relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 mx-auto cursor-crosshair"
          style={{ width: `${width}px`, height: `${height}px` }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {currentAreaTables.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Settings size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('table.noTablesConfigured')}</p>
                <p className="text-xs">{t('table.clickAddTable')}</p>
              </div>
            </div>
          ) : (
            currentAreaTables.map((table) => (
              <div
                key={table.id}
                className={`absolute border-2 transition-all duration-200 flex items-center justify-center text-xs font-medium cursor-move
                  ${getTableShape(selectedArea)}
                  ${table.isActive 
                    ? 'bg-blue-100 border-blue-500 hover:bg-blue-200' 
                    : 'bg-gray-100 border-gray-400 opacity-60'
                  }
                  ${dragState.tableId === table.id ? 'scale-110 shadow-lg z-10' : 'hover:scale-105'}
                `}
                style={{
                  left: `${table.position.x}px`,
                  top: `${table.position.y}px`,
                }}
                onMouseDown={(e) => handleMouseDown(e, table.id)}
                title={`${table.name} - ${t('table.capacity')}: ${table.capacity.min}-${table.capacity.max}`}
              >
                <div className="text-center pointer-events-none">
                  <div className="font-semibold">{table.name.split(' ')[1] || table.name}</div>
                  <div className="text-xs opacity-75">{table.capacity.min}-{table.capacity.max}</div>
                </div>
              </div>
            ))
          )}

          {selectedArea === 'bar' && (
            <div className="absolute top-2 left-2 text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded pointer-events-none">
              Bar Counter
            </div>
          )}
          
          {selectedArea === 'outside' && (
            <div className="absolute top-2 left-2 text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded pointer-events-none">
              🌿 Patio Garden
            </div>
          )}
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {t(`areas.${selectedArea}`)} ({currentAreaTables.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {currentAreaTables.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Settings size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">{t('table.noTablesConfigured')}</p>
              <p className="text-sm">{t('table.clickAddTable')}</p>
            </div>
          ) : (
            currentAreaTables.map((table) => (
              <div key={table.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{table.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        table.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {table.isActive ? t('table.active') : t('table.inactive')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">{t('table.capacity')}:</span> {table.capacity.min}-{table.capacity.max}
                      </div>
                      <div>
                        <span className="font-medium">{t('table.position')}:</span> ({table.position.x}, {table.position.y})
                      </div>
                      <div>
                        <span className="font-medium">{t('table.adjustable')}:</span> {table.isAdjustable ? t('actions.open') : t('actions.close')}
                      </div>
                      <div>
                        <span className="font-medium">Area:</span> {t(`areas.${table.area}`)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(table.id)}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        table.isActive
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {table.isActive ? t('table.deactivate') : t('table.activate')}
                    </button>
                    
                    <button
                      onClick={() => handleEditTable(table)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t('table.editTable')}
                    >
                      <Edit size={16} />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('table.deleteTable')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Table Modal */}
      {(isAddingTable || editingTable) && (
        <TableEditModal
          table={editingTable}
          area={selectedArea}
          onSave={editingTable ? handleSaveTable : handleAddTable}
          onCancel={() => {
            setIsAddingTable(false);
            setEditingTable(null);
          }}
        />
      )}
    </div>
  );
};

interface TableEditModalProps {
  table?: Table | null;
  area: 'bar' | 'inside' | 'outside';
  onSave: (table: Table) => void;
  onCancel: () => void;
}

const TableEditModal: React.FC<TableEditModalProps> = ({
  table,
  area,
  onSave,
  onCancel
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: table?.name || `${area === 'bar' ? 'Bar' : area === 'inside' ? 'Table' : 'Patio'} 1`,
    minCapacity: table?.capacity.min || 2,
    maxCapacity: table?.capacity.max || 4,
    isAdjustable: table?.isAdjustable ?? true,
    isActive: table?.isActive ?? true,
    x: table?.position.x || 50,
    y: table?.position.y || 50
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tableData: Table = {
      id: table?.id || `${area}-${Date.now()}`,
      name: formData.name,
      area,
      capacity: {
        min: formData.minCapacity,
        max: formData.maxCapacity
      },
      isAdjustable: formData.isAdjustable,
      position: {
        x: formData.x,
        y: formData.y
      },
      isActive: formData.isActive
    };

    onSave(tableData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {table ? t('table.editTable') : t('table.addTable')}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('table.tableName')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('table.minCapacity')}
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.minCapacity}
                onChange={(e) => setFormData(prev => ({ ...prev, minCapacity: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('table.maxCapacity')}
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.maxCapacity}
                onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('forms.xPosition')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.x}
                onChange={(e) => setFormData(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('forms.yPosition')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.y}
                onChange={(e) => setFormData(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isAdjustable}
                onChange={(e) => setFormData(prev => ({ ...prev, isAdjustable: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{t('forms.adjustableCapacity')}</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{t('table.active')}</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('actions.cancel')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={16} />
              {table ? t('actions.update') : t('actions.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
