import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { StopsService } from 'src/_service/stops.service';
import { Favori, realTimesAlerts, realTimesVehicles, Trajet } from 'src/app/data/trajets';
import 'leaflet-rotatedmarker';
import { LstReseauxObservableService } from 'src/_service/lst-reseaux-observable.service';
import { Stop } from 'src/app/data/stops';
import { UserService } from 'src/_service/user.service';
import { StopDto } from 'src/app/data/stopDto';
import { DetailStopService } from 'src/_service/detail-stop.service';
import { DescReseau } from 'src/app/data/descReseau';
import { AlertService } from 'src/_service/alert.service';
import { Alert } from 'src/app/data/alert';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  public lat: number = 46.7;
  public lng: number = 2.2; //centre
  public zoom: number = 6;

  public myMap: any;

  public pVerti: number[] = [2, 10];//precisionVerticale
  public pHoriz: number[] = [6, 10];//precisionHorizontale
  public stopIcons: any = [];
  public busIcons: any = [];
  public nbReseaux: Number = 0;
  public markSelected: boolean = false;


  public mapMarker = new Map();
  public mapLine = new Map();
  public mapCacheStops = new Map();
  public mapCacheVehicles = new Map();
  public mapDescReseau = new Map();
  public mapCheckBoxDescReseau = new Map();

  public mapIdPositionIdReseau = new Map();
  public mapIdReseauIdPosition = new Map();
  public mapIdReseauIdRoute = new Map();

  public maplstReseauFavori = new Map();
  public lstAlert = [];
  
  public tabColor = [
  "641e16", "c0392b", "633974", "af7ac5", "6c3483", "5499c7", 
  "117864", "1abc9c", "27ae60", "2ecc71", "7d6608", "d4ac0d", 
  "f7dc6f", "b9770e", "d68910", "ba4a00", "7b7d7d", "aab7b8", 
  "17202a", "566573", "58d68d", "FF0000", "00FFFF","FF00FF", 
  "0000FF", "00FF00","FFFF00", "008000", "FF69B", "FFA500"];

  constructor(private _stopsService: StopsService,
    private _lstReseauxObservableService: LstReseauxObservableService,
    private _userService: UserService, 
    private _detailStopService : DetailStopService,
    private _alert :AlertService) {
  }

  /**Action déclencher losque l'on zoom sur la carte */
  onMapZoom(e: any) {
    this.zoom = this.myMap.getZoom();
    this.onMapMove(this.myMap.getCenter());

    for (const [idReseau, reseau] of this.mapIdReseauIdRoute) {
      for (const [idRoute, route] of reseau) {
        if (route) {
          route[0].forEach((marker: L.Marker) => {
            marker.setIcon(this.stopIcons[this.getIcone(false)]);
          });
        }
      }
    }

    if (this.zoom <= 10) {
      for (const [idPosition, position] of this.mapIdPositionIdReseau) {
        for (const [idReseau, reseau] of position) {
          if (this.zoom < this.mapDescReseau.get(idReseau).zoom) {
            if (reseau == "true") {
              this.mapIdPositionIdReseau.get(idPosition).set(idReseau, "false");
              for (const [idRoute, route] of this.mapIdReseauIdRoute.get(idReseau)) {
                if (route) {
                  route[2].forEach((line: L.Polyline) => {
                    line.remove();
                  });
                  route[0].forEach((marker: L.Marker) => {
                    marker.remove();
                  });
                }
              }
              this.mapIdReseauIdRoute.set(idReseau, new Map());

            }
          }
        }
      }


      for (const [key, value] of this.mapCacheVehicles) {
        this.mapCacheVehicles.get(key).forEach((marker: L.Marker) => {
          marker.remove();
        });
      }
      this.mapCacheVehicles = new Map();//map de vehicule temps réel
    }
  }

  onMapMove(e: any) {
    this.lat = e.lat;
    this.lng = e.lng;
    this.addMarker(this.myMap.getBounds().getSouth(), this.myMap.getBounds().getWest());
    this.calculTuileEcran();
  }

  ngOnInit(): void {
    this.stopIcons.push(L.icon({
      iconSize: [0, 0], iconAnchor: [0, 0],
      iconUrl: 'assets/img/arretBusVide.png'
    }));
    this.stopIcons.push(L.icon({
      iconSize: [2, 2], iconAnchor: [1, 1],
      iconUrl: 'assets/img/arretBusPoint.png'
    }));
    this.stopIcons.push(L.icon({
      iconSize: [12, 18], iconAnchor: [7, 10],
      iconUrl: 'assets/img/arretBus.png'
    }));
    this.stopIcons.push(L.icon({
      iconSize: [12, 18], iconAnchor: [7, 10],
      iconUrl: 'assets/img/arretBusBleu.png'
    }));

    this.busIcons.push(L.icon({
      iconSize: [18, 40], iconAnchor: [9, 10],
      iconUrl: 'assets/img/busVert_20.png'
    }));
    this.busIcons.push(L.icon({
      iconSize: [18, 20], iconAnchor: [0, 10],
      iconUrl: 'assets/img/busReseaux.png'
    }));
    this.busIcons.push(L.icon({
      iconSize: [18, 20], iconAnchor: [0, 10],
      iconUrl: 'assets/img/busReseauxRt.png'
    }));

    this.myMap = L.map('busMap').setView([this.lat, this.lng], this.zoom);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Map'
    }).addTo(this.myMap);

    this.myMap.on("zoom", (e: any) => {
      this.onMapZoom(e)
    });

    this.myMap.on("drag", (e: any) => {
      this.onMapMove(this.myMap.getCenter());
    });

    let maplstNoReseauFavori = new Map();
    this._userService.getFavoris().subscribe({
      next: (lstFavori: Favori[]) => {
        
        for (let i in lstFavori) {
          if (lstFavori[i].noReseauId) {//favori des reseaux que l'on ne veut pas qu'ils s'affiche
            maplstNoReseauFavori.set(lstFavori[i].noReseauId, true);
          }
        }


        this._stopsService.getDescriptionReseaux$().subscribe({
          next: (lstDescReseau: DescReseau[]) => {
            this.nbReseaux = lstDescReseau.length;
            lstDescReseau.forEach(descReseau => {
              descReseau.display = maplstNoReseauFavori.get(descReseau.id) ? false : true;
              //console.log(descReseau.zoom + "  : " + descReseau.id + " : " + descReseau.title + ", " +  descReseau.name + ": " + descReseau.coord + ", center :" + descReseau.center);

              this.mapDescReseau.set(descReseau.id, descReseau);
              if (descReseau.center[0]) {
                let icon = this.busIcons[(descReseau.rt ? "2" : "1")];
                if (descReseau.zoom>=8){
                  icon.options.iconSize = [18,20];
                }else{
                  icon.options.iconSize = [29,30];
                }
                L.marker([descReseau.center[0], descReseau.center[1]], {
                  icon: (icon)
                })
                  .bindPopup(descReseau.title  + (descReseau.name?"<br>" + descReseau.name:""))
                  .addEventListener("click", () => {
                      let stopDto =  StopDto.stopCompletReseau(descReseau);
                      this._detailStopService.stopDetail = stopDto;
                      this.markSelected = true;
                  })
                  .addTo(this.myMap);
              }

              //création de map
              if (!this.mapIdReseauIdPosition.get(descReseau.id)) {
                this.mapIdReseauIdPosition.set(descReseau.id, []);
              }
              let lstPos = [];
              let pos;
              for (let i in descReseau.idPosition) {
                pos = JSON.parse(JSON.stringify(descReseau.idPosition[i])).pos;
                lstPos.push(pos);
                if (!this.mapIdPositionIdReseau.get(pos)) {
                  this.mapIdPositionIdReseau.set(pos, new Map());
                }
                this.mapIdPositionIdReseau.get(pos).set(descReseau.id, "false");
              }
              this.mapIdReseauIdPosition.set(descReseau.id, lstPos);
            });

            this.loadAlerts(lstFavori);
          }
          
        });
      }
    })

    this._lstReseauxObservableService.lstReseauxAffiche$.subscribe((desc: DescReseau) => {
      this.afficherReseaux(desc);
    })
  }

  /**
   * Chargement des alertes.  
  */

  loadAlerts(lstAlertFavori: Favori[]) {
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
              alert.titleReseau = this.mapDescReseau.get(realTimesAlert.idReseau).title;
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

  /**
   * 
   * @param desc Affiche ou suppime un reseaux de la carte
   * @returns 
   */
  afficherReseaux(desc: DescReseau) {
    if (!this.mapIdReseauIdPosition.get(desc.id)) {
      return;
    }

    if (desc.display) {//on affiche le réseau
      this.mapDescReseau.get(desc.id).display = true;
      let idPosition = this.calculIdPosition(this.myMap.getBounds().getSouth(), this.myMap.getBounds().getWest());
      if (this.mapIdPositionIdReseau.get(idPosition) && this.mapIdPositionIdReseau.get(idPosition).get(desc.id)
        && this.mapIdPositionIdReseau.get(idPosition).get(desc.id) == "false") {
        this.addReseaux(idPosition, desc.id);
      }
    } else {//on supprime le réseau
      this.mapDescReseau.get(desc.id).display = false;
      this.mapIdReseauIdPosition.get(desc.id).forEach((pos: string) => {
        this.mapIdPositionIdReseau.get(pos).set(desc.id, "false");
        for (const [idRoute, route] of this.mapIdReseauIdRoute.get(desc.id)) {
          if (route) {
            route[2].forEach((line: L.Polyline) => {
              line.remove();
            });
            route[0].forEach((marker: L.Marker) => {
              marker.remove();
            });
          }
        }
        this.mapIdReseauIdRoute.set(desc.id, new Map());
      });
    }
  }


  /**
   * 
   * @param tabId Ajoute les checkbox qui permet de filtrer l'affichage des reseaux
   */
  addCheckBox(tabId: string[]) {
    //if (this.zoom >= 10) {
    let tabReseauDescription = [];
    for (let i in tabId) {
      let id = tabId[i];
      if (this.zoom > this.mapDescReseau.get(id).zoom) {
        tabReseauDescription.push(this.mapDescReseau.get(id));
      }
    }
    this._lstReseauxObservableService.lstReseaux = tabReseauDescription;
    //}
  }


  /**Ajoute les arret de bus (marker) et les lignes de bus sur la carte*/
  addMarker(lat: number, lng: number) {
    if (this.zoom > 10) {
      let idPosition = this.calculIdPosition(lat, lng);
      let mapIdPosition = this.mapIdPositionIdReseau.get(idPosition);

      if (mapIdPosition) {
        this.addCheckBox(Array.from(mapIdPosition.keys()));
        for (const [idReseau, isPresent] of mapIdPosition) {
          if (isPresent == "false") {//on regarde si le reseau a déjà été telechargé
            this.addReseaux(idPosition, idReseau);
          }
        }
      }
    }
  }
  /**
   * 
   * @param idPosition Affichage d'un réseaux à l'endroit ou se trouve l'utilisateur
   * @param idReseau 
   * @returns 
   */
  addReseaux(idPosition: string, idReseau: string) {
    if (this.mapDescReseau.get(idReseau).display == false)//si le réseaux n'est pas coché alors on ne l'affiche pas
      return;

    this.addVehicles(idReseau);
    this.mapIdPositionIdReseau.get(idPosition).set(idReseau, "true");
    this._stopsService.getStopsByIdPositionIdReseauTrajet$(idPosition, idReseau).subscribe({
      next: (lstTrajet: Trajet[]) => {
        lstTrajet.forEach(trajet => {
          if (!trajet.route_color)
            trajet.route_color = this.tabColor[Math.floor(Math.random()*this.tabColor.length)];
          if (!this.mapIdReseauIdRoute.get(idReseau)) {
            this.mapIdReseauIdRoute.set(idReseau, new Map());
          }
          if (!this.mapIdReseauIdRoute.get(idReseau).get(trajet.route_id)) {
            this.mapIdReseauIdRoute.get(idReseau).set(trajet.route_id, [[], [], []]);
            //contient 3 tableaux. Le 1er: tableau des marker
            //le 2eme: tableau des lignes latLng
            //le 3ème: tableau des s polyline
            trajet.stops.forEach(stop => {

              this.mapIdReseauIdRoute.get(idReseau).get(trajet.route_id)[0].push(this.marker(stop, trajet));

              if (trajet.shapes.length == 0) {//concerne les réseaux qui n'ont pas shape associé, on relie alors les points entre eux
                this.mapIdReseauIdRoute.get(idReseau).get(trajet.route_id)[1].push(
                  L.latLng(stop.stop_lat, stop.stop_lon));
              }
            });


            if (trajet.shapes.length != 0) {//concerne les réseaux qui ont une jole shape associé
              for (let i = 0; i < trajet.shapes.length; i = i + 2) {
                this.mapIdReseauIdRoute.get(idReseau).get(trajet.route_id)[1].push(
                  L.latLng(trajet.shapes[i], trajet.shapes[i + 1]));
              }
            }
            this.mapIdReseauIdRoute.get(idReseau).get(trajet.route_id)[2].push(
              L.polyline(this.mapIdReseauIdRoute.get(idReseau).get(trajet.route_id)[1], {
                color: "#" + trajet.route_color,
                weight: 2
              })
                .addEventListener("click", (line) => {
                  this.mapIdReseauIdRoute.get(idReseau).get(trajet.route_id)[0].forEach((marker: L.Marker) => {
                    marker.setIcon(this.stopIcons[this.getIcone(true)]);
                    marker.setZIndexOffset(150);
                    let stopDto =  StopDto.stopCompletTrajet(this.mapDescReseau.get(trajet.id), trajet);
                    this._detailStopService.stopDetail = stopDto;
                    this.markSelected = true;
                  });

                  line.target.bringToFront();
                })
                .addEventListener("mouseover", (line) => {
                  this.mapIdReseauIdRoute.get(idReseau).get(trajet.route_id)[0].forEach((marker: L.Marker) => {
                    marker.setIcon(this.stopIcons[this.getIcone(true)]);
                    marker.setZIndexOffset(150);
                  });

                  line.target.bringToFront();
                }).addEventListener("mouseout", (line) => {
                  this.mapIdReseauIdRoute.get(idReseau).get(trajet.route_id)[0].forEach((marker: L.Marker) => {
                    marker.setIcon(this.stopIcons[this.getIcone(false)]);
                    marker.setZIndexOffset(100);
                  });
                })
                .addTo(this.myMap));

          }
        })
      },
      error: (err) => { console.log("error:" + err) }
    });
  }

  /**
   * 
   * @param stop Affichage d'un arret de bus (marker)
   * @param trajet 
   * @returns 
   */
  marker(stop: Stop, trajet: Trajet) {
    return L.marker([stop.stop_lat, stop.stop_lon], {
      icon: (this.stopIcons[this.getIcone(false)])
    })
      .addEventListener("click", () => {
        let stopDto =  StopDto.stopCompletStop(this.mapDescReseau.get(trajet.id), trajet, stop);
        this._detailStopService.stopDetail = stopDto;
        this.markSelected = true;

      })
      .addEventListener("mouseover", () => {
        this.mapIdReseauIdRoute.get(trajet.id).get(trajet.route_id)[0].forEach((marker: L.Marker) => {
          marker.setIcon(this.stopIcons[this.getIcone(true)]);
          marker.setZIndexOffset(150);
        });
      })
      .addEventListener("mouseout", () => {
        this.mapIdReseauIdRoute.get(trajet.id).get(trajet.route_id)[0].forEach((marker: L.Marker) => {
          marker.setIcon(this.stopIcons[this.getIcone(false)]);
          marker.setZIndexOffset(100);
        });
      })
      .addTo(this.myMap);
  }

  getIcone(isOver: boolean): number {
    if (this.zoom <= 11)
      return 0;

    if (this.zoom >= 12 && this.zoom <= 14) {
      if (isOver)
        return 3;
      else
        return 1;
    } else {
      if (isOver)
        return 3;
      else
        return 2;
    }

  }

  

  isNull(val:any):boolean{
    if (!val || "" == val || 0==val)
      return true;
    return false;
  }

  addVehicles(id: string) {
    if (this.zoom > 10) {
      //console.log("addVehicles: " + id);
      if (!this.mapCacheVehicles.get(id)) {//on evite de recharger les memes vehicules
        this.mapCacheVehicles.set(id, []);
        console.log("lance: " + id);
        this.relance(id);
      }
    } 
  }

  loadVehicles(id: string) {
    this._stopsService.getRealtimeVehiclesByIdReseaux$(id).subscribe({
      next: (lstVehicles: realTimesVehicles[]) => {
        if (lstVehicles.length != 0 || (this.mapCacheVehicles.get(id) && this.mapCacheVehicles.get(id).size == 0)) {
          this.mapCacheVehicles.get(id).forEach(
            (vehicle: L.Marker) => {
              vehicle.remove();
            });
          lstVehicles.forEach(vehicle => {
            this.mapCacheVehicles.get(id).push(
              L.marker([vehicle.coord[0], vehicle.coord[1]], {
                rotationAngle: vehicle.bearing,
                icon: (this.busIcons[0])
              }).bindPopup("id: " + vehicle.id + ", bearing:" + vehicle.bearing).addTo(this.myMap));
          });
        }
      }
    });
  }

  relance(id: string) {
    if (this.mapCacheVehicles.get(id)) {
      console.log("relance: " + id);
      this.loadVehicles(id);
      setTimeout(() => {
        this.relance(id);
      }, 60000);
    }
  }

  detailStopService():StopDto{
    return this._detailStopService.stopDetail;
  }

  /**
   * 
   * @param lieu Met à jour l'emplacement de la carte en focntion des criteres de recherche de l'utilisateur
   */
  getAddress(lieu: any) {
    this.lat = lieu.lat;
    this.lng = lieu.lon;
    this.zoom = lieu.zoom;
    this.myMap.setView([this.lat, this.lng], this.zoom);
  }

  calculIdPosition(lat: number, lon: number) {
    return this.calculEchelleVerticale(lat) + this.calculEchelleHorzontale(lon);
  }

  calculEchelleVerticale(lat: number) {
    lat = Number(lat) + 90;//+90 pour n'avoir que des valeurs positives
    return "" + (Math.floor(Math.floor(Math.floor(lat * this.pVerti[1]) / this.pVerti[0])) * this.pVerti[0]);
  }
  calculEchelleHorzontale(lon: number) {
    lon = Number(lon) + 180// +180 pour n'avoir que des valeurs positives
    return "" + (Math.floor(Math.floor(Math.floor(lon * this.pHoriz[1]) / this.pHoriz[0])) * this.pHoriz[0]);
  }

  calculTuileEcran() {
    let nord = Number(this.calculEchelleVerticale(this.myMap.getBounds().getNorth()));
    let sud = Number(this.calculEchelleVerticale(this.myMap.getBounds().getSouth()));
    //console.log("sud: " + sud + " nord: " + nord + ", nord-sud: " + (nord-sud));
    let ouest = Number(this.calculEchelleHorzontale(this.myMap.getBounds().getWest()));
    let est = Number(this.calculEchelleHorzontale(this.myMap.getBounds().getEast()));

    //console.log("ouest: " + ouest + ", est: " + est + ", est-ouest: " + (est-ouest));
  }

}
