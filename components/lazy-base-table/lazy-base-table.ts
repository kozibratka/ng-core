import { Component, inject, signal } from '@angular/core';
import { DataTableService } from './services/data-table-service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { SymfonyApiClientService } from '../../services/api/symfony-api-client.service';
import { NotifierService } from '../../services/notifier.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-lazy-base-table',
    imports: [],
    templateUrl: './lazy-base-table.html',
    styleUrl: './lazy-base-table.scss'
})
export abstract class LazyBaseTable {
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

    loadEntities(event) {
        this.lastEvent = event;
        this.loading.set(true);
        this.tableService.loadLazyTableData(this.baseUrl+'_list', event).subscribe({
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
}
