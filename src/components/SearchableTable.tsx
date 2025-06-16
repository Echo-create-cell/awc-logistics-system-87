
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SearchableTableProps } from '@/types/table';
import TableHeader from './table/TableHeader';
import TableFilters from './table/TableFilters';
import TableContent from './table/TableContent';
import TablePagination from './table/TablePagination';

const SearchableTable = ({
  title,
  data,
  columns,
  searchFields,
  filterOptions = [],
  itemsPerPage = 10,
}: SearchableTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

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

  return (
    <Card className="w-full">
      <TableHeader title={title} />
      
      <CardContent className="pt-0">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={handleFilterChange}
          filterOptions={filterOptions}
        />
        
        <div className="mt-6">
          <TableContent
            columns={columns}
            data={paginatedData}
            hasData={filteredData.length > 0}
          />
        </div>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredData.length}
          onPageChange={handlePageChange}
        />
      </CardContent>
    </Card>
  );
};

export default SearchableTable;
