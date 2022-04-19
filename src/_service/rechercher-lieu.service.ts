import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const OSM_API = './search';

@Injectable({
  providedIn: 'root'
})
export class RechercherLieuService {

  constructor(private _http: HttpClient) { }

  public getRechercheLieu$(q: string) : Observable<any[]>{
    let params = new HttpParams()
    .set('format','json')
    .set('addressdetails','1')
    .set('limit',10);

    if (/^\d+$/.test(q)){
      params = params.set('postalcode',q);
    }else{
      params = params.set('q',q);
    }

    let url = OSM_API + `?${params.toString()}`;
    console.log( "url = " + url);
    return this._http.get<any[]>(url)
  }
}
