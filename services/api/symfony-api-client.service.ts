import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {endWith, Observable, of, Subject, takeWhile, throwError} from 'rxjs';
import {catchError, finalize, map, switchMap, tap} from 'rxjs/operators';
import Routing from '../../external-library/router';
import {TokenInterface} from '../login/interfaces/token-interface';
import {EventEmitterService} from '../event-emitter-service';
import {Event} from './constants/event';
import {environment} from '../../../environments/environment';
import {HttpResponseToasterService} from "./http-response-toaster.service";
import {Router} from "@angular/router";
import { isPlatformServer } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class SymfonyApiClientService {

  private status: 'none' | 'inProgress' | 'done' = 'none';
  private urlFetchNotification$ = new Subject<object>();
  private counterRequest = {post: 0, get: 0, all: 0};
  private routes: any;

  constructor(
    private httpClient: HttpClient,
    private eventEmitterService: EventEmitterService,
    private httpResponseToasterService: HttpResponseToasterService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
  }

  private downloadRoutes(): Observable<object> {
    return of(1).pipe(
      tap(value => this.status = 'inProgress'),
      switchMap(() => {
        return this.httpClient.get(environment.backendUrl + environment.backendRoutesPath,
          {
            responseType: 'json', headers: {fetchRoutes: 'true'}
          }).pipe(
          catchError(this.handleErrorRoute.bind(this)),
          tap(response => {
            this.status = 'done';
            this.routes = response;
            this.urlFetchNotification$.next(response);
          }));
        }
      )
    );
  }

  get<T = {}>(routeName: string, querySegmentParam?: {}, headersOptions: { [header: string]: string } = {}, options = {}): Observable<HttpResponse<T>> {
    const routesFromBackend$ = this.tryGetRoutes('get');
    return routesFromBackend$.pipe(
      switchMap(routes => {
        Routing.setRoutingData(routes);
        const path = Routing.generate(routeName, querySegmentParam);
        // if (querySegmentParam) {
        //   querySegmentParam.forEach(value => {
        //     path += '/' + value;
        //   });
        // }
        return this.httpClient.get<T>(environment.backendUrl + path, {
          observe: 'response',
          headers: this.prepareHeader(headersOptions),
          ...options
        }).pipe(
          endWith(null),
          catchError((err) => {
            this.handleError(err);
            return throwError(err)
          }),
          finalize(this.generatePostSendCallbacks('post'))
        );
      }),
      takeWhile((x) => x != null)
    );
  }

  post<T = any>(routeName: string, data, querySegmentParam?: {}, headersOptions: { [header: string]: string } = {}, requestOptions = {}): Observable<HttpResponse<T>> {
    const routesFromBackend$ = this.tryGetRoutes('post');
    return routesFromBackend$.pipe(
      switchMap(routes => {
        Routing.setRoutingData(routes);
        const path = Routing.generate(routeName, querySegmentParam);
        // if (querySegmentParam) {
        //   querySegmentParam.forEach(value => {
        //     path += '/' + value;
        //   });
        // }
        return this.httpClient.post<T>(environment.backendUrl + path, data, {
          observe: 'response',
          ...requestOptions,
          headers: this.prepareHeader(headersOptions)
        }).pipe(
          endWith(null),
          catchError((err) => {
            this.handleError(err);
            return throwError(err)
          }),
          finalize(this.generatePostSendCallbacks('post'))
        );
      }),
      takeWhile((x) => x != null)
    );
  }

  getData<T = {}>(routeName: string, querySegmentParam?: {}, headersOptions: { [header: string]: string } = {}, options = {}): Observable<T> {
    return this.get<T>(routeName, querySegmentParam, headersOptions, options).pipe(map(value => {
      return value.body as T;
    }));
  }

  refreshToken(loginData: {}, path): Observable<HttpResponse<TokenInterface>> {
    return this.post<TokenInterface>(path, loginData)
      .pipe(tap((httpResponse) => {
        this.token = (httpResponse.body as any).token;
      }));
  }

  private prepareHeader(headersOptions: { [header: string]: string } = {}): { [header: string]: string } {
    if (!isPlatformServer(this.platformId) && this.token) {
      headersOptions['Authorization'] = 'Bearer ' + this.token;
    }
    return headersOptions;
  }


  get token(): string | null {
    return localStorage.getItem('token');
  }

  set token(value: string) {
    localStorage.setItem('token', value);
  }

  private tryGetRoutes(type): Observable<object> {
    let routesFromBackend$: Observable<object>;
    routesFromBackend$ = new Observable<object>(subscriber => {
      this.emitPreSend(type);
      if (this.routes) {
        subscriber.next(this.routes);
      }
      else if (this.status === 'done' || this.status === 'none') {
        this.downloadRoutes().subscribe(value => subscriber.next(value));
      } else {
        const unsubscribe = this.urlFetchNotification$.subscribe(downloadedRoutes => {
          unsubscribe.unsubscribe();
          subscriber.next(downloadedRoutes);
        });
      }
    });

    return routesFromBackend$;
  }

  handleErrorRoute(error: HttpErrorResponse): Observable<never> {
    let completedMessage = '';
    this.status = 'none';
    if (error.error) {
      completedMessage = 'Nepodařilo se kontaktovat server pro získání routy';
    } else {
      completedMessage = 'Došlo k chybě při získání routy na server. Opakute akci později. Kód chyby: ' + error.status;
    }

    return throwError(completedMessage);
  }

  emitPreSend(type: 'get' | 'post'): void {
    if (type === 'get') {
      ++this.counterRequest.get;
      this.eventEmitterService.emit(Event.PRE_SEND_GET, true);
    } else {
      ++this.counterRequest.post;
      this.eventEmitterService.emit(Event.PRE_SEND_POST, true);
    }
    ++this.counterRequest.all;
    this.eventEmitterService.emit(Event.PRE_SEND, true);
  }

  generatePostSendCallbacks(type: 'get' | 'post'): (err?: any) => void {
    return () => {
      setTimeout(() => {
        if (type === 'get') {
          --this.counterRequest.get;
          if (!this.counterRequest.get) {
            this.eventEmitterService.emit(Event.POST_SEND_GET, false);
          }
        } else {
          --this.counterRequest.post;
          if (!this.counterRequest.post) {
            this.eventEmitterService.emit(Event.POST_SEND_POST, false);
          }
        }
        --this.counterRequest.all;
        if (!this.counterRequest.all) {
          this.eventEmitterService.emit(Event.POST_SEND, false);
        }
      }, 0);
    };
  }

  logout() {
    this.token = '';
    this.router.navigate(['/'], { onSameUrlNavigation: 'reload' });
  }

  handleError(error) {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      this.logout();
    }
    this.httpResponseToasterService.showError(error);
  }
}
