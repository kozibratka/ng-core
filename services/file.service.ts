import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";
import {SymfonyApiClientService} from "./api/symfony-api-client.service";

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private symfonyApiClientService: SymfonyApiClientService,
  ) { }

  downloadFile(path: string, params): Observable<any> {
    return this.symfonyApiClientService.get<Blob>(path, params, {}, {responseType: 'blob', observe: 'response'}).pipe(
      tap((response: any) => {
        var blob = new Blob([response.body], { type: response.headers.get('content-type') });
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition.match(/inline/)) {
          window.open(URL.createObjectURL(blob));
          return;
        } else {
          const fileName = this.getFileNameFromContentDisposition(contentDisposition);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
        }
      })
    );
  }

  private getFileNameFromContentDisposition(contentDisposition: string): string {
    const fileNameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
    return fileNameMatch && fileNameMatch[1] ? fileNameMatch[1] : 'default.zip';
  }
}
