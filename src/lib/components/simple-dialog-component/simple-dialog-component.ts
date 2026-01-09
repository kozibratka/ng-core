import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-simple-dialog-component',
  imports: [],
  templateUrl: './simple-dialog-component.html',
  styleUrl: './simple-dialog-component.scss'
})
export class SimpleDialogComponent {
    text = '';

    constructor(
        public dynamicDialogConfig: DynamicDialogConfig,
        public dynamicDialogRef: DynamicDialogRef,
    ) {
        this.text = this.dynamicDialogConfig.data.text.replace(/\r?\n/g, '<br>');;
    }
}
