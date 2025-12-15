import { Component, inject, input, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiFormService } from '../../services/form/api-form.service';
import { NotifierService } from '../../services/notifier.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUpload } from 'primeng/fileupload';
import { Location } from '@angular/common';
import { SymfonyApiClientService } from '../../services/api/symfony-api-client.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-base-form-entity',
    imports: [],
    templateUrl: './base-form-entity.html',
    styleUrl: './base-form-entity.scss'
})
export abstract class BaseFormEntity implements OnInit {
    @ViewChild('files') fileUploader!: FileUpload;
    entity = input<any>(null);
    sourceEntity = input(null);
    fb = inject(FormBuilder);
    apiForm = inject(ApiFormService);
    notifierService = inject(NotifierService);
    router = inject(Router);
    route = inject(ActivatedRoute);
    location = inject(Location);
    api = inject(SymfonyApiClientService);
    dynamicDialogRef = inject(DynamicDialogRef);
    dynamicDialogConf = inject(DynamicDialogConfig, {optional: true});
    form!: FormGroup;
    abstract controllerBaseName;

    constructor() {
        this.initForm();
    }

    abstract initForm();

    ngOnInit(): void {
        if (this.entity()) {
            this.form.patchValue(this.entity());
        }
    }

    submit() {
        let path = this.entity() ? this.controllerBaseName + '_update' : this.controllerBaseName + '_create';

        let params = this.dynamicDialogConf?.data?.params ?? (this.entity() ? { id: this.entity().id } : {});
        this.apiForm.send(path, this.form, params)?.subscribe(() => {
            this.fileUploader?.clear();
            this.form.get('files')?.reset();
            this.notifierService.success('Úspěšně provedeno');
            if (this.dynamicDialogRef) {
                this.dynamicDialogRef.close(true);
            }
            else if (this.sourceEntity()) {
                this.location.back();
            } else {
                this.router.navigate([this.entity() ? './' : '../'], { onSameUrlNavigation: 'reload', relativeTo: this.route });
            }
        });
    }
}
