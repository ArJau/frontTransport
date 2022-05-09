import { Component, Input, OnInit } from '@angular/core';
import { Alert } from 'src/app/data/alert';
import { StopDto } from 'src/app/data/stopDto';
import { Favori } from 'src/app/data/trajets';
import { AlertService } from 'src/_service/alert.service';
import { DetailStopService } from 'src/_service/detail-stop.service';
import { UserService } from 'src/_service/user.service';

@Component({
  selector: 'app-detail-stop',
  templateUrl: './detail-stop.component.html',
  styleUrls: ['./detail-stop.component.scss']
})
export class DetailStopComponent implements OnInit {

  constructor(private _detailStopService$: DetailStopService
    , private _userService: UserService
    ,private _alert: AlertService) { }

  public stopDto: StopDto = new StopDto();
  public maplstFavori= new Map();

  ngOnInit(): void {
    this._detailStopService$.stopDetail$.subscribe((stopDto: StopDto) => {
      this.stopDto = stopDto;
    })
    this._userService.getFavoris().subscribe({
      next: (lstFavori: Favori[]) => {
        
        for (let i in lstFavori) {
          if (lstFavori[i].stopId) {
            this.maplstFavori.set(lstFavori[i].reseauId + "_" + lstFavori[i].routeId + "_" + lstFavori[i].stopId, true);
          }else  if (lstFavori[i].routeId) {
            this.maplstFavori.set(lstFavori[i].reseauId + "_" + lstFavori[i].routeId, true);
          }else  if (lstFavori[i].reseauId) {
            this.maplstFavori.set(lstFavori[i].reseauId, true);
          }
        }
      }
    })
  }
  isCheked(id:string){
    //console.log("toto: " +  id + " : " + this.maplstFavori.get(id));
    return this.maplstFavori.get(id);
  }

  onCheckboxChange(stopDto: StopDto, event: Event, typeFavori: string) {
    const isChecked = (<HTMLInputElement>event.target).checked;

    let favori = new Favori();
    let idFavori:string;
    let idAlert:string;
    if (typeFavori == "agence") {
      favori.reseauId = stopDto.id;
      idFavori = favori.reseauId;
      idAlert= favori.reseauId;
    } else if (typeFavori == "route") {
      favori.reseauId = stopDto.id;
      favori.routeId = stopDto.route_id;
      idFavori = favori.reseauId + "_" + favori.routeId;
      idAlert= favori.routeId;
    } else if (typeFavori == "stop") {
      favori.reseauId = stopDto.id;
      favori.routeId = stopDto.route_id;
      favori.stopId = stopDto.stop_id;
      idFavori = favori.reseauId + "_" + favori.routeId + "_" + favori.stopId;
      idAlert= favori.stopId;
    }
    if (!isChecked) {
      this._userService.deleleteFavoris(favori).subscribe({
        next: data => {
          this.maplstFavori.delete(idFavori);
          //console.log(this._alert.alert$.getValue());
          //this._alert.alert$.getValue().get(favori.reseauId).get(typeFavori).delete(idAlert);//mis à jour des alerts
          let tabAlert = this._alert.alert$.getValue();
          for (let i in tabAlert){
            if (tabAlert[i].idReseau == favori.reseauId && tabAlert[i].id==idAlert){
              tabAlert.splice(Number(i), 1);
            }
          }
        },
        error: error => {
          console.error('There was an error!', error);
        }
      });
    } else {
      this._userService.saveFavoris(favori).subscribe({
        next: data => {
          this.maplstFavori.set(idFavori, true);
          let alert = this.objetAlert(stopDto, idAlert, typeFavori);
          this._alert.alert$.getValue().push(alert);
        },
        error: error => {
          console.error('There was an error!', error);
        }

      });
    }

  }

  /**
   * Renvoie un objet Alert en focntion de ce que l'utilisateur veut mettre en alert (stop, route ou agency)
   * @param stopDto 
   * @param idAlert 
   * @param typeFavori 
   * @returns 
   */
  objetAlert(stopDto:StopDto, idAlert:string, typeFavori:string):Alert{
    let alert = new Alert();
    alert.id = idAlert;
    alert.idReseau = stopDto.id;
    alert.type = typeFavori;
    alert.titleReseau = stopDto.title + (stopDto.name?" " + stopDto.name:"");
    return alert;
  }
}


