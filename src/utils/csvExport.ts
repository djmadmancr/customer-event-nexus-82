
export const exportToCSV = (events: any[], filename: string = 'events') => {
  if (!events || events.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Prepare CSV headers
  const headers = [
    'EventId',
    'Customer',
    'Date',
    'Currency',
    'Total',
    'Status',
    'Paid',
    'Outstanding'
  ];

  // Convert events to CSV rows
  const csvRows = events.map(event => {
    const customer = event.customers ? event.customers.name : 'N/A';
    const total = parseFloat(event.total.toString()) || 0;
    const paid = 0; // TODO: Calculate from payments when implemented
    const outstanding = total - paid;

    return [
      event.id,
      `"${customer}"`,
      event.date,
      event.currency || 'USD',
      total.toFixed(2),
      event.status,
      paid.toFixed(2),
      outstanding.toFixed(2)
    ].join(',');
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...csvRows].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
