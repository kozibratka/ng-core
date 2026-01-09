import { InjectionToken } from '@angular/core';

export interface NgCoreConfig {
    backendUrl: string;
    backendRoutesPath: string;
    externalLoginPage: string;
}

export const NG_CORE_CONFIG = new InjectionToken<NgCoreConfig>('NG_CORE_CONFIG');
