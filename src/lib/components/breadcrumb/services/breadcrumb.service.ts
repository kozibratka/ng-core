import { Injectable } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
export interface BreadcrumbItem {
  label: string;
  routerLink: string;
}
@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  constructor(private router: Router, private route: ActivatedRoute) {}

  getBreadcrumbs(route: ActivatedRoute = this.route.root, url: string = '', breadcrumbs: any[] = []): any[] {
    const children = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL) {
        url += `/${routeURL}`;
      }
      let label = '';
      const breadcrumb = child.snapshot.data['breadcrumb'];
      label = typeof breadcrumb === 'object' ? breadcrumb.label : breadcrumb;
      let link = typeof breadcrumb === 'object' ? breadcrumb.link : null;
      const isDuplicate = breadcrumbs.length > 0 && breadcrumbs[breadcrumbs.length - 1].label === label;

      if (label && !isDuplicate) {
        let data = {label, url: url || '/', target: '_self'};
        if (!breadcrumbs.length) {
          data['icon'] =  'pi pi-home';
        }
        if (link) {
          data.url = link;
        }
        breadcrumbs.push(data);
      }

      return this.getBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
