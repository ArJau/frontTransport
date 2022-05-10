import { Component, Input, OnInit } from '@angular/core';
import { Alert } from 'src/app/data/alert';
import { StopDto } from 'src/app/data/stopDto';
import { Favori, realTimesAlerts } from 'src/app/data/trajets';
import { AlertService } from 'src/_service/alert.service';
import { DetailStopService } from 'src/_service/detail-stop.service';
import { StopsService } from 'src/_service/stops.service';
import { UserService } from 'src/_service/user.service';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-detail-stop',
  templateUrl: './detail-stop.component.html',
  styleUrls: ['./detail-stop.component.scss']
})
export class DetailStopComponent implements OnInit {

  constructor(private _detailStopService$: DetailStopService
    , private _userService: UserService
    , private _alert: AlertService
    , private _stopsService: StopsService) { }

  public stopDto: StopDto = new StopDto();
  public maplstFavori = new Map();

  ngOnInit(): void {
    this._detailStopService$.stopDetail$.subscribe((stopDto: StopDto) => {
      this.stopDto = stopDto;
    })
    this._userService.getFavoris().subscribe({
      next: (lstFavori: Favori[]) => {

        for (let i in lstFavori) {
          if (lstFavori[i].stopId) {
            this.maplstFavori.set(lstFavori[i].reseauId + "_" + lstFavori[i].routeId + "_" + lstFavori[i].stopId, true);
          } else if (lstFavori[i].routeId) {
            this.maplstFavori.set(lstFavori[i].reseauId + "_" + lstFavori[i].routeId, true);
          } else if (lstFavori[i].reseauId) {
            this.maplstFavori.set(lstFavori[i].reseauId, true);
          }
        }
      }
    })
  }
  isCheked(id: string) {
    //console.log("toto: " +  id + " : " + this.maplstFavori.get(id));
    return this.maplstFavori.get(id);
  }

  onCheckboxChange(stopDto: StopDto, event: Event, typeFavori: string) {
    const isChecked = (<HTMLInputElement>event.target).checked;

    let favori = new Favori();
    let idFavori: string;
    let idAlert: string;
    if (typeFavori == "agence") {
      favori.reseauId = stopDto.id;
      idFavori = favori.reseauId;
      idAlert = favori.reseauId;
    } else if (typeFavori == "route") {
      favori.reseauId = stopDto.id;
      favori.routeId = stopDto.route_id;
      idFavori = favori.reseauId + "_" + favori.routeId;
      idAlert = favori.routeId;
    } else if (typeFavori == "stop") {
      favori.reseauId = stopDto.id;
      favori.routeId = stopDto.route_id;
      favori.stopId = stopDto.stop_id;
      idFavori = favori.reseauId + "_" + favori.routeId + "_" + favori.stopId;
      idAlert = favori.stopId;
    }
    if (!isChecked) {
      this._userService.deleleteFavoris(favori).subscribe({
        next: data => {
          this.maplstFavori.delete(idFavori);
          this.loadAlerts();
        },
        error: error => {
          console.error('There was an error!', error);
        }
      });
    } else {
      this._userService.saveFavoris(favori).subscribe({
        next: data => {
          this.maplstFavori.set(idFavori, true);
          this.loadAlerts();
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
  objetAlert(stopDto: StopDto, idAlert: string, typeFavori: string): Alert {
    let alert = new Alert();
    alert.id = idAlert;
    alert.idReseau = stopDto.id;
    alert.type = typeFavori;
    alert.titleReseau = stopDto.title + (stopDto.name ? " " + stopDto.name : "");
    return alert;
  }

  loadAlerts() {
    this._userService.getFavoris().subscribe({
      next: (lstAlertFavori: Favori[]) => {

        let mapAlert = new Map();//map d'optimisation permettant de retrouver facilement une alert favori
        let mapId = new Map();
        for (let j in lstAlertFavori) {
          if (!lstAlertFavori[j].noReseauId) {
            if (lstAlertFavori[j].stopId != "")
              mapAlert.set(lstAlertFavori[j].reseauId + "_" + lstAlertFavori[j].stopId, true);
            else if (lstAlertFavori[j].routeId != "")
              mapAlert.set(lstAlertFavori[j].reseauId + "_" + lstAlertFavori[j].routeId, true);
            else if (lstAlertFavori[j].stopId != "")
              mapAlert.set(lstAlertFavori[j].reseauId + "_" + lstAlertFavori[j].agenceId, true);

            if (!mapId.get(lstAlertFavori[j].reseauId)) {
              mapId.set(lstAlertFavori[j].reseauId, true)
            }
          }
        }

        let ids = Array.from(mapId.keys())
        this._stopsService.getRealtimeAlertsByIdsReseaux$(ids).subscribe({
          next: (lstAlertrealTimes: realTimesAlerts[]) => {
            let lstAlert: Alert[] = [];
            lstAlertrealTimes.forEach(realTimesAlert => {
              let alertEntity = realTimesAlert.alert;
              //console.log(lstEntity);
              for (let i in alertEntity.informedEntity) {//boucle sur les alertes remontée par le systeme
                let alert = new Alert();
                let type = "";
                let id = ""
                if (alertEntity.informedEntity[i].agencyId != "") {
                  type = "agence";
                  id = alertEntity.informedEntity[i].agencyId;
                } else if (alertEntity.informedEntity[i].routeId != "") {
                  type = "route";
                  id = alertEntity.informedEntity[i].routeId;
                } else if (alertEntity.informedEntity[i].stopId != "") {
                  type = "stop";
                  id = alertEntity.informedEntity[i].stopId;
                }
                if (mapAlert.get(realTimesAlert.idReseau + "_" + id)) {//création d'alerte qui seront affichée
                  alert.type = type;
                  alert.headerAlert = realTimesAlert.alert.headerText.translation[0].text;
                  alert.textAlert = realTimesAlert.alert.descriptionText.translation[0].text;
                  alert.idReseau = realTimesAlert.idReseau;
                  let desc = MapComponent.mapDescReseau.get(realTimesAlert.idReseau);
                  alert.titleReseau = desc.title + (desc.name?", "+desc.name:"");
                  alert.id = id
                  lstAlert.push(alert);
                  break;
                }
              }
            });
            this._alert.alert = lstAlert;
          }
        });
      }
    }
    )
  }
}


