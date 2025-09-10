import { inject, Injectable } from '@angular/core';
import { AlertsService } from './alerts.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {

  public readonly alertas= inject(AlertsService)

  manejarErroresApi(error: any) {
    if (error.status === 400) {
      this.alertas.alertError(error.error.message || 'Datos inválidos.');
    } else if (error.status === 404) {
      const mensajeError = error.error?.message || JSON.stringify(error.error);
      this.alertas.alertaAdvertencia(mensajeError);
    }
     else if (error.status === 500) {
      const mensajeError = error.error?.message || JSON.stringify(error.error);
      this.alertas.alertaAdvertencia('Error del servidor: ' + mensajeError);
    } else {
      const mensajeDesconocido = error.message || JSON.stringify(error);
      this.alertas.alertError("Error al comunicarse con el servidor");
      // this.alertas.alertaAdvertencia('Error desconocido: ' + mensajeDesconocido);
    }
  }

}
