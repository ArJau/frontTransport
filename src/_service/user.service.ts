import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { Favori, User } from 'src/app/data/trajets';

const FAV_API = './api/favoris';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) { }

  getFavoris(): Observable<Favori[]> {
    let id = this.tokenStorage.getUser().id;
    return this.http.get<Favori[]>(FAV_API + '/' + id);
  }

  saveFavoris(favori: Favori): Observable<Favori[]> {
    let user = new User();
    user.id = this.tokenStorage.getUser().id;
    favori.user = user;
    let lstFav = [];
    lstFav.push(favori);

    return this.http.post<Favori[]>(FAV_API + '/save', lstFav , httpOptions)
  }

  deleleteFavoris(favori: Favori): Observable<Favori[]> {
    let user = new User();
    user.id = this.tokenStorage.getUser().id;
    favori.user = user;
    let lstFav = [];
    lstFav.push(favori);
    return this.http.post<Favori[]>(FAV_API + '/delete', lstFav, httpOptions)
  }


}
