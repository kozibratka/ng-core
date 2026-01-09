import { Component } from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {BreadcrumbService} from "./services/breadcrumb.service";
import {filter, startWith, tap} from "rxjs/operators";
import {MenuItem} from "primeng/api";
import {Breadcrumb} from "primeng/breadcrumb";

@Component({
  selector: 'app-breadcrumb',
  imports: [
    Breadcrumb
  ],
  template: `<p-breadcrumb [model]="breadcrumbItems"></p-breadcrumb>`,
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent {
  breadcrumbItems: MenuItem[] = [];
  private breadcrumbs!: any[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(null)
    ).subscribe(() => {
      this.breadcrumbItems = this.breadcrumbService.getBreadcrumbs();
    });
  }
}
