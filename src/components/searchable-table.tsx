"use client";

import { useState, type ReactNode } from "react";

export type SearchableTableColumn = { key: string; label: string };
export type SearchableTableRow = { id: string; searchText: string; cells: ReactNode[] };

type Props = {
  columns: SearchableTableColumn[];
  rows: SearchableTableRow[];
  placeholder: string;
  emptyMessage: string;
};

export function SearchableTable({ columns, rows, placeholder, emptyMessage }: Props) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleRows = normalizedQuery
    ? rows.filter((row) => row.searchText.toLocaleLowerCase().includes(normalizedQuery))
    : rows;

  return <section className="records-table-section">
    <div className="records-toolbar"><p>{visibleRows.length === rows.length ? `${rows.length} records` : `${visibleRows.length} of ${rows.length} records`}</p><label className="records-search"><span className="sr-only">Search records</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} /></label></div>
    <div className="records-table-wrap"><table className="records-table"><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead><tbody>{visibleRows.length ? visibleRows.map((row) => <tr key={row.id}>{columns.map((column, index) => <td key={`${row.id}-${column.key}`}>{row.cells[index] ?? ""}</td>)}</tr>) : <tr><td className="records-table-empty" colSpan={columns.length}>{rows.length ? "No matching records." : emptyMessage}</td></tr>}</tbody></table></div>
  </section>;
}
