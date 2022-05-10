import { Component, OnInit } from '@angular/core';
import { Alert } from 'src/app/data/alert';
import { Favori, realTimesAlerts } from 'src/app/data/trajets';
import { AlertService } from 'src/_service/alert.service';
import { StopsService } from 'src/_service/stops.service';
import { UserService } from 'src/_service/user.service';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  public alerts : Alert[] = []; 

  constructor(private _alert: AlertService
    , private _userService: UserService
    , private _stopsService: StopsService) { }
  
  ngOnInit(): void {
    this.loadAlerts();
    this._alert.alert$.subscribe((alerts)=>{
      this.alerts = alerts;

    })
  }

  onCheckboxChange(alert: Alert, event: Event){
    const isChecked = (<HTMLInputElement>event.target).checked;
    if (!isChecked){
      (<HTMLInputElement>event.target).checked = true;
    }
    if (confirm("Etes vous sûr de vouloir désactiver cette alerte?")){
      let favori = new Favori ();
      favori.reseauId = alert.idReseau;
      if (alert.type = "agence"){
        favori.routeId = alert.id;
      }else if (alert.type = "route"){
        favori.routeId = alert.id;
      }else if (alert.type = "stop"){
        favori.stopId = alert.id;
      }
      this._userService.deleleteFavoris(favori).subscribe({
        next: data => {
          this.loadAlerts();
        },
        error: error => {
          console.error('There was an error!', error);
        }
      });
    }
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
