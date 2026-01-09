import { Injectable } from '@angular/core';
import { SymfonyApiClientService } from './api/symfony-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class AresService {

    constructor(
        private apiClientService: SymfonyApiClientService
    ) {
    }

    fetch(ico: string) {
        return this.apiClientService.getData('ares_basic', {ico: ico});
    }
}
