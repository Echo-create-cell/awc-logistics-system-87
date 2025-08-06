
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface TableHeaderProps {
  title: string;
}

const TableHeader = ({ title }: TableHeaderProps) => {
  return (
    <CardHeader className="pb-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and filter through the records.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download size={14} />
          <span className="font-medium">Export Data</span>
        </Button>
      </div>
    </CardHeader>
  );
};

export default TableHeader;
