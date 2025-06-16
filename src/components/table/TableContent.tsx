
import React from 'react';
import { Search } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { TableColumn } from '@/types/table';

interface TableContentProps {
  columns: TableColumn[];
  data: any[];
  hasData: boolean;
}

const TableContent = ({ columns, data, hasData }: TableContentProps) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border">
      <div className="min-w-max">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((column) => (
                <TableHead 
                  key={column.key} 
                  className="font-semibold text-foreground whitespace-nowrap px-4 py-3"
                  style={{ 
                    width: column.width, 
                    minWidth: column.minWidth || '120px'
                  }}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasData && data.map((item, index) => (
              <TableRow 
                key={item.id || index} 
                className="hover:bg-muted/30 transition-colors"
              >
                {columns.map((column) => (
                  <TableCell 
                    key={column.key} 
                    className="px-4 py-3 text-sm whitespace-nowrap"
                    style={{ 
                      width: column.width, 
                      minWidth: column.minWidth || '120px'
                    }}
                  >
                    <div className="max-w-full overflow-hidden">
                      {column.render ? column.render(item[column.key], item) : (
                        <span className="truncate block" title={item[column.key]}>
                          {item[column.key]}
                        </span>
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {!hasData && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-2">
            <Search size={48} className="mx-auto" />
          </div>
          <p className="text-foreground/80 text-lg font-medium">No results found</p>
          <p className="text-muted-foreground text-sm">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default TableContent;
