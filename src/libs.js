// Bibliotecas empacotadas no build (antes vinham de CDNs externos).
// Assim nenhum script de terceiros roda na página e as versões ficam fixas e auditadas (npm audit).
import Chart from 'chart.js/auto';
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
import * as XLSX from 'xlsx';

applyPlugin(jsPDF); // mantém doc.autoTable(...)
window.Chart = Chart;
window.jspdf = { jsPDF };
window.XLSX = XLSX;
