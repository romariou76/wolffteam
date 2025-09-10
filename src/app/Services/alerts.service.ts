import { Injectable } from '@angular/core';
import Swal from 'sweetalert2'

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  constructor() { }

   showAlertConfirmacion() {
    Swal.fire({
      title: '¡Éxito!',
      text: 'Operación completada con éxito.',
      icon: 'success',
      timer: 1000,
      showConfirmButton: true
    });
  }

  alertSuccess(mensaje: string) {
  Swal.fire({
    title: mensaje,
    icon: 'success',
    timer: 1000, // 1 segundo = 1000 ms
    showConfirmButton: false
  });
}


  alertError(mensaje: string){
    Swal.fire({
      title: mensaje,
      icon: 'warning',
      confirmButtonText: 'Aceptar',
    });
  }

  alertInfo(mensaje: string){
    Swal.fire({
      title: 'Ups!',
      text: mensaje,
      icon: 'info',
      confirmButtonText: 'Aceptar',
    });
  }

  alertDanger(mensaje: string){
    Swal.fire({
      title: mensaje,
      icon: 'error',
      confirmButtonText: 'Aceptar',
    });
  }


  alertWarning(mensaje: string){
    Swal.fire({
      title: '¡Ups!',
      text: mensaje,
      icon: 'warning',
      confirmButtonText: 'Aceptar',
    });
  }

  InicioSesionExitoso(){
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: 'success',
      title: 'Inicio de sesión con éxito'
    });
  }


  alertaAdvertencia(mensaje: string){
    Swal.fire({
      title: '¡Ups!',
      text: mensaje,
      icon: 'warning',
      confirmButtonText: 'Aceptar',
    });
  }


  alertaAdvertencia2(mensaje: string){
    Swal.fire({
      title: '¡Ups!',
      text: mensaje,
      icon: 'warning',
      timer: 1000, // 1 segundo = 1000 ms
      showConfirmButton: false
    });
  }

  cerrarSesion() {
    Swal.fire({
      title: '¿Seguro que quieres cerrar la sesión?',
      text: 'Se cerrará la sesión actual y se desconectará.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Sesión cerrada', 'La sesión ha sido cerrada correctamente.', 'success');
        localStorage.removeItem("token")
        setTimeout(function() {
          location.reload();
        }, 700);
      }
    });
  }

 async showAlertConfirmacionSalir(){
    let result = await Swal.fire({
      title: '¿Estás seguro de salir?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'No, cancelar'
    });

    if(result.isConfirmed){
      return true
    }else{
      return false
    }
  }

 async showAlertConfirmacionAnular(){
    let result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'No, cancelar'
    });

    if(result.isConfirmed){
      return true
    }else{
      return false
    }
  }

async showConfirmacion(mensaje: string = '¿Deseas continuar?') {
  const { isConfirmed } = await Swal.fire({
    title: 'Confirmar',
    text: mensaje,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'No'
  });
  return isConfirmed;
}


}
