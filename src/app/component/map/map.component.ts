import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { StopsService } from 'src/_service/stops.service';
import { Trajet } from 'src/app/data/trajets';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  
  public zoom :any= 18 ;
  //public lng:any=1.390962;//pinsaguel
  //public lat:any=43.506453;

  public lng:any=-4.481778;
  public lat:any=48.399633;
  public myMap:any;
  public clientHeight :Number=0;
  public clientWidth :Number=0;
  public stopsService:StopsService;
  public mapCacheStops = new Map();

  public pVerti :number[]= [1, 10];//precisionVerticale
  public pHoriz :number[]= [2, 10];//precisionHorizontale
  public mapMarker = new Map();
  public myIcons:any = [];

  constructor(private _stopsService:StopsService) {
    this.stopsService = _stopsService
   }

  
  calculIdPosition(lat:number, lon:number){
    /*lat = Number(lat) + 90;//+90 pour n'avoir que des valeur positive
    lon = Number(lon) + 180;// +180 pour n'avoir que des valeur positive
    let idPosition;
    let sLat = ""+ (Math.floor(lat*10));
    let sLon =  ""+ (Math.floor(Math.floor(Math.floor(lon*10)/2))*2);*/

    return this.calculEchelleVerticale(lat) + this.calculEchelleHorzontale(lon);
  }

  calculEchelleVerticale(lat:number){
    lat = Number(lat) + 90;//+90 pour n'avoir que des valeurs positives
    return ""+ (Math.floor(Math.floor(Math.floor(lat*this.pVerti[1])/this.pVerti[0]))*this.pVerti[0]);
  }
  calculEchelleHorzontale(lon:number){
    lon = Number(lon) + 180// +180 pour n'avoir que des valeurs positives
    return ""+ (Math.floor(Math.floor(Math.floor(lon*this.pHoriz[1])/this.pHoriz[0]))*this.pHoriz[0]);
  }

  calculTuileEcran(){
    let nord = Number(this.calculEchelleVerticale(this.myMap.getBounds().getNorth()));
    let sud = Number(this.calculEchelleVerticale(this.myMap.getBounds().getSouth()));
    //console.log("nord-sud: " + (nord-sud));
    let ouest = Number(this.calculEchelleHorzontale(this.myMap.getBounds().getWest()));
    let est = Number(this.calculEchelleHorzontale(this.myMap.getBounds().getEast()));
    //console.log("ouest-est" + (ouest-est));
  }



  onMapZoom(e:any){
    this.zoom = e;
  }
  
  onMapMove(e:any){
    this.lat = e.lat;
    this.lng = e.lng;
    this.addMarker(this.myMap.getBounds().getSouth(), this.myMap.getBounds().getWest());

    
    this.calculTuileEcran();
  }

  ngOnInit(): void {

    this.myIcons.push( L.icon({
      iconSize: [ 12, 18 ],
      iconAnchor: [ 7, 10 ],
      iconUrl: 'assets/img/arretBus.png',
      iconRetinaUrl: 'assets/img/arretBus.png',
      shadowUrl: 'assets/img/arretBus.png'
    }));
    this.myIcons.push( L.icon({
      iconSize: [ 12, 18 ],
      iconAnchor: [ 0,0 ],
      iconUrl: 'assets/img/arretBusVert.png',
      iconRetinaUrl: 'assets/img/arretBusVert.png',
      shadowUrl: 'assets/img/arretBusVert.png'
    }));
    this.myIcons.push( L.icon({
      iconSize: [  17, 25 ],
      iconAnchor: [  7,10 ],
      iconUrl: 'assets/img/arretBusBleu.png',
      iconRetinaUrl: 'assets/img/arretBusBleu.png',
      shadowUrl: 'assets/img/arretBusBleu.png'
    }));
    this.myIcons.push( L.icon({
      iconSize: [ 0, 0 ],
      iconAnchor: [ 0,0 ],
      iconUrl: 'assets/img/arretBusVide.png',
      iconRetinaUrl: 'assets/img/arretBusVide.png',
      shadowUrl: 'assets/img/arretBusVide.png'
    }));
    
  this.myMap = L.map('busMap').setView([this.lat, this.lng], this.zoom)
    
    
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Map'
    }).addTo(this.myMap);

    this.myMap.on("zoom",  (e:any) => { 
      this.zoom = this.myMap.getZoom();
      this.onMapMove(this.myMap.getCenter());
      this.clientHeight = this.myMap.getBounds().getNorth() - this.myMap.getBounds().getSouth();
      this.clientWidth = this.myMap.getBounds().getEast() - this.myMap.getBounds().getWest();

      
      if (this.zoom>=14){
        for (const [key, value] of this.mapMarker) {
          value[0].forEach((marker:L.Marker)=>{
            marker.setIcon(this.myIcons[0]);
          });
        }
      }else{
        for (const [key, value] of this.mapMarker) {
          value[0].forEach((marker:L.Marker)=>{
            marker.setIcon(this.myIcons[3]);
          });
        }
      }
    });

    this.myMap.on("drag",  (e:any) => {  
      this.onMapMove(this.myMap.getCenter());
    });

    this.clientHeight = this.myMap.getBounds().getSouth();
    this.clientWidth = this.myMap.getBounds().getWest();

    this.addMarker(this.myMap.getBounds().getSouth(), this.myMap.getBounds().getWest());

}

