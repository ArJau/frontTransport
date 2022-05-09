import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Alert } from 'src/app/data/alert';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private _alert$ : BehaviorSubject<Alert[]>;

  constructor() {
    this._alert$ = new BehaviorSubject<Alert[]>([]);
   }

  public get alert$(){
    return this._alert$;
  }

  public set alert(alert: Alert[]){
    this._alert$.next(alert);
  }

}
