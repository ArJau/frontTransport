import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as L from 'leaflet';
import { StopsService } from 'src/_service/stops.service';
import { Trajet } from 'src/app/data/trajets';
import { RechercherLieuService } from 'src/_service/rechercher-lieu.service';
import { MapType } from '@angular/compiler';

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
  public lng: number = 0; //centre
  public zoom: number = 6;

  public myMap: any;
  public clientHeight: Number = 0;
  public clientWidth: Number = 0;
  public mapCacheStops = new Map();
  public mapCacheShapes = new Map();
  

  public pVerti: number[] = [1, 10];//precisionVerticale
  public pHoriz: number[] = [2, 10];//precisionHorizontale
  public mapMarker = new Map();
  public myIcons: any = [];

  public markSelected:any;


  constructor(private _stopsService: StopsService) {
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
    //console.log("nord-sud: " + (nord-sud));
    let ouest = Number(this.calculEchelleHorzontale(this.myMap.getBounds().getWest()));
    let est = Number(this.calculEchelleHorzontale(this.myMap.getBounds().getEast()));
    //console.log("ouest-est" + (ouest-est));
  }



  onMapZoom(e: any) {
    this.zoom = e;
  }

  onMapMove(e: any) {
    this.lat = e.lat;
    this.lng = e.lng;
    this.addMarker(this.myMap.getBounds().getSouth(), this.myMap.getBounds().getWest());


    this.calculTuileEcran();
  }

  ngOnInit(): void {

    this.myIcons.push(L.icon({
      iconSize: [12, 18],
      iconAnchor: [7, 10],
      iconUrl: 'assets/img/arretBus.png',
      iconRetinaUrl: 'assets/img/arretBus.png',
      shadowUrl: 'assets/img/arretBus.png'
    }));
    this.myIcons.push(L.icon({
      iconSize: [12, 18],
      iconAnchor: [0, 0],
      iconUrl: 'assets/img/arretBusVert.png',
      iconRetinaUrl: 'assets/img/arretBusVert.png',
      shadowUrl: 'assets/img/arretBusVert.png'
    }));
    this.myIcons.push(L.icon({
      iconSize: [12, 18],
      iconAnchor: [7, 10],
      iconUrl: 'assets/img/arretBusBleu.png',
      iconRetinaUrl: 'assets/img/arretBusBleu.png',
      shadowUrl: 'assets/img/arretBusBleu.png'
    }));
    this.myIcons.push(L.icon({
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      iconUrl: 'assets/img/arretBusVide.png',
      iconRetinaUrl: 'assets/img/arretBusVide.png',
      shadowUrl: 'assets/img/arretBusVide.png'
    }));

    this.myMap = L.map('busMap').setView([this.lat, this.lng], this.zoom);


    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Map'
    }).addTo(this.myMap);

    this.myMap.on("zoom", (e: any) => {
      this.zoom = this.myMap.getZoom();
      this.onMapMove(this.myMap.getCenter());
      this.clientHeight = this.myMap.getBounds().getNorth() - this.myMap.getBounds().getSouth();
      this.clientWidth = this.myMap.getBounds().getEast() - this.myMap.getBounds().getWest();


      if (this.zoom >= 14) {
        for (const [key, value] of this.mapMarker) {
          value[0].forEach((marker: L.Marker) => {
            marker.setIcon(this.myIcons[0]);
          });
        }
      } else {
        for (const [key, value] of this.mapMarker) {
          value[0].forEach((marker: L.Marker) => {
            marker.setIcon(this.myIcons[3]);
          });
        }
      }
    });

    this.myMap.on("drag", (e: any) => {
      this.onMapMove(this.myMap.getCenter());
    });

    this.clientHeight = this.myMap.getBounds().getSouth();
    this.clientWidth = this.myMap.getBounds().getWest();

    this.addMarker(this.myMap.getBounds().getSouth(), this.myMap.getBounds().getWest());

  }

  addMarker(lat: number, lng: number) {

    let idPosition = this.calculIdPosition(lat, lng);
    if (!this.mapCacheStops.get(idPosition)) {//on evite de recharger les memes arrets
      this.mapCacheStops.set(idPosition, true);

      this._stopsService.getStopsByIdPositionTrajet$(idPosition)
        .subscribe({
          next: (lstTrajet: Trajet[]) => {
            lstTrajet.forEach(trajet => {

              if (!this.mapMarker.get(trajet.route_id)) {
                this.mapMarker.set(trajet.route_id, [[], []]);
                trajet.stops.forEach(stop => {
                  this.mapMarker.get(trajet.route_id)[0].push(
                    L.marker([stop.stop_lat, stop.stop_lon], { icon: (this.zoom >= 14 ? this.myIcons[0] : this.myIcons[3]) })
                      .bindPopup("id: " + trajet.id + "<br>" + stop.stop_name + "<br>" + " lat: " + stop.stop_lat + " lon: " + stop.stop_lon)
                      .addEventListener("click", (marker) => {
                        console.log(stop);
                        console.log(trajet.route_id);
                        console.log(trajet.id);
                        this.markSelected = stop.stop_id;
                      })
                      .addTo(this.myMap));

                  this.mapMarker.get(trajet.route_id)[1].push(
                    L.latLng(stop.stop_lat, stop.stop_lon));
                });

                //console.log(trajet.route_color + " " + stopTrajet.length);  
                L.polyline(this.mapMarker.get(trajet.route_id)[1], {
                  color: "#" + trajet.route_color,
                  weight: 3
                })
                  .bindPopup(trajet.route_long_name)
                  .addEventListener("click", (line) => {
                    this.mapMarker.get(trajet.route_id)[0].forEach((marker: L.Marker) => {
                      marker.setIcon(this.myIcons[2]);
                      marker.setZIndexOffset(150);
                    });

                    line.target.bringToFront();
                  })
                  .addEventListener("mouseover", (line) => {
                    this.mapMarker.get(trajet.route_id)[0].forEach((marker: L.Marker) => {
                      marker.setIcon(this.myIcons[2]);
                      marker.setZIndexOffset(150);
                    });

                    line.target.bringToFront();
                  }).addEventListener("mouseout", (line) => {
                    this.mapMarker.get(trajet.route_id)[0].forEach((marker: L.Marker) => {
                      marker.setIcon(this.zoom >= 14 ? this.myIcons[0] : this.myIcons[3]);
                      marker.setZIndexOffset(100);
                    });
                  })
                  .addTo(this.myMap);

              }
            });
            console.log("load : " + idPosition + ", nb stop:" + lstTrajet.length);
          },
          error: (err) => { console.log("error:" + err) }
        });
    }

  }


  /*addShapes(idReseau: string) {
    if (!this.mapCacheShapes.get(idReseau)) {//on evite de recharger les memes arrets
      this.mapCacheShapes.set(idReseau, true);

      this._stopsService.getShapessById$(idReseau)
        .subscribe({
          next: (lstShapes: Map<string, Coord[]>) => {
            for (let key of lstShapes.keys){

                this.mapMarker.set(trajet.route_id, [[], []]);

                //console.log(trajet.route_color + " " + stopTrajet.length);  
                L.polyline(this.mapMarker.get(trajet.route_id)[1], {
                  color: "blue",
                  weight: 3
                })
                  
                  
                  .addTo(this.myMap);

            };
          },
          error: (err) => { console.log("error:" + err) }
        });
    }

  }*/

  getAddress(lieu: any) {
    this.lat = lieu.lat;
    this.lng = lieu.lon;
    this.zoom =  lieu.zoom;
    this.myMap.setView([this.lat, this.lng], this.zoom);
  }

}
