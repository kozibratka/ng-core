import { Injectable } from '@angular/core';
import {concat, from, Observable} from "rxjs";
import {tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ImportScriptService {
  isImported = false;

  constructor() { }

  import(...paths) {
    this.isImported = false;
    let observerables = paths.map(value => from(import(value)));
    return concat(...observerables).pipe(tap(value => this.isImported = true));
  }
}
