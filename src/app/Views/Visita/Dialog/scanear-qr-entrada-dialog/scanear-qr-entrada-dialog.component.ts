import { ChangeDetectorRef, Component, inject, signal, ViewChild } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { NgxScannerQrcodeComponent } from 'ngx-scanner-qrcode';
import Swal from 'sweetalert2';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoaderComponent } from '../../../../Components/loader/loader.component';
import { PostApiService } from '../../../../Services/post-api.service';
import { ErrorsService } from '../../../../Services/errors.service';
import { AuthService } from '../../../../Services/auth.service';

@Component({
  selector: 'app-scanear-qr-entrada-dialog',
  imports: [
    QRCodeComponent,
    NgxScannerQrcodeComponent,
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    LoaderComponent
  ],
  templateUrl: './scanear-qr-entrada-dialog.component.html',
  styleUrl: './scanear-qr-entrada-dialog.component.css'
})
export class ScanearQrEntradaDialogComponent {


  constructor(public dialogRef: MatDialogRef<ScanearQrEntradaDialogComponent>) {


    // this.myAngularxQrCode = JSON.stringify(this.data);
    // this.myAngularxQrCode = 'Your QR code data string';
  }

  //  ESCANEAR DESDE CAMARA -----------------

  @ViewChild('scanner', { static: false })
  scanner!: NgxScannerQrcodeComponent;
  showScanner = true;
  showScannerContent = false;
  private yaMostrado = false;
  canStartScan = false;

  postApi = inject(PostApiService)
  errorService = inject(ErrorsService)
  idPase = signal<number>(0)
  idCliente = signal<number>(0)
  authService = inject(AuthService);
  idUsuario = signal<number>(0)

  async ngAfterViewInit() {
    try {
      await lastValueFrom(this.scanner.start());

      const devices = this.scanner.devices.value;
      if (devices && devices.length > 0) {
        this.canStartScan = true;
        this.startScan()
      } else {
        Swal.fire("Error", "No se detectaron cámaras disponibles", "error");
      }
    } catch (err) {
      Swal.fire("Error", "No se pudo acceder a la cámara", "error");
    }
  }


  async startScan() {
    try {
      setTimeout(async () => {
        if (!this.scanner) return;

        const devices = this.scanner.devices.value;
        if (!devices || devices.length === 0) {
          Swal.fire("Error", "No se detectaron cámaras disponibles", "error");
          return;
        }
        const backCam = devices.find((d: any) =>
          d.label.toLowerCase().includes("back") ||
          d.label.toLowerCase().includes("environment")
        );

        const deviceId = backCam ? backCam.deviceId : devices[0].deviceId;
        await this.scanner.playDevice(deviceId);
        this.showScannerContent = true;
        console.log("📷 Usando cámara:", backCam?.label || devices[0].label);
        this.yaMostrado = false;
      }, 800);
    } catch (err) {
      Swal.fire("Error", "No se pudo acceder a la cámara", "error");
    }
  }

  async onScanSuccess(event: any) {
    if (this.yaMostrado) return;
    this.yaMostrado = true;
    // console.log("QR completo:", event);
    const rawValue = event[0]?.value;
    let contenido: any;
    try {
      contenido = JSON.parse(rawValue);
    } catch {
      contenido = rawValue;
    }


    if (!contenido.idPase || !contenido.idCliente) {
      Swal.fire({
        title: '❌ QR inválido',
        text: 'No se encontraron los datos necesarios en el QR.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      this.yaMostrado = false;
      return;
    }

    this.scanner.stop();
    this.showScannerContent = false;

    const resp = await this.usarEntrada(contenido.idPase, contenido.idCliente);

    if (resp === "201") {
      Swal.fire({
        title: '📌 Ingreso autorizado',
        html: `
      <p><b></b> ${contenido.cliente}</p>
      <p>Entrada registrada correctamente ✅</p>
    `,
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        this.yaMostrado = false;
        this.dialogRef.close("si");
      });
    }
    else if (resp === "202") {
      Swal.fire({
        title: '📌 Ingreso autorizado',
        html: `
      <p><b></b> ${contenido.cliente}</p>
      <p>Ya usó su entrada hoy ⏱</p>
    `,
        icon: 'info',
        confirmButtonText: 'OK'
      }).then(() => {
        this.yaMostrado = false;
        this.dialogRef.close();
      });
    }
    else if (resp === "203") {
      Swal.fire({
        title: '❌ Ingreso no autorizado',
        html: `
      <p><b></b> ${contenido.cliente}</p>
      <p>No hay entradas disponibles 🚫</p>
    `,
        icon: 'error',
        confirmButtonText: 'OK'
      }).then(() => {
        this.yaMostrado = false;
        this.dialogRef.close();
      });
    }
    else {
      Swal.fire({
        title: '⚠️ Error del servidor',
        html: `<p>Intente nuevamente más tarde</p>`,
        icon: 'warning',
        confirmButtonText: 'OK'
      }).then(() => {
        this.yaMostrado = false;
        this.dialogRef.close();
      });
    }
  }

  async usarEntrada(paseId: number, idCliente: number) {
    try {
      const resp = await firstValueFrom(this.postApi.postUsarEntrada(paseId, idCliente, this.idUsuario()));
      return resp;
    } catch (error: any) {
      this.errorService.manejarErroresApi(error)
      return;
    }
  }

  ngOnInit() {
    let idUsuario = this.authService.GetIdUsuario()
    this.idUsuario.set(idUsuario)
  }

  async stopScan() {
    if (this.scanner) {
      this.scanner.stop();
    }
    // this.showScanner = false;
    this.showScannerContent = false;
  }

}
