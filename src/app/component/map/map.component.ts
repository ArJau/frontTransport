import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { StopsService } from 'src/_service/stops.service';
import { DescReseau, realTimesVehicles, Trajet } from 'src/app/data/trajets';
import 'leaflet-rotatedmarker';
import { LstReseauxObservableService } from 'src/_service/lst-reseaux-observable.service';
import { Stop } from 'src/app/data/stops';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  //public lng:any=1.390962;//pinsaguel
  //public lat:any=43.506453;

  //public lng:any=-4.481778; brest
  //public lat:any=48.399633;
  public lat: number = 46.7;
  public lng: number = 2.2; //centre
  public zoom: number = 6;

  public myMap: any;

  public pVerti: number[] = [2, 10];//precisionVerticale
  public pHoriz: number[] = [6, 10];//precisionHorizontale
  public stopIcons: any = [];
  public busIcons: any = [];
  public nbReseaux: Number = 0;
  public markSelected: any;

  
  public mapMarker = new Map();
  public mapLine = new Map();
  public mapCacheStops = new Map();
  public mapCacheVehicles = new Map();
  public mapDescReseau = new Map();
  public mapCheckBoxDescReseau = new Map();

  public mapIdPositionIdReseau = new Map();
  public mapIdReseauIdPosition = new Map();
  public mapIdReseauIdRoute = new Map();

  constructor(private _stopsService: StopsService, 
    private _lstReseauxObservableService: LstReseauxObservableService) {
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
    console.log("sud: " + sud + " nord: " + nord + ", nord-sud: " + (nord-sud));
    let ouest = Number(this.calculEchelleHorzontale(this.myMap.getBounds().getWest()));
    let est = Number(this.calculEchelleHorzontale(this.myMap.getBounds().getEast()));
    
    console.log("ouest: " + ouest + ", est: " + est + ", est-ouest: " + (est-ouest));
  }

  onMapZoom(e: any) {
    this.zoom = this.myMap.getZoom();
    this.onMapMove(this.myMap.getCenter());

    for (const [key, value] of this.mapMarker) {
      value[0].forEach((marker: L.Marker) => {
        marker.setIcon(this.stopIcons[this.getIcone(false)]);
      });
    }


    if (this.zoom <= 10) {
      //console.log("onMapZoom:" + this.zoom)
      for (const [key, value] of this.mapLine) {
        this.mapLine.get(key).forEach((line: L.Polyline) => {
          line.remove();
        });
      }

      for (const [key, value] of this.mapCacheVehicles) {
        this.mapCacheVehicles.get(key).forEach((marker: L.Marker) => {
          marker.remove();
        });
      }

      this.mapCacheStops = new Map();//map des tuiles
      this.mapMarker = new Map();//map des arret de bus
      this.mapLine = new Map();//map des ligne de bus
      this.mapCacheVehicles = new Map();//map de vehicule temps réel
      this.mapCheckBoxDescReseau = new Map();//map des CheckBox selectionnant les réseaux
    }
  }

  onMapMove(e: any) {
    this.lat = e.lat;
    this.lng = e.lng;
    this.addMarker2(this.myMap.getBounds().getSouth(), this.myMap.getBounds().getWest());
    this.calculTuileEcran();
  }

  ngOnInit(): void {
    this.stopIcons.push(L.icon({
      iconSize: [0, 0], iconAnchor: [0, 0],
      iconUrl: 'assets/img/arretBusVide.png'
    }));
    this.stopIcons.push(L.icon({
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      iconUrl: 'assets/img/arretBusPoint.png',
      //iconRetinaUrl: 'assets/img/arretBusPoint.png',
      //shadowUrl: 'assets/img/arretBusPoint.png'
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

    this._stopsService.getDescriptionReseaux$().subscribe({
      next: (lstDescReseau: DescReseau[]) => {
        this.nbReseaux = lstDescReseau.length;
        lstDescReseau.forEach(descReseau => {
          //console.log("descReseau.center: " + descReseau.center[0] + " " + descReseau.center[1]);
          this.mapDescReseau.set(descReseau.id, descReseau);
          if (descReseau.center[0]) {
            L.marker([descReseau.center[0], descReseau.center[1]], {
              icon: (this.busIcons[(descReseau.rt?"2":"1")])
            })
              .bindPopup(descReseau.title)
              .addTo(this.myMap);
          }

          //création de map
          if (!this.mapIdReseauIdPosition.get(descReseau.id)){
            this.mapIdReseauIdPosition.set(descReseau.id, new Map());
          }

          for(let i in descReseau.idPosition){
            let pos = JSON.parse(JSON.stringify(descReseau.idPosition[i])).pos;
            if (!this.mapIdPositionIdReseau.get(pos)){
              this.mapIdPositionIdReseau.set(pos, new Map());
            }
            this.mapIdPositionIdReseau.get(pos).set(descReseau.id, false);
            this.mapIdReseauIdPosition.get(descReseau.id).set(pos);
          }

        })
      }
    });


    this._lstReseauxObservableService.lstReseauxAffiche$.subscribe((id:string)=>{
      this.switchReseaux(id);
    })
  }

  switchReseaux(id:string){
    if (this.mapLine.get(id)){
      this.mapLine.get(id).forEach((line: L.Polyline) => {
        line.remove();
      });
      this.mapLine.delete(id);
    }
  }

  addVehicles(id: string) {
    if (this.zoom > 10) {
      //console.log("addVehicles: " + id);
      if (!this.mapCacheVehicles.get(id)) {//on evite de recharger les memes vehicules
        this.mapCacheVehicles.set(id, []);
        console.log("lance: " + id);
        this.relance(id);
      }
    } else {

    }
  }

  addCheckBox(id: string) {
    if (this.zoom > 10) {
      if (!this.mapCheckBoxDescReseau.get(id)){
        this.mapCheckBoxDescReseau.set(id, this.mapDescReseau.get(id));
        this._lstReseauxObservableService.lstReseaux = Array.from(this.mapCheckBoxDescReseau.values());

      }
    }
  }

  loadVehicles(id: string) {
    this.mapCacheVehicles.get(id).forEach(
      (vehicle: L.Marker) => {
        vehicle.remove();
      });

    this._stopsService.getRealtimeVehiclesByIdReseaux$(id).subscribe({
      next: (lstVehicles: realTimesVehicles[]) => {
        lstVehicles.forEach(vehicle => {
          //if (this.mapCacheVehicles.get(id)){
            this.mapCacheVehicles.get(id).push(
              L.marker([vehicle.coord[0], vehicle.coord[1]], {
                rotationAngle: vehicle.bearing,
                icon: (this.busIcons[0])
              }).bindPopup("id: " + vehicle.id  + ", bearing:" + vehicle.bearing).addTo(this.myMap));
        });
      }
    });
  }

  relance(id: string) {
    if (this.mapCacheVehicles.get(id)){
      console.log("relance: " + id);
      this.loadVehicles(id);
      setTimeout(() => {
        this.relance(id);
      }, 60000);
    }
  }


  addMarker(lat: number, lng: number) {
    if (this.zoom > 10) {
      let idPosition = this.calculIdPosition(lat, lng);
      if (!this.mapCacheStops.get(idPosition)) {//on evite de recharger les memes arrets
        this.mapCacheStops.set(idPosition, true);

        this._stopsService.getStopsByIdPositionTrajet$(idPosition)
          .subscribe({
            next: (lstTrajet: Trajet[]) => {
              lstTrajet.forEach(trajet => {
                let idMarker = trajet.id + "_" + trajet.route_id;
                this.addVehicles(trajet.id);
                this.addCheckBox(trajet.id);
                
                if (!this.mapMarker.get(idMarker)) {
                  this.mapMarker.set(idMarker, [[], []]);
                  trajet.stops.forEach(stop => {
                    this.mapMarker.get(idMarker)[0].push(L.marker([stop.stop_lat, stop.stop_lon], {
                      icon: (this.stopIcons[this.getIcone(false)])
                    })
                      .bindPopup("id: " + trajet.id + "<br>" + stop.stop_name + "<br>" + " lat: " + stop.stop_lat + " lon: " + stop.stop_lon)
                      .addEventListener("click", (marker) => {
                        this.markSelected = stop.stop_id;
                      })
                      .addEventListener("mouseover", (line) => {
                        this.mapMarker.get(idMarker)[0].forEach((marker: L.Marker) => {
                          marker.setIcon(this.stopIcons[this.getIcone(true)]);
                          marker.setZIndexOffset(150);
                        });
                      })
                      .addEventListener("mouseout", (line) => {
                        this.mapMarker.get(idMarker)[0].forEach((marker: L.Marker) => {
                          marker.setIcon(this.stopIcons[this.getIcone(false)]);
                          marker.setZIndexOffset(100);
                        });
                      })
                      .addTo(this.myMap));

                    /*if (trajet.shapes.length == 0) {
                      this.mapMarker.get(idMarker)[1].push(
                        L.latLng(stop.stop_lat, stop.stop_lon));
                    }*/
                  });

                  if (trajet.shapes.length != 0) {
                    for (let i = 0; i < trajet.shapes.length; i = i + 2) {
                      this.mapMarker.get(idMarker)[1].push(
                        L.latLng(trajet.shapes[i], trajet.shapes[i + 1]));
                    }
                  }

                  if (!this.mapLine.get(trajet.id)) {
                    this.mapLine.set(trajet.id, []);
                  }

                    this.mapLine.get(trajet.id).push(
                    L.polyline(this.mapMarker.get(idMarker)[1], {
                      color: "#" + trajet.route_color,
                      weight: 2
                    })
                      .bindPopup("id: " + trajet.id + "<br>" + trajet.route_long_name)
                      .addEventListener("click", (line) => {
                        this.mapMarker.get(idMarker)[0].forEach((marker: L.Marker) => {
                          marker.setIcon(this.stopIcons[this.getIcone(true)]);
                          marker.setZIndexOffset(150);
                        });

                        line.target.bringToFront();
                      })
                      .addEventListener("mouseover", (line) => {
                        this.mapMarker.get(idMarker)[0].forEach((marker: L.Marker) => {
                          marker.setIcon(this.stopIcons[this.getIcone(true)]);
                          marker.setZIndexOffset(150);
                        });

                        line.target.bringToFront();
                      }).addEventListener("mouseout", (line) => {
                        this.mapMarker.get(idMarker)[0].forEach((marker: L.Marker) => {
                          marker.setIcon(this.stopIcons[this.getIcone(false)]);
                          marker.setZIndexOffset(100);
                        });
                      })
                      .addTo(this.myMap)
                    )
                  
                }
              });
              console.log("load : " + idPosition + ", nb stop:" + lstTrajet.length);
            },
            error: (err) => { console.log("error:" + err) }
          });

      }
    }
  }

  /**EN TEST */
  addMarker2(lat: number, lng: number) {
    if (this.zoom > 10) {
      let idPosition = this.calculIdPosition(lat, lng);

      let mapIdPosition = this.mapIdPositionIdReseau.get(idPosition);
      for (const [idReseau, isPresent] of mapIdPosition) { 
        if (!isPresent) {//on regarde si le reseau a déjà été telechargé
          this._stopsService.getStopsByIdPositionIdReseauTrajet$(idPosition, idReseau).subscribe({
            next: (lstTrajet: Trajet[]) => {
              lstTrajet.forEach(trajet => {
                if (!this.mapIdReseauIdRoute.get(idReseau)) {
                  this.mapIdReseauIdRoute.set(idReseau, new Map());
                }
                if (!this.mapIdReseauIdRoute.get(idReseau).get(trajet.route_id)){
                  this.mapIdReseauIdRoute.get(idReseau).set(trajet.route_id, [[], []]);
                  trajet.stops.forEach(stop => {
                    
                    this.mapIdReseauIdRoute.get(idReseau).get(trajet.route_id)[0].push(this.marker(stop, trajet));
                    
                    /*if (trajet.shapes.length == 0) {
                      this.mapMarker.get(idMarker)[1].push(
                        L.latLng(stop.stop_lat, stop.stop_lon));
                    }*/
                  });

                  if (trajet.shapes.length != 0) {
                    for (let i = 0; i < trajet.shapes.length; i = i + 2) {
                      this.mapIdReseauIdRoute.get(idReseau).get(trajet.route_id)[1].push(
                        L.latLng(trajet.shapes[i], trajet.shapes[i + 1]));
                    }
                  }

                  L.polyline(this.mapIdReseauIdRoute.get(idReseau).get(trajet.route_id)[1], {
                    color: "#" + trajet.route_color,
                    weight: 2
                  })
                    .bindPopup("id: " + trajet.id + "<br>" + trajet.route_long_name)
                    .addEventListener("click", (line) => {
                      this.mapIdReseauIdRoute.get(idReseau).get(trajet.route_id)[0].forEach((marker: L.Marker) => {
                        marker.setIcon(this.stopIcons[this.getIcone(true)]);
                        marker.setZIndexOffset(150);
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
                    .addTo(this.myMap);
                }
              })
            },
            error: (err) => { console.log("error:" + err) }
          });
          console.log(mapIdPosition);
          mapIdPosition.set(idReseau, true);
        }
      }
    }
  }

  

  marker(stop:any, trajet:any){
    L.marker([stop.stop_lat, stop.stop_lon], {
      icon: (this.stopIcons[this.getIcone(false)])
    })
      .bindPopup("id: " + trajet.id + "<br>" + stop.stop_name + "<br>" + " lat: " + stop.stop_lat + " lon: " + stop.stop_lon)
      .addEventListener("click", (marker) => {
        this.markSelected = stop.stop_id;
      })
      .addEventListener("mouseover", () => {
        this.mapIdReseauIdRoute.get(trajet.id).get(trajet.route_id).forEach((marker: L.Marker) => {
          marker.setIcon(this.stopIcons[this.getIcone(true)]);
          marker.setZIndexOffset(150);
        });
      })
      .addEventListener("mouseout", () => {
        this.mapIdReseauIdRoute.get(trajet.id).get(trajet.route_id).forEach((marker: L.Marker) => {
          marker.setIcon(this.stopIcons[this.getIcone(false)]);
          marker.setZIndexOffset(100);
        });
      })
      .addTo(this.myMap)
  }

  supprimerReseau(id:string){

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

}
