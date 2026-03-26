import { Component, ElementRef, Inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { QRCodeComponent } from 'angularx-qrcode';
import { Pase } from '../../../../Interfaces/PaseEntrada/PaseEntrada';

@Component({
  selector: 'app-view-qr-pase-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    QRCodeComponent
  ],
  templateUrl: './view-qr-pase-dialog.component.html',
  styleUrl: './view-qr-pase-dialog.component.css'
})
export class ViewQrPaseDialogComponent {

 constructor(public dialogRef: MatDialogRef<ViewQrPaseDialogComponent>,
  @Inject(MAT_DIALOG_DATA) private data: Pase,)
  {
    this.pase = data
  }

  pase: Pase = {} as Pase
  public myAngularxQrCode: string = "";
  public qrCodeDownloadLink: SafeUrl = "";

  setQR(){
    let ob = {
      idPase: this.pase.id,
      cliente: this.pase.cliente,
      idCliente: this.pase.idCliente,
      cantidadRestantee: this.pase.cantidadRestante,
      estado: this.pase.estado,
      fecha: new Date().toLocaleDateString()
    }
    this.myAngularxQrCode = JSON.stringify(ob);
  }

  onChangeURL(url: SafeUrl) {
    this.qrCodeDownloadLink = url;
  }

  ngOnInit(){
    this.setQR()
  }




}
