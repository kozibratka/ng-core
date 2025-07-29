import { Injectable } from '@angular/core';
import {ConfirmationService} from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogServiceService {

  constructor(
    private confirmationService: ConfirmationService
  ) { }

  show(header: string, message: string, acceptCallback: () => void, confirmButtonText = 'Ano') {
    this.confirmationService.confirm({
      header: header,
      message: message,
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Zrušit',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: confirmButtonText,
      },
      accept: acceptCallback
    });
  }
}
