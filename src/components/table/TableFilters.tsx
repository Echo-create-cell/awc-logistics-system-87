
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterOptions } from '@/types/table';

interface TableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  filterOptions: FilterOptions[];
}

const TableFilters = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  filterOptions
}: TableFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 items-center pt-4 mt-4 border-t">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      
      {filterOptions.map((filter) => (
        <Select
          key={filter.key}
          value={filters[filter.key] || '__all__'}
          onValueChange={(value) => onFilterChange(filter.key, value)}
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
    </div>
  );
};

export default TableFilters;
