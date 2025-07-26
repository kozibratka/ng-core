import {Inject, Injectable, Optional, PLATFORM_ID} from '@angular/core';
import {environment} from '../../../environments/environment';
import {isPlatformServer} from "@angular/common";


@Injectable({
  providedIn: 'root'
})
export class SystemInfoService {

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject('server_request') @Optional() private request?: any // !!!! manually added in server.ts for public
  ) { }

  isPreviewHostname(): boolean {
    let hostName = !this.isServerRender() && window?.location.hostname;
    if (hostName) {
      let hostnameArray = hostName.split('.');
      let chunk = hostnameArray.slice(-3).join('.');
      return chunk === this.getPreviewHostname();
    }
    return false;
  }

  getPreviewHostname(subdomain: string = ''): string {
    let hostName = this.getHostname(true, false, environment.previewSubdomain).split('.')
    if (subdomain) {
      hostName.unshift(subdomain);
    }
    return hostName.join('.');
  }

  getAdminHostname(protocol = true) {
    return this.getHostname(true, protocol, environment.adminSubdomain);
  }

  getUrlPathName(): string {
    if (isPlatformServer(this.platformId)) {
      let path = this.request?.url;
      return path || '/';
    } else {
      return window.location.pathname;
    }
  }

  getHostname(only2d = false, withProtocol = false, subdomain = '') {
    let hostname = this.isServerRender() ? this.request?.hostname.split(':')[0] : window.location.hostname.split(':')[0];
    if (!hostname) {
      return '';
    }
    if (only2d) {
      hostname = hostname.split('.').slice(-2).join('.');
    }
    if (subdomain) {
      hostname = `${subdomain}.${hostname}`;
    }
    if (withProtocol) {
      let protocol = this.isServerRender() ? this.request?.protocol : window.location.protocol;
      hostname = `${protocol}//${hostname}`
    }
    return hostname;
  }

  isServerRender(): boolean {
    return isPlatformServer(this.platformId);
  }
}
