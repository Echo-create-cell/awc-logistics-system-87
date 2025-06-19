
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, RefreshCw, SortAsc, SortDesc } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TableHeader from '../table/TableHeader';
import TableContent from '../table/TableContent';
import TablePagination from '../table/TablePagination';
import { SearchableTableProps, FilterOptions } from '@/types/table';

interface EnhancedSearchableTableProps extends SearchableTableProps {
  onExport?: () => void;
  onRefresh?: () => void;
  showExport?: boolean;
  showRefresh?: boolean;
  globalSearch?: boolean;
}

const EnhancedSearchableTable = ({
  title,
  data,
  columns,
  searchFields,
  filterOptions = [],
  itemsPerPage = 10,
  onExport,
  onRefresh,
  showExport = true,
  showRefresh = true,
  globalSearch = true,
}: EnhancedSearchableTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const filteredAndSortedData = useMemo(() => {
    let processedData = data.filter(item => {
      // Global search across all searchable fields
      if (globalSearch && searchTerm) {
        const matchesSearch = searchFields.some(field => 
          item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (!matchesSearch) return false;
      }
      
      // Additional filters
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value || value === '__all__') return true;
        return item[key] === value;
      });

      return matchesFilters;
    });

    // Apply sorting
    if (sortConfig) {
      processedData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return processedData;
  }, [data, searchTerm, filters, searchFields, sortConfig, globalSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({});
    setSortConfig(null);
  };

  const activeFiltersCount = Object.values(filters).filter(value => value && value !== '__all__').length;

  return (
    <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
      <TableHeader title={title} />
      
      <CardContent className="pt-0">
        {/* Enhanced Search and Filter Bar */}
        <div className="space-y-4 pt-6 mt-6 border-t border-gray-100">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Global Search */}
              {globalSearch && (
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={18} />
                  <Input
                    placeholder="Search across all fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-200 shadow-sm"
                  />
                </div>
              )}
              
              {/* Filter Controls */}
              {filterOptions.map((filter) => (
                <Select
                  key={filter.key}
                  value={filters[filter.key] || '__all__'}
                  onValueChange={(value) => handleFilterChange(filter.key, value)}
                >
                  <SelectTrigger className="w-full sm:w-[200px] bg-white border-blue-200 focus:border-blue-400 shadow-sm">
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="__all__">All {filter.label}</SelectItem>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center space-x-3">
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-medium">
                    {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
                  </Badge>
                )}
                
                {sortConfig && (
                  <Badge variant="outline" className="bg-white border-blue-200 text-blue-700">
                    {sortConfig.direction === 'asc' ? <SortAsc className="h-3 w-3 mr-1" /> : <SortDesc className="h-3 w-3 mr-1" />}
                    Sorted by {sortConfig.key}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleClearFilters} className="bg-white hover:bg-gray-50">
                  <Filter className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
                
                {showRefresh && onRefresh && (
                  <Button variant="outline" size="sm" onClick={onRefresh} className="bg-white hover:bg-gray-50">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                )}
                
                {showExport && onExport && (
                  <Button size="sm" onClick={onExport} className="bg-blue-600 hover:bg-blue-700">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="flex justify-between items-center mt-6 mb-4 px-2">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              {paginatedData.length}
            </span>
            <span> of </span>
            <span className="font-medium text-gray-900">
              {filteredAndSortedData.length}
            </span>
            <span> results shown</span>
            {filteredAndSortedData.length !== data.length && (
              <span className="text-blue-600 ml-1">
                (filtered from {data.length} total)
              </span>
            )}
          </div>
        </div>

        {/* Enhanced Table Content */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <TableContent
            columns={columns.map(col => ({
              ...col,
              sortable: true,
              onSort: () => handleSort(col.key)
            }))}
            data={paginatedData}
            hasData={filteredAndSortedData.length > 0}
          />
        </div>

        {/* Enhanced Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredAndSortedData.length}
          onPageChange={handlePageChange}
        />
      </CardContent>
    </Card>
  );
};

export default EnhancedSearchableTable;
