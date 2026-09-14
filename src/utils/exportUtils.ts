/**
 * Export Utility for Zain Education Center Management System
 * (نظام زين لإدارة الدروس والسناتر - أدوات التصدير إلى Excel, Word, PDF)
 *
 * Rules:
 * - 100% Client-side generation. Zero user data sent to external third-party services.
 * - Supports RTL and Arabic UTF-8 text formatting.
 * - Clean filenames with timestamp.
 */

export interface ExportDataOptions {
  title: string;
  subtitle?: string;
  filename: string;
  columns: { header: string; key: string; width?: number }[];
  rows: Record<string, any>[];
  summary?: { label: string; value: string | number }[];
}

/**
 * 1. Export as Excel-compatible CSV / XML Spreadsheet with UTF-8 BOM and RTL direction
 */
export function exportToExcel(options: ExportDataOptions): void {
  const { title, subtitle, filename, columns, rows, summary } = options;

  let csvContent = '\uFEFF'; // UTF-8 BOM for Arabic support in Excel

  // Header Title
  csvContent += `"${title.replace(/"/g, '""')}"\n`;
  if (subtitle) {
    csvContent += `"${subtitle.replace(/"/g, '""')}"\n`;
  }
  csvContent += `"تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')} ${new Date().toLocaleTimeString('ar-EG')}"\n\n`;

  // Summary if provided
  if (summary && summary.length > 0) {
    csvContent += `"ملخص الأرقام والإحصائيات:"\n`;
    summary.forEach((item) => {
      csvContent += `"${item.label}","${item.value}"\n`;
    });
    csvContent += `\n`;
  }

  // Column Headers
  const headerRow = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(',');
  csvContent += headerRow + '\n';

  // Data Rows
  rows.forEach((row) => {
    const rowContent = columns
      .map((col) => {
        const val = row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(',');
    csvContent += rowContent + '\n';
  });

  // Trigger browser download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 2. Export as Word document (.doc formatted with HTML, RTL, and styled tables)
 */
export function exportToWord(options: ExportDataOptions): void {
  const { title, subtitle, filename, columns, rows, summary } = options;

  const nowStr = new Date().toLocaleDateString('ar-EG') + ' ' + new Date().toLocaleTimeString('ar-EG');

  let summaryHtml = '';
  if (summary && summary.length > 0) {
    summaryHtml = `
      <div style="margin-bottom: 20px; padding: 12px; background-color: #f1f5f9; border-radius: 8px; border: 1px solid #cbd5e1;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 14pt;">ملخص الإحصائيات:</h3>
        <table style="width: 100%; font-size: 11pt; border-collapse: collapse;">
          ${summary
            .map(
              (s) =>
                `<tr><td style="padding: 4px 8px; font-weight: bold; color: #334155;">${s.label}:</td><td style="padding: 4px 8px; font-weight: bold; color: #0284c7;">${s.value}</td></tr>`
            )
            .join('')}
        </table>
      </div>
    `;
  }

  const tableHeaders = columns
    .map(
      (c) =>
        `<th style="background-color: #0f172a; color: #ffffff; padding: 10px; border: 1px solid #334155; text-align: right; font-size: 11pt;">${c.header}</th>`
    )
    .join('');

  const tableRows = rows
    .map(
      (r, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        ${columns
          .map(
            (c) =>
              `<td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right; font-size: 10.5pt; color: #1e293b;">${
                r[c.key] !== undefined && r[c.key] !== null ? r[c.key] : '—'
              }</td>`
          )
          .join('')}
      </tr>
    `
    )
    .join('');

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; text-align: right; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        h1 { color: #0284c7; font-size: 20pt; margin-bottom: 4px; }
        p.subtitle { color: #64748b; font-size: 11pt; margin-top: 0; }
        .footer { margin-top: 30px; font-size: 9pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
      </style>
    </head>
    <body dir="rtl">
      <h1>${title}</h1>
      ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
      <p style="font-size: 10pt; color: #64748b;">تاريخ الاستخراج: ${nowStr} | نظام زين لإدارة الدروس والسناتر</p>
      ${summaryHtml}
      <table>
        <thead><tr>${tableHeaders}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="footer">
        تم استخراج هذا التقرير تلقائياً عبر نظام زين لإدارة السناتر والمجموعات التعليمية.
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 3. Export as PDF (Client-side clean print window with auto-trigger or download dialog)
 */
export function exportToPDF(options: ExportDataOptions): void {
  const { title, subtitle, columns, rows, summary } = options;

  const nowStr = new Date().toLocaleDateString('ar-EG') + ' ' + new Date().toLocaleTimeString('ar-EG');

  let summaryHtml = '';
  if (summary && summary.length > 0) {
    summaryHtml = `
      <div class="summary-box">
        <div class="summary-title">ملخص الإحصائيات والأرقام:</div>
        <div class="summary-grid">
          ${summary
            .map(
              (s) =>
                `<div class="summary-item"><span class="label">${s.label}:</span> <span class="val">${s.value}</span></div>`
            )
            .join('')}
        </div>
      </div>
    `;
  }

  const tableHeaders = columns.map((c) => `<th>${c.header}</th>`).join('');
  const tableRows = rows
    .map(
      (r, idx) => `
      <tr class="${idx % 2 === 0 ? 'even' : 'odd'}">
        ${columns
          .map(
            (c) =>
              `<td>${r[c.key] !== undefined && r[c.key] !== null ? r[c.key] : '—'}</td>`
          )
          .join('')}
      </tr>
    `
    )
    .join('');

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // If popup blocked, notify or print current
    alert('يرجى السماح بالنوافذ المنبثقة لطباعة أو حفظ التقرير بصيغة PDF.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>${title} - نظام زين</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        body {
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          direction: rtl;
          text-align: right;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 10px;
        }
        .header-box {
          border-bottom: 2px solid #0284c7;
          padding-bottom: 12px;
          margin-bottom: 15px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        h1 { margin: 0 0 6px 0; color: #0369a1; font-size: 18pt; }
        .subtitle { margin: 0; color: #475569; font-size: 11pt; }
        .meta { font-size: 9pt; color: #64748b; text-align: left; }
        .summary-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 16px;
        }
        .summary-title { font-weight: bold; font-size: 11pt; color: #0f172a; margin-bottom: 8px; }
        .summary-grid { display: flex; flex-wrap: wrap; gap: 15px; }
        .summary-item { font-size: 10pt; }
        .summary-item .label { color: #64748b; font-weight: 500; }
        .summary-item .val { color: #0369a1; font-weight: bold; margin-right: 4px; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 10pt;
        }
        th {
          background-color: #0f172a;
          color: #ffffff;
          padding: 8px 10px;
          border: 1px solid #334155;
          text-align: right;
          font-weight: 600;
        }
        td {
          padding: 7px 10px;
          border: 1px solid #cbd5e1;
          text-align: right;
        }
        tr.odd { background-color: #f8fafc; }
        .footer {
          margin-top: 25px;
          border-top: 1px solid #cbd5e1;
          padding-top: 8px;
          font-size: 8.5pt;
          color: #94a3b8;
          display: flex;
          justify-content: space-between;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 15px; padding: 10px; background: #e0f2fe; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 11pt; color: #0369a1; font-weight: 600;">جاهز للحفظ بصيغة PDF أو الطباعة المباشرة</span>
        <button onclick="window.print()" style="padding: 6px 16px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">طباعة / حفظ PDF</button>
      </div>

      <div class="header-box">
        <div>
          <h1>${title}</h1>
          ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
        </div>
        <div class="meta">
          <div>نظام زين لإدارة السناتر</div>
          <div>تاريخ: ${nowStr}</div>
        </div>
      </div>

      ${summaryHtml}

      <table>
        <thead><tr>${tableHeaders}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>

      <div class="footer">
        <span>تم الاستخراج من قاعدة بيانات سنتر زين التعليمية بنجاح.</span>
        <span>صفحة 1 من 1</span>
      </div>

      <script>
        window.onload = function() {
          // Auto trigger print after short render delay
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
