import * as XLSX from 'xlsx';
import { ErrorReport } from '../types';

export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(filename: string, sheetName: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function formatReportsForExport(reports: ErrorReport[]) {
  return reports.map((r, index) => ({
    No: index + 1,
    'No Laporan': r.nomor_laporan,
    Tanggal: r.tanggal,
    Jam: r.jam,
    'Nama Staff': r.nama_staff,
    'ID Staff': r.id_staff,
    Situs: r.situs,
    'Kategori Kesalahan': r.kategori_kesalahan,
    Tingkat: r.tingkat_kesalahan,
    Deskripsi: r.deskripsi_kesalahan,
    'Link Bukti': r.link_bukti || '-',
    Pelapor: r.nama_pelapor,
    Status: r.status,
    'Catatan Admin': r.catatan_admin || '-',
    'Diselesaikan Oleh': r.diselesaikan_oleh || '-',
    'Tgl Selesai': r.tanggal_selesai ? `${r.tanggal_selesai} ${r.jam_selesai}` : '-'
  }));
}

export function printReportsWindow(title: string, reports: ErrorReport[]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const rowsHtml = reports
    .map(
      (r, i) => `
    <tr>
      <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${i + 1}</td>
      <td style="padding: 6px; border: 1px solid #ddd;"><b>${r.nomor_laporan}</b></td>
      <td style="padding: 6px; border: 1px solid #ddd;">${r.tanggal} ${r.jam}</td>
      <td style="padding: 6px; border: 1px solid #ddd;">${r.nama_staff} (${r.id_staff})</td>
      <td style="padding: 6px; border: 1px solid #ddd;">${r.situs}</td>
      <td style="padding: 6px; border: 1px solid #ddd;">${r.kategori_kesalahan}</td>
      <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${r.tingkat_kesalahan}</td>
      <td style="padding: 6px; border: 1px solid #ddd;">${r.deskripsi_kesalahan}</td>
      <td style="padding: 6px; border: 1px solid #ddd; text-align: center;"><b>${r.status}</b></td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - TASK ERROR MONITOR LIGABANDOT</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; color: #111; }
          h1 { margin-bottom: 4px; font-size: 18px; color: #102A0B; }
          h3 { margin-top: 0; font-size: 13px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #102A0B; color: #D4AF37; padding: 8px; border: 1px solid #ddd; font-size: 11px; text-align: left; }
          .header-meta { margin-bottom: 15px; border-bottom: 2px solid #102A0B; padding-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header-meta">
          <h1>TASK ERROR MONITOR - LIGABANDOT</h1>
          <h3>Laporan Rekapitulasi Kesalahan Staff CS (${title})</h3>
          <div>Dicetak pada: ${new Date().toLocaleString('id-ID')} | Total: ${reports.length} Data</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 30px;">No</th>
              <th>No Laporan</th>
              <th>Waktu</th>
              <th>Staff (ID)</th>
              <th>Situs</th>
              <th>Kategori</th>
              <th>Tingkat</th>
              <th>Deskripsi</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
