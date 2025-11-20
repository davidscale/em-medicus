import { HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { finalize } from "rxjs/operators";
import { LoadingService } from "./loading.service";

export function LoadingInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  const loadingSrv = inject(LoadingService);
  loadingSrv.setLoading(true);

  return next(request).pipe(
    finalize(() => { loadingSrv.setLoading(false); })
  );
}
