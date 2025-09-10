
import {
  Component,
  inject,
  signal,
} from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartDirective, ChartConstructorType } from 'highcharts-angular';

import { HighchartsChartComponent } from 'highcharts-angular';


import ExportingModule from 'highcharts/modules/exporting';
import ExportDataModule from 'highcharts/modules/export-data';
import { AlertsService } from '../../../../../Services/alerts.service';
import { GetApiService } from '../../../../../Services/get-api.service';
import { Pago, PagosPorMesDto } from '../../../../../Interfaces/Pago';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-dashboard-pagos',
  imports: [
    HighchartsChartDirective,
    HighchartsChartComponent,
    CommonModule,
    FormsModule,
    MatSelectModule
  ],

  templateUrl: './dashboard-pagos.component.html',
  styleUrl: './dashboard-pagos.component.css'
})
export class DashboardPagosComponent {

  Highcharts: typeof Highcharts = Highcharts;

  chartConstructor: ChartConstructorType = 'chart';
  updateFlag: boolean = false;
  oneToOneFlag: boolean = true;


  getApi = inject(GetApiService);
  alerts = inject(AlertsService);

  listaTabla = signal<PagosPorMesDto[]>([]);


  listaTotal = signal<PagosPorMesDto[]>([]);
  meses = signal<string[]>([])
  montos = signal<number[]>([])

  total = signal<number>(0)
  totalDelDia = signal<number>(0);


  anios: number[] = [2024,2025, 2026, 2027, 2028, 2029];
  anioSeleccionado: number = new Date().getFullYear();


  async GetData(year: number) {
    let resp = await this.getApi.getPagoByYear(year);
    this.listaTotal.set(resp);
    this.setMesesYMontos()
    this.updateChart();
  }

  async getPagos() {
    let resp = await this.getApi.getPago();

    let total = 0;
    resp.forEach((element) => {
      total += element.monto;
    });
    this.total.set(total);

    const hoy = new Date();
    const pagosDelDia = resp.filter(pago => {
      const fechaPago = new Date(pago.fechaPago);
      return (
        fechaPago.getFullYear() === hoy.getFullYear() &&
        fechaPago.getMonth() === hoy.getMonth() &&
        fechaPago.getDate() === hoy.getDate()
      );
    });

    const totalActual = this.totalDelDia();
    const nuevoTotal = pagosDelDia.reduce((acc, pago) => acc + pago.monto, 0);

    this.totalDelDia.set(totalActual + nuevoTotal);
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


  onSeleccionarAnio(anio: number) {
    console.log('Año seleccionado:', anio);
    this.GetData(anio)
  }

  chartOptions: Highcharts.Options = {}
  chartOptionsPie: Highcharts.Options = {}

  updateChart() {
    this.chartOptions = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Total de pagos por mes'
      },
      xAxis: {
        categories: this.meses(),
        crosshair: true
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Monto total (S/.)'
        }
      },
      tooltip: {
        valueSuffix: ' soles'
      },
      legend: {
        enabled: false  // 👈 esto oculta el punto
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        }
      },
      series: [
        {
          type: 'column',
          name: '',
          // name: 'Pagos',
          data: this.montos()
        }
      ]
    };

  }

  ngOnInit() {
    let año = new Date().getFullYear();
    this.GetData(año)
    this.buildChartPie()
    this.getPagos()
  }


  buildChartPie() {
    this.chartOptionsPie = {
      chart: {
        type: 'pie',
        plotBorderWidth: 0,
        plotShadow: false
      },
      title: {
        text: 'Pagos por concepto'
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
              'downloadXLS'
            ]
          }
        }
      },
      tooltip: {
        valueSuffix: '%'
      },

      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<span style="font-size: 1.2em"><b>{point.name}</b>' +
              '</span><br>' +
              '<span style="opacity: 0.6">{point.percentage:.1f} ' +
              '%</span>',
            connectorColor: 'rgba(128,128,128,0.5)'
          }
        }
      },

      series: [
        {
          type: 'pie',
          name: 'Percentage',
          data: [
            {
              name: 'VENTAS',
              y: 700,
              color: '#4CAF50'
            },
            {
              name: 'INSCRIPCIONES',
              color: '#9C27B0',
              // sliced: true,
              // selected: true,
              y: 1500.71
            },
            {
              name: 'INGRESOS',
              color: '#2196F3',
              y: 400
            },
          ]
        }
      ]
    }
  }

}
