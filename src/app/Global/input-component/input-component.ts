import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  model,
  output,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-input-component',
  imports: [
    MatFormFieldModule,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './input-component.html',
  styleUrl: './input-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
  value = model.required();
  readonly tipo = input<string>('text');
  readonly leersolamente = input<boolean>(false);
  readonly placeholder = input<string>('');
  readonly label = input.required();
  readonly idinput = input<string>('');
  readonly validacion = input<boolean>(true);
  readonly iconoboton = input<string>('search');
  readonly tooltipbutton = input<string>('');
  eventoboton = output();
  readonly botonactivo = input<boolean>(false);

  constructor() {
  }



}
