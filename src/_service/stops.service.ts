import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'leaflet';
import { Observable, tap } from 'rxjs';
import { Stop } from '../app/data/stops';
import { Coord, DescReseau, realTimesVehicles, Trajet } from '../app/data/trajets';

@Injectable({
  providedIn: 'root'
})


export class StopsService {
  private DATA_API = "./transport-api";
  constructor(private _http: HttpClient) { }

  public getDescriptionReseaux$(): Observable<DescReseau[]> {
    let url = this.DATA_API + `/public/lstDescriptionReseau?`;
    console.log("url = " + url);
    return this._http.get<DescReseau[]>(url)
  }

  public getStopsByIdPositionTrajet$(idPosition: string): Observable<Trajet[]> {
    const params = new HttpParams()
      .set('idPosition', idPosition);
    let url = this.DATA_API + `/public/lstStopsTrajet?${params.toString()}`;
    console.log("url = " + url);
    return this._http.get<Trajet[]>(url)
  }

  public getRealtimeVehiclesByIdReseaux$(idReseau: string): Observable<realTimesVehicles[]> {
    let url = this.DATA_API + `/public/realtimesvehicles/${idReseau}`;
    console.log("url = " + url);
    return this._http.get<realTimesVehicles[]>(url)
  }

  
}
