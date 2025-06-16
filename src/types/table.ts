
export interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
  minWidth?: string;
}

export interface SearchableTableProps {
  title: string;
  data: any[];
  columns: TableColumn[];
  searchFields: string[];
  onView?: (item: any) => void;
  onPrint?: (item: any) => void;
  onDownload?: (item: any) => void;
  filterOptions?: { key: string; label: string; options: { value: string; label: string }[] }[];
  itemsPerPage?: number;
}

export interface FilterOptions {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}
