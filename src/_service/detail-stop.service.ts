import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StopDto } from 'src/app/data/stopDto';

@Injectable({
  providedIn: 'root'
})
export class DetailStopService {

  private _stopDetail$ : BehaviorSubject<StopDto>;

  constructor() {
    this._stopDetail$ = new BehaviorSubject<StopDto>(new StopDto());
   }

  public get stopDetail$(){
    return this._stopDetail$;
  }

  public set stopDetail(stopDetail: StopDto){
    this._stopDetail$.next(stopDetail);
  }
}
