// projects/z-library/src/lib/external-library/router.ts

export interface Route {
  tokens: Array<Array<string>>;
  defaults?: Record<string, string>;
  requirements?: Record<string, any>;
  hosttokens?: Array<string>;
}

export interface Context {
  base_url: string;
  prefix?: string;
  host?: string;
  port?: string;
  scheme?: string;
  locale?: string;
}

export class Router {
  private context_: Context;
  private routes_!: Record<string, Route>;

  constructor(context?: Context, routes?: Record<string, Route>) {
    this.context_ = context || { base_url: '', prefix: '', host: '', port: '', scheme: '', locale: '' };
    this.setRoutes(routes || {});
  }

  setRoutingData(data: any) {
    this.setBaseUrl(data.base_url);
    this.setRoutes(data.routes);

    if ('prefix' in data) this.setPrefix(data.prefix);
    if ('port' in data) this.setPort(data.port);
    if ('locale' in data) this.setLocale(data.locale);
    this.setHost(data.host);
    this.setScheme(data.scheme);
  }

  setRoutes(routes: Record<string, Route>) {
    this.routes_ = Object.freeze(routes);
  }

  getRoutes() {
    return this.routes_;
  }

  setBaseUrl(baseUrl: string) {
    this.context_.base_url = baseUrl;
  }

  getBaseUrl() {
    return this.context_.base_url;
  }

  setPrefix(prefix: string) {
    this.context_.prefix = prefix;
  }

  setScheme(scheme: string) {
    this.context_.scheme = scheme;
  }

  getScheme() {
    return this.context_.scheme;
  }

  setHost(host: string) {
    this.context_.host = host;
  }

  getHost() {
    return this.context_.host;
  }

  setPort(port: string) {
    this.context_.port = port;
  }

  getPort() {
    return this.context_.port;
  }

  setLocale(locale: string) {
    this.context_.locale = locale;
  }

  getLocale() {
    return this.context_.locale;
  }

  buildQueryParams(prefix: string, params: any, add: (k: string, v: any) => void) {
    const rbracket = /\[\]$/;

    if (Array.isArray(params)) {
      params.forEach((val, i) => {
        if (rbracket.test(prefix)) {
          add(prefix, val);
        } else {
          this.buildQueryParams(
            prefix + '[' + (typeof val === 'object' ? i : '') + ']',
            val,
            add
          );
        }
      });
    } else if (typeof params === 'object') {
      for (const name in params) {
        this.buildQueryParams(prefix + '[' + name + ']', params[name], add);
      }
    } else {
      add(prefix, params);
    }
  }

  getRoute(name: string): Route {
    const prefixedName = this.context_.prefix + name;
    const sf41i18nName = name + '.' + this.context_.locale;
    const prefixedSf41i18nName = this.context_.prefix + name + '.' + this.context_.locale;
    const variants = [prefixedName, sf41i18nName, prefixedSf41i18nName, name];

    for (const variant of variants) {
      if (variant in this.routes_) {
        return this.routes_[variant];
      }
    }

    throw new Error(`The route "${name}" does not exist.`);
  }

  generate(name: string, params: Record<string, any> = {}, absolute = false): string {
    const route = this.getRoute(name);
    let url = '';
    const unusedParams = { ...params };
    let host = '';
    const port = this.getPort() ?? '';

    route.tokens.forEach((token) => {
      if (token[0] === 'text') {
        url = Router.encodePathComponent(token[1]) + url;
        return;
      }
      if (token[0] === 'variable') {
        const hasDefault = route.defaults && token[3] in route.defaults;
        const value = token[3] in params ? params[token[3]] : hasDefault ? route.defaults![token[3]] : '';
        if (token[3] in unusedParams) delete unusedParams[token[3]];
        url = token[1] + Router.encodePathComponent(value) + url;
      }
    });

    url = this.getBaseUrl() + url;

    // Add unused query params
    const queryParams: string[] = [];
    const add = (k: string, v: any) => {
      queryParams.push(`${Router.encodeQueryComponent(k)}=${Router.encodeQueryComponent(v)}`);
    };
    for (const k in unusedParams) {
      this.buildQueryParams(k, unusedParams[k], add);
    }
    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&');
    }

    return url;
  }

  static customEncodeURIComponent(value: string) {
    return encodeURIComponent(value)
      .replace(/%2F/g, '/')
      .replace(/%40/g, '@')
      .replace(/%3A/g, ':')
      .replace(/%21/g, '!')
      .replace(/%3B/g, ';')
      .replace(/%2C/g, ',')
      .replace(/%2A/g, '*')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/'/g, '%27');
  }

  static encodePathComponent(value: string) {
    return Router.customEncodeURIComponent(value).replace(/%3D/g, '=').replace(/%2B/g, '+').replace(/%21/g, '!').replace(/%7C/g, '|');
  }

  static encodeQueryComponent(value: string) {
    return Router.customEncodeURIComponent(value).replace(/%3F/g, '?');
  }
}

// Singleton instance
export const Routing = new Router();
