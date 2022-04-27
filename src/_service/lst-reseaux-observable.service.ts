import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DescReseau } from 'src/app/data/trajets';

@Injectable({
  providedIn: 'root'
})
export class LstReseauxObservableService {

  private _lstReseaux$ : BehaviorSubject<DescReseau[]>;

  private _lstReseauxAffiche$ : BehaviorSubject<string>;

  constructor() {
    let vide : DescReseau[] = [];
    this._lstReseaux$ = new BehaviorSubject<DescReseau[]>(vide);
    //let vide2 : DescReseau[] = [];
    this._lstReseauxAffiche$ = new BehaviorSubject<string>("");
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

  public set lstReseauxAffiche(lstReseau: string){
    this._lstReseauxAffiche$.next(lstReseau);
  }

}
