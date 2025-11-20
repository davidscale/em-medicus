import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private behavior$ = new BehaviorSubject<boolean>(false);
  isLoading$ = this.behavior$.asObservable();

  setLoading(isLoading: boolean) { this.behavior$.next(isLoading); }
}
