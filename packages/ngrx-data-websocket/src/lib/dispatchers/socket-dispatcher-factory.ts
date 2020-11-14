import { Inject, Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Action, ScannedActionsSubject, Store } from '@ngrx/store';
import { shareReplay } from 'rxjs/operators';
import { SocketDispatcherBase } from './socket-dispatcher-base';
import { CorrelationIdGenerator } from '@ngrx/data';
import { SocketActionFactory } from '../actions/socket-action-factory';
import {
  defaultNgrxDataWebsocketConfig,
  NGRX_DATA_WEBSOCKET_CONFIG,
  NgrxDataWebsocketConfig,
} from '../utils/tokens';

@Injectable()
export class SocketDispatcherFactory implements OnDestroy {
  /**
   * Actions scanned by the store after it processed them with reducers.
   * A replay observable of the most recent action reduced by the store.
   */
  reducedActions$: Observable<Action>;
  private raSubscription: Subscription;

  constructor(
    @Inject(ScannedActionsSubject) scannedActions$: Observable<Action>,
    @Inject(NGRX_DATA_WEBSOCKET_CONFIG)
    private config: NgrxDataWebsocketConfig,
    private correlationIdGenerator: CorrelationIdGenerator,
    private socketActionFactory: SocketActionFactory,
    private store: Store
  ) {
    this.reducedActions$ = scannedActions$.pipe(shareReplay(1));
    this.raSubscription = this.reducedActions$.subscribe();
  }

  create<T>(entityName: string): SocketDispatcherBase<T> {
    return new SocketDispatcherBase(
      entityName,
      this.correlationIdGenerator,
      this.socketActionFactory,
      this.reducedActions$,
      this.store,
      isNaN(this.config.timeout)
        ? defaultNgrxDataWebsocketConfig.timeout
        : this.config.timeout
    );
  }

  ngOnDestroy() {
    this.raSubscription.unsubscribe();
  }
}
