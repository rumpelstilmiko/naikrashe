const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

export const downloadCsv = (filename, columns, rows) => {
  const header = columns.map((column) => escapeCell(column.label)).join(';');
  const lines = rows.map((row) => columns.map((column) => escapeCell(column.get(row))).join(';'));
  const blob = new Blob([`\uFEFF${[header, ...lines].join('\n')}`], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};
