import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { Favori, User } from 'src/app/data/trajets';

const API_URL = './api/favoris';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) { }

  /*getPublicContent(): Observable<any> {
    return this.http.get(API_URL + '/all', { responseType: 'text' });
  }
  getUserBoard(): Observable<any> {
    return this.http.get(API_URL + '/user', { responseType: 'text' });
  }
  getModeratorBoard(): Observable<any> {
    return this.http.get(API_URL + '/mod', { responseType: 'text' });
  }
  getAdminBoard(): Observable<any> {
    return this.http.get(API_URL + '/admin', { responseType: 'text' });
  }*/

  getFavoris(): Observable<Favori[]> {
    let id = this.tokenStorage.getUser().id;
    return this.http.get<Favori[]>(API_URL + '/' + id);
  }

  saveFavoris(favori: Favori): Observable<Favori[]> {
    let user = new User();
    user.id = this.tokenStorage.getUser().id;
    favori.user = user;
    let lstFav = [];
    lstFav.push(favori);

    return this.http.post<Favori[]>(API_URL + '/save', lstFav , httpOptions)
  }

  deleleteFavoris(favori: Favori): Observable<Favori[]> {
    let user = new User();
    user.id = this.tokenStorage.getUser().id;
    favori.user = user;
    let lstFav = [];
    lstFav.push(favori);
    return this.http.post<Favori[]>(API_URL + '/delete', lstFav, httpOptions)
  }


}
