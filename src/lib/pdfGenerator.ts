import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface ReportHeader {
  barName: string;
  address: string;
  city: string;
  state: string;
  dateRange: { start: Date; end: Date };
  preparedBy: string;
  preparedByEmail: string;
}

interface InventorySummary {
  startInventoryValue: number;
  endInventoryValue: number;
  totalUsage: number;
  totalPurchases: number;
  totalVariance: number;
  pourCostPct: number | null;
  topCostItems: Array<{ name: string; value: number }>;
  topUsageItems: Array<{ name: string; usage: number }>;
}

interface InventoryDetail {
  category: string;
  name: string;
  sizeMl: number;
  costPerBottle: number;
  costPerMl: number;
  startQty: number;
  receivedQty: number;
  usedQty: number;
  endingQty: number;
  physicalQty: number | null;
  varianceQty: number | null;
  varianceValue: number | null;
  currentValue: number;
}

interface UsageSummary {
  date: string;
  bottlesUsed: number;
  mlUsed: number;
  costUsed: number;
}

interface Exception {
  type: 'low_stock' | 'high_variance' | 'missing_data';
  itemName: string;
  details: string;
  value?: number;
}

export interface InventoryReportData {
  header: ReportHeader;
  summary: InventorySummary;
  details: InventoryDetail[];
  usageSummary: UsageSummary[];
  exceptions: Exception[];
}

export function generateInventoryPDF(data: InventoryReportData): ArrayBuffer {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.text(data.header.barName, 105, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFontSize(14);
  doc.text('Inventory Report', 105, yPos, { align: 'center' });
  yPos += 8;
  
  doc.setFontSize(10);
  doc.text(
    `Report Period: ${format(data.header.dateRange.start, 'MMM dd, yyyy')} - ${format(data.header.dateRange.end, 'MMM dd, yyyy')}`,
    105,
    yPos,
    { align: 'center' }
  );
  yPos += 6;
  doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 105, yPos, { align: 'center' });
  yPos += 6;
  doc.text(`Prepared by: ${data.header.preparedBy} (${data.header.preparedByEmail})`, 105, yPos, { align: 'center' });
  yPos += 15;

  // Executive Summary
  doc.setFontSize(16);
  doc.text('Executive Summary', 14, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.text(`Start Inventory Value: $${data.summary.startInventoryValue.toFixed(2)}`, 14, yPos);
  yPos += 6;
  doc.text(`End Inventory Value: $${data.summary.endInventoryValue.toFixed(2)}`, 14, yPos);
  yPos += 6;
  doc.text(`Total Usage: $${data.summary.totalUsage.toFixed(2)}`, 14, yPos);
  yPos += 6;
  doc.text(`Total Purchases: $${data.summary.totalPurchases.toFixed(2)}`, 14, yPos);
  yPos += 6;
  doc.text(`Total Variance: $${data.summary.totalVariance.toFixed(2)}`, 14, yPos);
  yPos += 6;
  if (data.summary.pourCostPct !== null) {
    doc.text(`Pour Cost %: ${data.summary.pourCostPct.toFixed(1)}%`, 14, yPos);
    yPos += 6;
  }
  yPos += 15;

  // Detailed Inventory Table
  doc.setFontSize(14);
  doc.text('Detailed Inventory', 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [['Item', 'Category', 'Start', 'Used', 'Ending', 'Physical', 'Variance', 'Value']],
    body: data.details.map(item => [
      item.name,
      item.category,
      item.startQty.toFixed(1),
      item.usedQty.toFixed(1),
      item.endingQty.toFixed(1),
      item.physicalQty !== null ? item.physicalQty.toFixed(1) : 'N/A',
      item.varianceQty !== null ? item.varianceQty.toFixed(1) : 'N/A',
      `$${item.currentValue.toFixed(2)}`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8 }
  });

  // Top Items Tables
  // @ts-expect-error - autoTable adds lastAutoTable property
  yPos = doc.lastAutoTable.finalY + 10;
  
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.text('Top Cost Items', 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [['Item', 'Value']],
    body: data.summary.topCostItems.map(item => [
      item.name,
      `$${item.value.toFixed(2)}`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 9 }
  });

  // @ts-expect-error - autoTable adds lastAutoTable property
  yPos = doc.lastAutoTable.finalY + 10;

  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.text('Top Usage Items', 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [['Item', 'Bottles Used']],
    body: data.summary.topUsageItems.map(item => [
      item.name,
      item.usage.toFixed(1)
    ]),
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 9 }
  });

  // Usage Summary Table
  if (data.usageSummary.length > 0) {
    // @ts-expect-error - autoTable adds lastAutoTable property
    yPos = doc.lastAutoTable.finalY + 10;
    
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Daily Usage Summary', 14, yPos);
    yPos += 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Bottles Used', 'ML Used', 'Cost']],
      body: data.usageSummary.map(day => [
        day.date,
        day.bottlesUsed.toFixed(1),
        day.mlUsed.toFixed(0),
        `$${day.costUsed.toFixed(2)}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 9 }
    });
  }

  // Exceptions and Alerts
  if (data.exceptions.length > 0) {
    // @ts-expect-error - autoTable adds lastAutoTable property
    yPos = doc.lastAutoTable.finalY + 10;
    
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Exceptions and Alerts', 14, yPos);
    yPos += 8;

    const grouped = {
      low_stock: data.exceptions.filter(e => e.type === 'low_stock'),
      high_variance: data.exceptions.filter(e => e.type === 'high_variance'),
      missing_data: data.exceptions.filter(e => e.type === 'missing_data')
    };

    if (grouped.low_stock.length > 0) {
      doc.setFontSize(12);
      doc.text('Low Stock Items:', 14, yPos);
      yPos += 6;
      
      doc.setFontSize(9);
      grouped.low_stock.forEach(e => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${e.itemName}: ${e.details}`, 20, yPos);
        yPos += 5;
      });
      yPos += 5;
    }

    if (grouped.high_variance.length > 0) {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.text('High Variance Items:', 14, yPos);
      yPos += 6;
      
      doc.setFontSize(9);
      grouped.high_variance.forEach(e => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${e.itemName}: ${e.details}`, 20, yPos);
        yPos += 5;
      });
      yPos += 5;
    }

    if (grouped.missing_data.length > 0) {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.text('Missing Data:', 14, yPos);
      yPos += 6;
      
      doc.setFontSize(9);
      grouped.missing_data.forEach(e => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${e.itemName}: ${e.details}`, 20, yPos);
        yPos += 5;
      });
    }
  }

  return doc.output('arraybuffer');
}
