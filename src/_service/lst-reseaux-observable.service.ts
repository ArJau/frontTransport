import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DescReseau } from 'src/app/data/descReseau';

@Injectable({
  providedIn: 'root'
})
export class LstReseauxObservableService {

  /*private _lstReseaux$ : BehaviorSubject<DescReseau[]>;
  private _lstReseauxAffiche$ : BehaviorSubject<DescReseau>;*/

  private _lstReseaux$ : BehaviorSubject<DescReseau[]>;
  private _lstReseauxAffiche$ : BehaviorSubject<DescReseau>;

  constructor() {
    let descReseau : DescReseau[] = [];
    this._lstReseaux$ = new BehaviorSubject<DescReseau[]>(descReseau);
    let descReseau2 : DescReseau = new DescReseau();
    this._lstReseauxAffiche$ = new BehaviorSubject<DescReseau>(descReseau2);
   }

  public get lstReseaux$(){
    return this._lstReseaux$;
  }

  public set lstReseaux(lstReseau: DescReseau[]){
    this._lstReseaux$.next(lstReseau);
  }

  public get lstReseauxAffiche$(){
    return this._lstReseauxAffiche$;
  }

  public set lstReseauxAffiche(lstReseau: DescReseau){
    this._lstReseauxAffiche$.next(lstReseau);
  }

}
