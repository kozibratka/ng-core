import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SymfonyApiClientService } from '../../../services/api/symfony-api-client.service';

export interface DataTableRequest {
    page: number;          // 0-based
    size: number;
    sortField?: string | null;
    sortOrder?: 1 | -1 | 0 | null;
    filters?: { [key: string]: any };
}

export interface DataTableResponse<T> {
    data: T[];
    total: number;
}

@Injectable({
    providedIn: 'root'
})
export class DataTableService {

    constructor(
        private apiClientService: SymfonyApiClientService,
    ) {

    }

    loadLazyTableData(url: string, event, urlParams) {
        const req = {
            page: (event.first ?? 0) / (event.rows ?? 10),
            size: event.rows ?? 10,
            sortField: event.sortField ?? null,
            sortOrder: event.sortOrder ?? null,
            filters: Object.fromEntries(
                Object.entries(event.filters ?? {}).map(([key, f]: any) => [key, f.value])
            )
        };
        return this.loadData<any>(url, req, urlParams);
    }

    loadData<T>(url: string, req: DataTableRequest, urlParams): Observable<DataTableResponse<T>> {
        let params = {
            page: req.page.toString(),
            size: req.size.toString(),
        };

        if (req.sortField) {
            params['sortField'] = req.sortField;
            params['sortOrder'] = String(req.sortOrder);
        }
        if (urlParams) {
            params = {...params, ...urlParams};
        }

        if (req.filters) {
            Object.keys(req.filters).forEach(key => {
                const val = req.filters![key];
                if (val != null && val !== '') {
                    params[key] = val;
                }
            });
        }
        return this.apiClientService.getData<DataTableResponse<T>>(url, params);
    }
}
