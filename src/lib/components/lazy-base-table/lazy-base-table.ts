import { Component, inject, OnInit, signal } from '@angular/core';
import { DataTableService } from './services/data-table-service';
import { ConfirmDialogService } from '../../services';
import { SymfonyApiClientService } from '../../services';
import { NotifierService } from '../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { parseJson } from '@angular/cli/src/utilities/json-file';

@Component({
    selector: 'app-lazy-base-table',
    imports: [],
    templateUrl: './lazy-base-table.html',
    styleUrl: './lazy-base-table.scss'
})
export abstract class LazyBaseTable implements OnInit {
    baseTableStatePrefix = 'lazy_base_table_';
    stateKey = '';
    entities = signal<any[]>([]);
    totalRecords = signal(0);
    loading = signal(false);
    tableService = inject(DataTableService);
    symfonyApiClientService = inject(SymfonyApiClientService);
    confirmDialogServiceService = inject(ConfirmDialogService);
    notifierService = inject(NotifierService);
    router = inject(Router);
    route = inject(ActivatedRoute);
    abstract baseUrl;
    private lastEvent;
    urlParams = {};

    ngOnInit(): void {
        this.initUrlParams();
    }

    loadEntities(event) {
        this.lastEvent = event;
        this.loading.set(true);
        this.tableService.loadLazyTableData(this.baseUrl+'_list',
            event, this.urlParams).subscribe({
            next: (value) => {
                this.loading.set(false);
                this.entities.set(value.data);
                this.totalRecords.set(value.total);
            },
            error: (error) => {
                this.loading.set(false);
            }
        });
    }

    refresh() {
        this.loadEntities(this.lastEvent);
    }

    delete(entity: any) {
        this.confirmDialogServiceService.show('Smazat entitu', 'Opravdu si přejete smazat záznam?', () => {
            this.symfonyApiClientService.get(this.baseUrl+'_delete', { id: entity.id }).subscribe((value) => {
                this.notifierService.success('Úspěšně smazáno');
                this.refresh();
            });
        });
    }

    initUrlParams() {
        if (this.stateKey) {
            if (localStorage.getItem(this.baseTableStatePrefix+'url_params')) {
                this.urlParams = JSON.parse(localStorage.getItem(this.baseTableStatePrefix+'url_params') as any);
            }
        }
    }

    setUrlParams(urlParams) {
        if (this.baseTableStatePrefix) {
            localStorage.setItem(this.baseTableStatePrefix+'url_params', JSON.stringify(urlParams));
            this.urlParams = urlParams;
        }
    }
}
