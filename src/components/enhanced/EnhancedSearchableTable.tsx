
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
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
    <Card className="w-full">
      <TableHeader title={title} />
      
      <CardContent className="pt-0">
        {/* Enhanced Search and Filter Bar */}
        <div className="space-y-4 pt-4 mt-4 border-t">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Global Search */}
            {globalSearch && (
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search across all fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
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
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All {filter.label}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-auto">
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="mr-2">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
                </Badge>
              )}
              
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <Filter className="mr-1 h-4 w-4" />
                Clear
              </Button>
              
              {showRefresh && onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Refresh
                </Button>
              )}
              
              {showExport && onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="mr-1 h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="flex justify-between items-center mt-4 mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedData.length} of {filteredAndSortedData.length} results
            {filteredAndSortedData.length !== data.length && (
              <span> (filtered from {data.length} total)</span>
            )}
          </p>
          {sortConfig && (
            <Badge variant="outline">
              Sorted by {sortConfig.key} ({sortConfig.direction})
            </Badge>
          )}
        </div>

        {/* Table Content */}
        <div className="mt-6">
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

        {/* Pagination */}
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
