import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'leaflet';
import { Observable, tap } from 'rxjs';
import { Stop } from '../data/stops';
import { Trajet } from '../data/trajets';

@Injectable({
  providedIn: 'root'
})


export class StopsService {

  private _apiBaseUrl ="./transport-api"; 

  constructor(private _http : HttpClient) { }

  public getStopsByIdPosition$(idPosition:string) : Observable<Stop[]>{
    const params = new HttpParams()
          .set('idPosition',idPosition);
    let url = this._apiBaseUrl + `/public/lstStops?${params.toString()}`;
    console.log( "url = " + url);
    return this._http.get<Stop[]>(url)
  }

  public getStopsByIdPositionTrajet$(idPosition:string) : Observable<Trajet[]>{
    const params = new HttpParams()
          .set('idPosition',idPosition);
    let url = this._apiBaseUrl + `/public/lstStopsTrajet?${params.toString()}`;
    console.log( "url = " + url);
    return this._http.get<Trajet[]>(url)
  }
}
