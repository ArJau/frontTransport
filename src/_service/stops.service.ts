import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DescReseau } from 'src/app/data/descReseau';
import { realTimesAlerts, realTimesVehicles, Trajet } from '../app/data/trajets';

const DATA_API = "./transport-api";

@Injectable({
  providedIn: 'root'
})

export class StopsService {
  constructor(private _http: HttpClient) { }

  public getDescriptionReseaux$(): Observable<DescReseau[]> {
    let url = DATA_API + `/public/lstDescriptionReseau?`;
    //console.log("url = " + url);
    return this._http.get<DescReseau[]>(url)
  }

  public getStopsByIdPositionTrajet$(idPosition: string): Observable<Trajet[]> {
    const params = new HttpParams()
      .set('idPosition', idPosition);
    let url = DATA_API + `/public/lstStopsTrajet?${params.toString()}`;
    //console.log("url = " + url);
    return this._http.get<Trajet[]>(url)
  }

  public getStopsByIdPositionIdReseauTrajet$(idPosition: string, idReseau:string): Observable<Trajet[]> {
    const params = new HttpParams()
      .set('idPosition', idPosition)
      .set('idReseau', idReseau);
    let url = DATA_API + `/public/lstStopsTrajetIdPositionIdReseau?${params.toString()}`;
    //console.log("url = " + url);
    return this._http.get<Trajet[]>(url)
  }

  public getRealtimeVehiclesByIdReseaux$(idReseau: string): Observable<realTimesVehicles[]> {
    let url = DATA_API + `/public/realtimesvehicles/${idReseau}`;
    //console.log("url = " + url);
    return this._http.get<realTimesVehicles[]>(url)
  }

  public getRealtimeAlertsByIdsReseaux$(lstIdReseau: string[]): Observable<realTimesAlerts[]> {
    let idsReseau:string="";
    for (let i in lstIdReseau){
      idsReseau += lstIdReseau[i]+",";
    }
    idsReseau = idsReseau.substring(0,idsReseau.length-1);
    const params = new HttpParams().set('idsReseau', idsReseau);
    let url = DATA_API + `/public/realtimesalerts?${params.toString()}`;
    //console.log("url = " + url);
    return this._http.get<realTimesAlerts[]>(url)
  }

  
}
