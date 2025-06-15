
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface SearchableTableProps {
  title: string;
  data: any[];
  columns: TableColumn[];
  searchFields: string[];
  onView?: (item: any) => void;
  onPrint?: (item: any) => void;
  onDownload?: (item: any) => void;
  filterOptions?: { key: string; label: string; options: { value: string; label: string }[] }[];
}

const SearchableTable = ({
  title,
  data,
  columns,
  searchFields,
  filterOptions = []
}: SearchableTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Search filter
      const matchesSearch = searchFields.some(field => 
        item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Additional filters
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value || value === '__all__') return true;
        return item[key] === value;
      });

      return matchesSearch && matchesFilters;
    });
  }, [data, searchTerm, filters, searchFields]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-700">
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 items-center pt-4 border-t">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          {filterOptions.map((filter) => (
            <Select
              key={filter.key}
              value={filters[filter.key] || '__all__'}
              onValueChange={(value) => handleFilterChange(filter.key, value)}
            >
              <SelectTrigger className="w-[180px] border-gray-300">
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
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm">
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <Search size={48} className="mx-auto" />
              </div>
              <p className="text-gray-500 text-lg">No results found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchableTable;
