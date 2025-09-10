import { Component, inject, signal } from '@angular/core';
import * as Highcharts from 'highcharts';
import {
  HighchartsChartDirective,
  ChartConstructorType,
} from 'highcharts-angular';

import { HighchartsChartComponent } from 'highcharts-angular';

import ExportingModule from 'highcharts/modules/exporting';
import ExportDataModule from 'highcharts/modules/export-data';
import { AlertsService } from '../../../../../Services/alerts.service';
import { GetApiService } from '../../../../../Services/get-api.service';
import { Pago, PagosPorMesDto } from '../../../../../Interfaces/Pago';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { PostApiService } from '../../../../../Services/post-api.service';
import { firstValueFrom } from 'rxjs';
import { DashboardPie, TopProductosVendidos } from '../../../../../Interfaces/Dashboard/TopProductosVendidos';

@Component({
  selector: 'app-dashboard-ventas',
  imports: [
    HighchartsChartDirective,
    HighchartsChartComponent,
    CommonModule,
    FormsModule,
    MatSelectModule,
  ],
  templateUrl: './dashboard-ventas.component.html',
  styleUrl: './dashboard-ventas.component.css',
})
export class DashboardVentasComponent {
  Highcharts: typeof Highcharts = Highcharts;

  chartConstructor: ChartConstructorType = 'chart';
  updateFlag: boolean = false;
  oneToOneFlag: boolean = true;

  postApi = inject(PostApiService);
  getApi = inject(GetApiService);
  alerts = inject(AlertsService);

  listaTabla = signal<PagosPorMesDto[]>([]);
  listaTotal = signal<PagosPorMesDto[]>([]);
  meses = signal<string[]>([]);
  montos = signal<number[]>([]);
  anios: number[] = [2024, 2025, 2026, 2027, 2028, 2029];
  anioSeleccionado: number = new Date().getFullYear();

  total = signal<number>(0);
  totalDelDia = signal<number>(0);
  totalCantidad = signal<number>(0);
  totalCantidadDia = signal<number>(0);

  dashboardProductos = signal<TopProductosVendidos[]>([]);
  listaProductos = signal<string[]>([]);
  montosProducto = signal<number[]>([]);
  datosPie = signal<DashboardPie[]>([])

  chartOptions: Highcharts.Options = {};
  chartOptionsPie: Highcharts.Options = {};

  async GetVentasTotal() {
    let resp = await this.getApi.getVentasTotal();
    this.total.set(resp.totalVenta)
    this.totalDelDia.set(resp.ventaHoy)
    this.totalCantidad.set(resp.cantidadTotalItems)
    this.totalCantidadDia.set(resp.cantidadItemsHoy)
  }

  async GetVentasByYear(year: number) {
    let resp = await this.getApi.getVentasByYear(year);
    this.listaTotal.set(resp);
    this.setMesesYMontos();
    this.updateChart();
  }

  onSeleccionarAnio(anio: number) {
    this.GetVentasByYear(anio);
  }

  setMesesYMontos() {
    const meses: string[] = [];
    const montos: number[] = [];
    this.listaTotal().forEach((element) => {
      meses.push(element.mes.toUpperCase());
      montos.push(element.total);
    });
    this.meses.set(meses);
    this.montos.set(montos);
  }

  async ngOnInit() {
     this.GetVentasTotal()
    this.getTopProductosVendidos(2025);
    let año = new Date().getFullYear();
    this.GetVentasByYear(año);
  }

 async getTopProductosVendidos(year: number) {
  const resp = await firstValueFrom(this.postApi.postTopProductosVendidos(year));
  const data: TopProductosVendidos[] = resp;
  const colores: string[] = [
    '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
    '#3B3EAC', '#0099C6', '#DD4477', '#66AA00', '#B82E2E'
  ];

  const productos: string[] = [];
  const montos: number[] = [];
  const datosPie: DashboardPie[] = [];

  data.forEach((element, index) => {
    productos.push(element.producto);
    montos.push(element.montoTotal);
    datosPie.push({
      name: element.producto,
      y: element.montoTotal,
      color: colores[index % colores.length]
    });
  });

  this.listaProductos.set(productos);
  this.montosProducto.set(montos);
  this.datosPie.set(datosPie);
  this.buildChartPie();
}

  updateChart() {
    this.chartOptions = {
      chart: {
        type: 'column',
      },
      title: {
        text: 'Total de ventas por mes',
      },
      xAxis: {
        categories: this.meses(),
        crosshair: true,
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Monto total (S/.)',
        },
      },
      tooltip: {
        valueSuffix: ' soles',
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
        },
      },
      series: [
        {
          type: 'column',
          name: '',
          // name: 'Pagos',
          data: this.montos(),
        },
      ],
    };
  }

  buildChartPie() {
    this.chartOptionsPie = {
      chart: {
        type: 'pie',
        plotBorderWidth: 0,
        plotShadow: false,
      },
      title: {
        text: 'Top productos vendidos',
      },
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            menuItems: [
              'downloadPNG',
              'downloadJPEG',
              'downloadPDF',
              'downloadSVG',
              'separator',
              'downloadCSV',
              'downloadXLS',
            ],
          },
        },
      },
      tooltip: {
        valueSuffix: '%',
      },

      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format:
              '<span style="font-size: 1.2em"><b>{point.name}</b>' +
              '</span><br>' +
              '<span style="opacity: 0.6">{point.percentage:.1f} ' +
              '%</span>',
            connectorColor: 'rgba(128,128,128,0.5)',
          },
        },
      },

      series: [
        {
          type: 'pie',
          name: 'Percentage',
          data:
           this.datosPie()
          ,
        },
      ],
    };
  }
}
