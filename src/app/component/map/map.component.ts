import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { StopsService } from 'src/_service/stops.service';
import { Favori, realTimesAlerts, realTimesVehicles, Trajet } from 'src/app/data/trajets';
import 'leaflet-rotatedmarker';
import { LstReseauxObservableService } from 'src/_service/lst-reseaux-observable.service';
import { Stop } from 'src/app/data/stops';
import { UserService } from 'src/_service/user.service';
import { StopDto } from 'src/app/data/stopDto';
import { DetailStopService } from 'src/_service/detail-stop.service';
import { DescReseau, Icone } from 'src/app/data/descReseau';


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
  public routeSelected :any = [];
  public static mapDescReseau = new Map();
  public mapDescReseauCharge:boolean = false;

  public mapIdPositionIdReseau = new Map();
  public mapIdReseauIdPosition = new Map();
  public mapIdReseauIdRoute = new Map();
  public mapIdReseauIdStopTrajet= new Map();

  public mapCacheVehicles = new Map();//mis en cache de véhicule temp réel
  public lstAlert = [];

  constructor(private _stopsService: StopsService,
    private _lstReseauxObservableService: LstReseauxObservableService,
    private _userService: UserService, 
    private _detailStopService : DetailStopService) {
  }

  /**
   * Action déclenchée losque l'on zoom sur la carte 
   * */
  onMapZoom(e: any) {
    this.zoom = this.myMap.getZoom();
    this.onMapMove(this.myMap.getCenter());


    if (this.zoom <= 10) {
      this.routeSelected = [];
      for (const [idReseau, reseau] of this.mapIdReseauIdRoute) {
        for (const [idRoute, route] of reseau) {
          if (route) {
            route[0].forEach((marker: L.Marker) => {
              marker.setIcon(this.getIcone(false, 0));
            });
          }
        }
      }

      for (const [idPosition, position] of this.mapIdPositionIdReseau) {
        for (const [idReseau, reseau] of position) {
          if (this.zoom < MapComponent.mapDescReseau.get(idReseau).zoom) {
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

  /**
   * Action déclenchée quand on bouge sur la carte
   * @param e
   */
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
    let tab = [];
    tab.push(L.icon({
      iconSize: [12, 18], iconAnchor: [7, 10],
      iconUrl: 'assets/img/arretBusBleu.png'
    }));
    tab.push(L.icon({
      iconSize: [12, 18], iconAnchor: [7, 10],
      iconUrl: 'assets/img/arretBusBleuFonce.png'
    }));
    tab.push(L.icon({
      iconSize: [12, 18], iconAnchor: [7, 10],
      iconUrl: 'assets/img/arretBusVert.png'
    }))
    tab.push(L.icon({
      iconSize: [12, 18], iconAnchor: [7, 10],
      iconUrl: 'assets/img/arretBusViolet.png'
    }))
    tab.push(L.icon({
      iconSize: [12, 18], iconAnchor: [7, 10],
      iconUrl: 'assets/img/arretBusOrange.png'
    }))
    this.stopIcons.push(tab);


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

    
    this._userService.getFavoris().subscribe({
      next: (lstAlertFavori: Favori[]) => {
        let maplstNoReseauFavori = new Map();
        for (let i in lstAlertFavori) {
          if (lstAlertFavori[i].noReseauId) {//favori des reseaux que l'on ne veut pas qu'ils s'affiche
            maplstNoReseauFavori.set(lstAlertFavori[i].noReseauId, true);
          }
        }

        this._stopsService.getDescriptionReseaux$().subscribe({
          next: (lstDescReseau: DescReseau[]) => {
            this.nbReseaux = lstDescReseau.length;
            lstDescReseau.forEach(descReseau => {
              descReseau.display = maplstNoReseauFavori.get(descReseau.id) ? false : true;
              //console.log(descReseau.zoom + "  : " + descReseau.id + " : " + descReseau.title + ", " +  descReseau.name + ": " + descReseau.coord + ", center :" + descReseau.center);

              MapComponent.mapDescReseau.set(descReseau.id, descReseau);
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
            this.mapDescReseauCharge = true;
          }
        });
      }
    })

    this._lstReseauxObservableService.lstReseauxAffiche$.subscribe((desc: DescReseau) => {
      this.afficherReseaux(desc);
    })
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
      MapComponent.mapDescReseau.get(desc.id).display = true;
      let idPosition = this.calculIdPosition(this.myMap.getBounds().getSouth(), this.myMap.getBounds().getWest());
      if (this.mapIdPositionIdReseau.get(idPosition) && this.mapIdPositionIdReseau.get(idPosition).get(desc.id)
        && this.mapIdPositionIdReseau.get(idPosition).get(desc.id) == "false") {
        this.addReseaux(idPosition, desc.id);
      }
    } else {//on supprime le réseau
      MapComponent.mapDescReseau.get(desc.id).display = false;
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
      if (this.zoom > MapComponent.mapDescReseau.get(id).zoom) {
        tabReseauDescription.push(MapComponent.mapDescReseau.get(id));
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
   * Affichage d'un réseaux à l'endroit où se trouve l'utilisateur
   * @param idPosition 
   * @param idReseau 
   * @returns 
   */
  addReseaux(idPosition: string, idReseau: string) {
    if (MapComponent.mapDescReseau.get(idReseau).display == false)//si le réseaux n'est pas coché alors on ne l'affiche pas
      return;

    this.addVehicles(idReseau);
    this.mapIdPositionIdReseau.get(idPosition).set(idReseau, "true");
    this._stopsService.getStopsByIdPositionIdReseauTrajet$(idPosition, idReseau).subscribe({
      next: (lstTrajet: Trajet[]) => {
        lstTrajet.forEach(trajet => {
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
                weight: 4
              })
                .addEventListener("click", (line) => {
                  let stopDto =  StopDto.stopCompletTrajet(MapComponent.mapDescReseau.get(trajet.id), trajet);
                  this._detailStopService.stopDetail = stopDto;
                  this.markSelected = true;//declenche l'affichage du detail des arrets
                  this.multiSelection(trajet);
                  line.target.bringToFront();
                })
                .addEventListener("mouseover", (line) => {
                  if(!this.routeSelected.includes(trajet.id+","+trajet.route_id)){
                    this.mapIdReseauIdRoute.get(trajet.id).get(trajet.route_id)[0].forEach((marker: L.Marker) => {
                      marker.setIcon(this.getIcone(true, 0));
                      marker.setZIndexOffset(150);
                    });
                  line.target.bringToFront();
                  }
                }).addEventListener("mouseout", (line) => {
                  console.log("mouseout:  " + trajet.id+","+trajet.route_id);
                  console.log(this.routeSelected);
                  if(!this.routeSelected.includes(trajet.id+","+trajet.route_id)){
                    this.mapIdReseauIdRoute.get(trajet.id).get(trajet.route_id)[0].forEach((marker: L.Marker) => {
                      marker.setIcon(this.getIcone(false, 0));
                      marker.setZIndexOffset(100);
                    });
                  }
                })
                .addTo(this.myMap));
          }
        })
      },
      error: (err) => { console.log("error:" + err) }
    });
  }


/**
 * Permet la multiselection de trajet 
 * @param trajet 
 */
  multiSelection(trajet: Trajet) {
    let idRouteSelection = trajet.id + "," + trajet.route_id;
    let colorNum = 0;
    if (!this.routeSelected.includes(idRouteSelection)) {//si la ligne n'est pas déjà selectionnée
      if (this.routeSelected.length < 8) {
        colorNum = (this.routeSelected.length / 2) + 1;
      } else if (this.routeSelected.length == 8) {//si on arrive au bout des 4 lignes sélectionnées on reprend la couleur de la premiere
        colorNum = this.routeSelected[this.routeSelected.indexOf(idRouteSelection) + 2];
      }
      this.routeSelected.push(idRouteSelection, colorNum);

      this.mapIdReseauIdRoute.get(trajet.id).get(trajet.route_id)[0].forEach((marker: L.Marker) => {
        marker.setIcon(this.getIcone(true, colorNum));
        marker.setZIndexOffset(150);
      });
    }else{//si la ligne a déja été sélectionnée
      let route = this.routeSelected[this.routeSelected.indexOf(idRouteSelection)].split(",");
      this.mapIdReseauIdRoute.get(route[0]).get(route[1])[0].forEach((marker: L.Marker) => {
        marker.setIcon(this.getIcone(false, 0));
        marker.setZIndexOffset(100);
      });
      this.routeSelected[this.routeSelected.indexOf(idRouteSelection)] = "";
    }

    if (this.routeSelected.length > 8) {//supression de la première route sélectionnée si on arrive au max de la séléction
      if (this.routeSelected[0] != ""){
        let route = this.routeSelected[0].split(",");
        this.mapIdReseauIdRoute.get(route[0]).get(route[1])[0].forEach((marker: L.Marker) => {
          marker.setIcon(this.getIcone(false, 0));
          marker.setZIndexOffset(100);
        });
      }
      this.routeSelected.splice(0, 2)
    }
  }

  /**
   * Ajout d'un arret de bus (marker) sur la carte
   * @param stop 
   * @param trajet 
   * @returns 
   */
  marker(stop: Stop, trajet: Trajet) {
    if(!this.mapIdReseauIdStopTrajet.get(trajet.id))
      this.mapIdReseauIdStopTrajet.set(trajet.id, new Map())
    if (!this.mapIdReseauIdStopTrajet.get(trajet.id).get(stop.stop_id))
      this.mapIdReseauIdStopTrajet.get(trajet.id).set(stop.stop_id, []);

    this.mapIdReseauIdStopTrajet.get(trajet.id).get(stop.stop_id).push(trajet.route_id);
   
    return L.marker([stop.stop_lat, stop.stop_lon], {
      icon: (this.getIcone(false, 0))
    })
      .addEventListener("click", () => {
        let stopDto =  StopDto.stopCompletStop(MapComponent.mapDescReseau.get(trajet.id), trajet, stop);
        this._detailStopService.stopDetail = stopDto;
        this.markSelected = true;
        this.multiSelection(trajet);
      })
      .addEventListener("mouseover", () => {
        let lstRouteId = this.mapIdReseauIdStopTrajet.get(trajet.id).get(stop.stop_id);
        //for (let i in lstRouteId){
          if(!this.routeSelected.includes(trajet.id+","+trajet.route_id)){
            this.mapIdReseauIdRoute.get(trajet.id).get(lstRouteId[0])[0].forEach((marker: L.Marker) => {
              marker.setIcon(this.getIcone(true, 0));
              marker.setZIndexOffset(150);
            });
          }
        //}
      })
      .addEventListener("mouseout", () => {
        let lstRouteId = this.mapIdReseauIdStopTrajet.get(trajet.id).get(stop.stop_id);
        if(!this.routeSelected.includes(trajet.id+","+trajet.route_id)){
        -//for (let i in lstRouteId){
          //this.mapIdReseauIdRoute.get(trajet.id).get(lstRouteId[i])[0].forEach((marker: L.Marker) => {
          this.mapIdReseauIdRoute.get(trajet.id).get(lstRouteId[0])[0].forEach((marker: L.Marker) => {
          marker.setIcon(this.getIcone(false, 0));
          marker.setZIndexOffset(100);
          });
        //}
        }
      })
      .addTo(this.myMap);
  }

  /**
   * 
   * @param isOver Renvoie le type d'incone a afficher pour les marker en fontion du zoom
   * @returns 
   */
   getIcone(isOver: boolean, colorNum: number=0): any {
    if (this.zoom <= 11)
      return this.stopIcons[0];
    if (this.zoom >= 12 && this.zoom <= 14) {
      if (isOver)
        return this.stopIcons[3][colorNum];
      else
        return this.stopIcons[1];
    } else {
      if (isOver)
        return this.stopIcons[3][colorNum];
      else
        return this.stopIcons[2];
    }
  }
  /**
   * 
   * @param id Ajoute les vehicule temps reel sur la map
   */
  addVehicles(id: string) {
    if (this.zoom > 10) {
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
   * Met à jour l'emplacement de la carte en fontion de ce l'utilisateur a sélectionné lors de sa recherche du lieu
   * @param lieu 
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
