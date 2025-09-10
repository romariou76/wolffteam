import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReporteVenta, Venta } from '../Interfaces/Gestion/Venta';
import { Pago } from '../Interfaces/Pago';
import { Suscripcion } from '../Interfaces/Suscripcion';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }


exportarReporteVentas(data: ReporteVenta[], desde: Date, hasta: Date) {

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });


  const logo = new Image();
  logo.src = 'imgs/logo.png';
   const aspectRatio = logo.width / logo.height;
 const height = 13;
  const width = height * aspectRatio;

  doc.addImage(logo, 'PNG', 7, 11, width, height);

  const total = data.reduce((sum, item) => sum + item.total, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`REPORTE DE PAGOS DEL ${this.setFecha(desde)} HASTA ${this.setFecha(hasta)}`, 105, 20, { align: 'center' });

  const head = [['N°', 'CLIENTE', 'FECHA REGISTRO', 'FORMA DE PAGO','TOTAL', 'REGISTRADO POR']];

  const body: any = data.map((e, i) => [
    e.id,
    e.cliente,
    this.setFecha(e.fechaRegistro),
    e.formaDePago,
    `S/ ${e.total.toFixed(2)}`,
    e.registradoPor,
  ]);

 const totalRow = [
  { content: 'TOTAL', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
  { content: `S/ ${total.toFixed(2)}`, styles: { fontStyle: 'bold' } },
  '', '', ''
];
  body.push(totalRow);

  autoTable(doc, {
    startY: 35,
    head: head,
    body: body,
    theme: 'grid',
    styles: {
      fontSize: 7,
    },
    headStyles: {
      fillColor: "#e6e6e6",
      lineColor: "#8b8b8b",
      lineWidth: 0.1,
      textColor: '#000000',
    },
    bodyStyles: {
      textColor: '#000000',
    },
    footStyles:{
      fillColor: "#ffffff",

    },
    didParseCell: function (data) {
      if (data.row.index === body.length - 1) {
        data.cell.styles.fillColor = [255, 255, 255];
        data.cell.styles.textColor = [0, 0, 0];
      }
    }
  });

  doc.save('reporte-venta.pdf');
}



exportarReportePagos(data: Pago[], desde: Date, hasta: Date) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });


  const logo = new Image();
  logo.src = 'imgs/logo.png';
   const aspectRatio = logo.width / logo.height;
 const height = 13; // Altura deseada
  const width = height * aspectRatio; // Ancho proporcional

  doc.addImage(logo, 'PNG', 7, 11, width, height);

  const total = data.reduce((sum, item) => sum + item.monto, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`REPORTE DE PAGOS DEL ${this.setFecha(desde)} HASTA ${this.setFecha(hasta)}`, 105, 20, { align: 'center' });

  const head = [['N°', 'CLIENTE', 'TIPO', 'FECHA', 'TOTAL', 'FORMA DE PAGO', 'REGISTRADO POR', 'OBSERVACIONES']];

  const body: any = data.map((e, i) => [
    i + 1,
    e.cliente,
    e.tipoMovimientoAsociado,
    this.setFecha(e.fechaPago),
    `S/ ${e.monto.toFixed(2)}`,
    e.formaDePago,
    e.registradoPor,
    e.observaciones
  ]);

 const totalRow = [
  { content: 'TOTAL GENERAL', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
  { content: `S/ ${total.toFixed(2)}`, styles: { fontStyle: 'bold' } },
  '', '', ''
];
  body.push(totalRow);

  autoTable(doc, {
    startY: 35,
    head: head,
    body: body,
    theme: 'grid',
    styles: {
      fontSize: 7,
    },
    headStyles: {
      fillColor: "#e6e6e6",
      lineColor: "#8b8b8b",
      lineWidth: 0.1,
      textColor: '#000000',
    },
    bodyStyles: {
      textColor: '#000000',
    },
    footStyles:{
      fillColor: "#ffffff",

    },
    didParseCell: function (data) {
      if (data.row.index === body.length - 1) {
        data.cell.styles.fillColor = [255, 255, 255];
        data.cell.styles.textColor = [0, 0, 0];
      }
    }
  });

  doc.save('reporte-pagos.pdf');
}


exportarReporteInscripciones(data: Suscripcion[], desde: Date, hasta: Date) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const logo = new Image();
  logo.src = 'imgs/logo.png';
  const aspectRatio = logo.width / logo.height;
  const height = 13;
  const width = height * aspectRatio;

  doc.addImage(logo, 'PNG', 7, 11, width, height);

  const total = data.reduce((sum, item) => sum + item.total, 0);
  const totalPagado = data.reduce((sum, item) => sum + item.totalPagado, 0);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`REPORTE DE INSCRIPCIONES DEL ${this.setFecha(desde)} HASTA ${this.setFecha(hasta)}`, 148, 20, { align: 'center' });

  const head = [[
    'N°', 'CODIGO', 'CLIENTE', 'PLAN', 'PERIODO', 'TOTAL', 'TOTAL PAGADO', 'PAGADO', 'ESTADO', 'FECHA REGISTRO', 'REGISTRADO POR'
  ]];

  const body: any = data.map((e, i) => [
    i + 1,
    e.codigo,
    e.cliente,
    e.plan,
    `${this.setFecha(e.fechaInicio)} - ${this.setFecha(e.fechaFin)}`,
    `S/ ${e.total.toFixed(2)}`,
    `S/ ${e.totalPagado.toFixed(2)}`,
    e.pagado ? 'SI' : 'NO',
    e.estado,
    this.setFecha(e.fechaRegistro),
    e.creadoPor
  ]);

  const totalRow = [
    { content: 'TOTAL', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
    { content: `S/ ${total.toFixed(2)}`, styles: { fontStyle: 'bold' } },
    { content: `S/ ${totalPagado.toFixed(2)}`, styles: { fontStyle: 'bold' } },
    '', '', '', ''
  ];
  body.push(totalRow);

  autoTable(doc, {
    startY: 35,
    head: head,
    body: body,
    theme: 'grid',
    styles: {
      fontSize: 7,
    },
    headStyles: {
      fillColor: "#e6e6e6",
      lineColor: "#8b8b8b",
      lineWidth: 0.1,
      textColor: '#000000',
    },
    bodyStyles: {
      textColor: '#000000',
    },
    footStyles: {
      fillColor: "#ffffff",
    },
    didParseCell: function (data) {
      if (data.row.index === body.length - 1) {
        data.cell.styles.fillColor = [255, 255, 255];
        data.cell.styles.textColor = [0, 0, 0];
      }
    }
  });

  doc.save('reporte-inscripciones.pdf');
}








  setFecha(fecha: Date): string {
    let f = new Date(fecha).toLocaleDateString('es-ES');
    return f;
  }

}
