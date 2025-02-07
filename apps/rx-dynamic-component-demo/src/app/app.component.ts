import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { RxDynamicComponentService } from '@trellisorg/rx-dynamic-component';
import { filter, switchMap } from 'rxjs/operators';
import { DialogComponent } from './dialog/dialog.component';
import type { QueryParam1Component } from './query-param1/query-param1.component';
import type { QueryParam2Component } from './query-param2/query-param2.component';

@Component({
    selector: 'trellisorg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    queryParamComponent$ = this._route.queryParams.pipe(
        filter((params) => !!params['query']),
        switchMap((params) =>
            this.rxDynamicComponentService.getComponentFactory<
                QueryParam1Component | QueryParam2Component
            >(params['query'])
        )
    );

    selected: string;

    arr = new Array(100).fill(0);

    constructor(
        private _route: ActivatedRoute,
        private rxDynamicComponentService: RxDynamicComponentService,
        private _router: Router,
        private _matBottomSheet: MatBottomSheet
    ) {
        this.rxDynamicComponentService.loadManifest('service-preload');
    }

    changeQueryParams($event: Event): void {
        this._router.navigate([], {
            queryParams: {
                query: ($event.target as HTMLSelectElement).value,
            },
        });
    }
    open() {
        this._matBottomSheet.open(DialogComponent, {
            data: {
                name: 'Jay',
            },
        });
    }
}
