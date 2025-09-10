import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { AlertsService } from '../../Services/alerts.service';
import { LoginDTO } from '../../Interfaces/LoginDTO';
import { ErrorsService } from '../../Services/errors.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    MatIcon,
    MatButtonModule,
    RouterLink,
    FormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  logo: string = 'imgs/escudo-sin.png'
  logo_letras: string = 'imgs/letras.png'

  public readonly authService = inject(AuthService)
  public readonly errorsService = inject(ErrorsService)

  public readonly alertas = inject(AlertsService)
  public readonly router = inject(Router)
  public hide = signal(true);
  isSending = signal<boolean>(false)

  public numeroDocumento = signal("")
  public password = signal("")

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  ngOnInit() {
    if (this.authService.esTokenValido()) {
      this.router.navigate(["plataforma/visitas"]);
    }
  }

  async clickLogin() {
    if (!this.numeroDocumento() || !this.password()) {
      this.alertas.alertDanger("Ingrese sus credenciales por favor")
      return;
    }
    let usuario: LoginDTO = {
      numeroDocumento: this.numeroDocumento(),
      password: this.password()
    }
    this.isSending.set(true)
    try {
      const resp = await firstValueFrom(this.authService.LoginVendedor(usuario));
      if (resp == '444') {
        this.isSending.set(false)
        this.alertas.alertDanger("Credenciales Incorrectas")
        return;
      }
      this.isSending.set(false)
      localStorage.setItem("token", resp);
      this.alertas.InicioSesionExitoso()
      location.reload()
    } catch (error) {
      this.isSending.set(false)
      this.errorsService.manejarErroresApi(error)
    }
  }

}
