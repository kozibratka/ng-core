import {Injectable, signal} from '@angular/core';
import {AbstractControl, FormControl, FormGroup} from "@angular/forms";
import {SymfonyApiClientService} from "../api/symfony-api-client.service";
import { HttpErrorResponse } from "@angular/common/http";
import {tap} from "rxjs/operators";
import {HttpResponseToasterService} from "../api/http-response-toaster.service";
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ApiFormService {
  isSending = signal(false);
  constructor(
    private symfonyApiClientService: SymfonyApiClientService,
    private httpResponseToasterService: HttpResponseToasterService,
  ) { }

  send<T = any>(path: string, form: FormGroup, querySegment?: {}, additionalPostData = {}) {
    if (!form.valid) {
      form.markAllAsTouched();
      return null;
    }
    if (this.isSending()) {
      return null;
    }
    this.isSending.set(true);
    let data = {...form.value, ...additionalPostData};
    let formData = this.convertJsonToFormData(data, null, null);
    return this.symfonyApiClientService.post<T>(path, formData, querySegment).pipe(tap(next => {
        this.isSending.set(false);
      },
      (err: HttpErrorResponse) => {
      this.isSending.set(false);
        if (err.status === 400 && err.headers.get('Content-Type') === 'application/invalid-form+json') {
          this.supplyValidationErrors(err.error, form);
        }
      }
    ));
  }

  supplyValidationErrors(validationErrors: {}, abstractControl: AbstractControl): void {
    const baseErrors: string[] = [];
    const iterate = (errors, form: AbstractControl) => {
      Object.keys(errors).forEach(key => {
        if (Array.isArray(errors[key])){
          if (typeof errors[key][0] === 'string') {
            form.get(key)?.setErrors(errors[key], {emitEvent: true});
          } else {
            iterate(errors[key], form.get(key) as any);
          }
        }
        else if (typeof errors[key] === 'string') {
          baseErrors.push(errors[key]);
        }
        else  {
          iterate(errors[key], form.get(key) as any);
        }
      });
    };
    iterate(validationErrors, abstractControl);
    if (baseErrors.length) {
      abstractControl.setErrors(baseErrors, {emitEvent: true});
    }
  }

  convertJsonToFormData(jsonObject: Object, parentKey, carryFormData: FormData | null): FormData {
    const formData = carryFormData || new FormData();
    let index = 0;

    for (var key in jsonObject) {
      if (jsonObject.hasOwnProperty(key)) {
        if (jsonObject[key] !== null && jsonObject[key] !== undefined) {
          var propName = parentKey || key;
          if (parentKey && this.isObject(jsonObject)) {
            propName = parentKey + '[' + key + ']';
          }
          if (parentKey && this.isArray(jsonObject)) {
            propName = parentKey + '[' + index + ']';
          }
          if (jsonObject[key] instanceof File) {
            formData.append(propName, jsonObject[key]);
          } else if (jsonObject[key] instanceof FileList) {
            for (var j = 0; j < jsonObject[key].length; j++) {
              formData.append(propName + '[' + j + ']', jsonObject[key].item(j));
            }
          } else if (this.isArray(jsonObject[key]) || this.isObject(jsonObject[key])) {
              if (this.isObject(jsonObject[key])) {
                  if (jsonObject[key].hasOwnProperty('id')) {
                      formData.append(propName, jsonObject[key].id);
                  } else if(jsonObject[key] instanceof Date) {
                      formData.append(propName, formatDate(jsonObject[key], 'yyyy-MM-dd HH:mm:ss', 'en-US'));
                  }
              }
               else {
                  this.convertJsonToFormData(jsonObject[key], propName, formData);
              }
          } else if (typeof jsonObject[key] === 'boolean') {
            formData.append(propName, +jsonObject[key] ? '1': '0');
          } else {
            formData.append(propName, jsonObject[key]);
          }
        }
      }
      index++;
    }
    return formData;
  }
  isArray(val) {
    const toString = ({}).toString;
    return toString.call(val) === '[object Array]';
  }

  isObject(val) {
    return !this.isArray(val) && typeof val === 'object' && !!val;
  }

}
