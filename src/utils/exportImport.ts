import { EnergyData } from '@/types/energy';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { Builder } from 'xml2js';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportToCSV = (data: EnergyData[], filename: string = 'energy-data.csv') => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
};

export const exportToExcel = (data: EnergyData[], filename: string = 'energy-data.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Energy Data');
  
  // Auto-size columns
  const maxWidth = data.reduce((max, row) => {
    Object.keys(row).forEach(key => {
      const cellLength = String(row[key as keyof EnergyData] || '').length;
      max[key] = Math.max(max[key] || 0, cellLength);
    });
    return max;
  }, {} as Record<string, number>);
  
  worksheet['!cols'] = Object.keys(maxWidth).map(key => ({ width: Math.max(maxWidth[key], 10) }));
  
  XLSX.writeFile(workbook, filename);
};

export const exportToPDF = (data: EnergyData[], filename: string = 'energy-data.pdf') => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Energy Consumption Report', 14, 22);
  
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);
  
  const columns = [
    { title: 'Date', dataKey: 'date' },
    { title: 'Consumption (kWh)', dataKey: 'energyConsumption' },
    { title: 'Cost ($)', dataKey: 'energyCost' },
    { title: 'Saved (kWh)', dataKey: 'energySaved' },
    { title: 'Money Saved ($)', dataKey: 'moneySaved' },
    { title: 'Savings %', dataKey: 'savingsPercentage' },
  ];
  
  doc.autoTable({
    columns,
    body: data,
    startY: 45,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: {
      energyConsumption: { halign: 'right' },
      energyCost: { halign: 'right' },
      energySaved: { halign: 'right' },
      moneySaved: { halign: 'right' },
      savingsPercentage: { halign: 'right' },
    },
  });
  
  doc.save(filename);
};

export const exportToJSON = (data: EnergyData[], filename: string = 'energy-data.json') => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, filename);
};

export const exportToXML = (data: EnergyData[], filename: string = 'energy-data.xml') => {
  const builder = new Builder();
  const xml = builder.buildObject({ energyData: { record: data } });
  const blob = new Blob([xml], { type: 'application/xml' });
  saveAs(blob, filename);
};

export const importFromCSV = (file: File): Promise<EnergyData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const data = results.data.map((row: any, index: number) => ({
            id: row.id || `imported-${Date.now()}-${index}`,
            date: row.date || '',
            energyConsumption: parseFloat(row.energyConsumption) || 0,
            energyCost: parseFloat(row.energyCost) || 0,
            energySaved: parseFloat(row.energySaved) || 0,
            moneySaved: parseFloat(row.moneySaved) || 0,
            savingsPercentage: parseFloat(row.savingsPercentage) || 0,
          }));
          resolve(data.filter(item => item.date)); // Filter out empty rows
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error),
    });
  });
}; 