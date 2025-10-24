'use client';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function DataTable({
  columns,
  data,
  searchKey,
  onView,   // 👈 Added new prop for "View" action
  onEdit,
  onDelete,
}) {
  const [search, setSearch] = useState('');

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, key) => acc && acc[key], obj);
  };

  const filteredData = data.filter((item) => {
    const value = getNestedValue(item, searchKey);
    return typeof value === 'string' && value.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <Input
          placeholder={`Rechercher par ${searchKey}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item._id}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.cell ? column.cell(item) : item[column.key]}
                    </TableCell>
                  ))}

                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {/* 👁️ View Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(item)}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>

                      {/* ✏️ Edit Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(item)}
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>

                      {/* 🗑️ Delete Button */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(item)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center py-8"
                >
                  <div className="text-muted-foreground">
                    Aucun résultat trouvé
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Info */}
      <div className="text-sm text-muted-foreground">
        {filteredData.length} sur {data.length} élément(s)
      </div>
    </div>
  );
}

/* ===== Icons ===== */

function EyeIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M1.5 12s4.5-7.5 10.5-7.5S22.5 12 22.5 12s-4.5 7.5-10.5 7.5S1.5 12 1.5 12z"
      />
      <circle cx="12" cy="12" r="3" strokeWidth={2} stroke="currentColor" />
    </svg>
  );
}

function EditIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414
        a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862
        a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4
        a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}