addMarker(lat:number, lng:number){

  let idPosition = this.calculIdPosition(lat, lng);
  if (!this.mapCacheStops.get(idPosition)){//on evite de recharger les memes arrets
    this.mapCacheStops.set(idPosition, true);

    this.stopsService.getStopsByIdPositionTrajet$(idPosition)
    .subscribe({
      next: (lstTrajet : Trajet[])=>{
        lstTrajet.forEach(trajet => {
          
        if (!this.mapMarker.get(trajet.route_id)){
          this.mapMarker.set(trajet.route_id, [[],[]]);
          trajet.stops.forEach(stop => {
            this.mapMarker.get(trajet.route_id)[0].push(
              L.marker([stop.stop_lat, stop.stop_lon], {icon: (this.zoom>=14?this.myIcons[0]:this.myIcons[3])})
              .bindPopup("id: " + trajet.id + "<br>" +  stop.stop_name + "<br>"+ " lat: " + stop.stop_lat + " lon: " + stop.stop_lon)
              .addTo(this.myMap));

              this.mapMarker.get(trajet.route_id)[1].push(
              L.latLng(stop.stop_lat, stop.stop_lon));
          });
          
          //console.log(trajet.route_color + " " + stopTrajet.length);  
          L.polyline(this.mapMarker.get(trajet.route_id)[1], {
            color: "#" + trajet.route_color, 
            weight: 5
           })
           .bindPopup(trajet.route_long_name)
           .addEventListener("click", (line) =>{
            this.mapMarker.get(trajet.route_id)[0].forEach((marker:L.Marker)=>{
                marker.setIcon(this.myIcons[2]);
                marker.setZIndexOffset(150);
            });
              
            line.target.bringToFront();
           })
           .addEventListener("mouseover", (line) =>{
            this.mapMarker.get(trajet.route_id)[0].forEach((marker:L.Marker)=>{
                marker.setIcon(this.myIcons[2]);
                marker.setZIndexOffset(150);
            });
              
            line.target.bringToFront();
           }).addEventListener("mouseout", (line) =>{
            this.mapMarker.get(trajet.route_id)[0].forEach((marker:L.Marker)=>{
              marker.setIcon(this.zoom>=14?this.myIcons[0]:this.myIcons[3]);
              marker.setZIndexOffset(100);
            });
           })
           .addTo(this.myMap); 

          }
        });
        console.log("load : " + idPosition +", nb stop:" + lstTrajet.length);
      },
      error: (err) => { console.log("error:"+err)}
    });
  }

}
  
}
