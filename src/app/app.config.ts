import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideHighcharts, providePartialHighcharts } from 'highcharts-angular';
// import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),
    provideHighcharts(),
    providePartialHighcharts({
      modules: () => {
        return [
          // Load Gantt Chart
          // Load exporting module
        ];
      },
    }),
    // provideServiceWorker('ngsw-worker.js', {
    //         enabled: !isDevMode(),
    //         registrationStrategy: 'registerWhenStable:30000'
    //       }), provideServiceWorker('ngsw-worker.js', {
    //         enabled: !isDevMode(),
    //         registrationStrategy: 'registerWhenStable:30000'
    //       }),
  ]
};
