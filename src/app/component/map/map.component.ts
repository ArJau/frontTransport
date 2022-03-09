import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { Stop } from 'src/app/data/stops';
import { StopsService } from 'src/app/service/stops.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  
  public zoom :any= 13 ;
  public lng:any=1.390962;
  public lat:any=43.506453;
  public myMap:any;
  public clientHeight :Number=0;
  public clientWidth :Number=0;
  public stopsService:StopsService;
  public mapCacheStops = new Map();

  constructor(private _stopsService:StopsService) {
    this.stopsService = _stopsService
   }

  
  calculIdPosition(lat:number, lon:number){
    lat = Number(lat) + 90;//+90 pour n'avoir que des valeur positive
    lon = Number(lon) + 180;// +180 pour n'avoir que des valeur positive
    let idPosition;
    let sLat = ""+ (Math.floor(lat*10));
    let sLon =  ""+ (Math.floor(Math.floor(Math.floor(lon*10)/2))*2);

    idPosition  = sLat + sLon;
    return idPosition;
}

  onMapZoom(e:any){
    this.zoom = e;
  }
  onMapMove(e:any){
    this.lat = e.lat;
    this.lng = e.lng;

    this.addMarker(this.myMap.getBounds().getSouth(), this.myMap.getBounds().getWest());
  }

  updateIcon(){

  }

  ngOnInit(): void {
    
  this.myMap = L.map('busMap').setView([this.lat, this.lng], this.zoom)
    
    
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Map'
    }).addTo(this.myMap);

    this.myMap.on("zoom",  (e:any) => { 
      this.zoom = this.myMap.getZoom();
      this.onMapMove(this.myMap.getCenter());
      this.clientHeight = this.myMap.getBounds().getNorth() - this.myMap.getBounds().getSouth();
      this.clientWidth = this.myMap.getBounds().getEast() - this.myMap.getBounds().getWest();
    });

    this.myMap.on("drag",  (e:any) => {  
      this.onMapMove(this.myMap.getCenter());
    });

    this.clientHeight = this.myMap.getBounds().getSouth();
    this.clientWidth = this.myMap.getBounds().getWest();

    this.addMarker(this.myMap.getBounds().getSouth(), this.myMap.getBounds().getWest());

  var points = [
    L.latLng(this.lat, this.lng),
    L.latLng(this.lat+0.01, this.lng+0.01),
    L.latLng(this.lat+0.02, this.lng+0.03),
    L.latLng(this.lat+0.03, this.lng+0.05),
    L.latLng(this.lat+0.04, this.lng+0.07),
    L.latLng(this.lat+0.05, this.lng+0.09),
    L.latLng(this.lat+0.06, this.lng+0.12)
];


  //var selection = [];
  var polyline = L.polyline(points, {
    color: 'red',
    weight: 3,
    smoothFactor: 1

   })
   .bindPopup('Je suis un ligne')
   .addTo(this.myMap)
   .addEventListener("click", function(){
     alert("toto");
   }); 
}

addMarker(lat:number, lng:number){
  const myIcon = L.icon({
    iconSize: [ 15, 25 ],
    iconAnchor: [ 13, 41 ],
    iconUrl: 'assets/img/arretBus.png',
    iconRetinaUrl: 'assets/img/arretBus.png',
    shadowUrl: 'assets/img/arretBus.png'
  });

  let idPosition = this.calculIdPosition(lat, lng);
  console.log(idPosition);
  console.log(this.mapCacheStops);
  if (!this.mapCacheStops.get(idPosition)){//on regarde dans le cache
    this.mapCacheStops.set(idPosition, true);
    this.stopsService.getStopsByIdPosition$(idPosition)
    .subscribe({
      next: (lstStops : Stop[])=>{ 
        lstStops.forEach(point => {
          L.marker([point.coord[0].lat, point.coord[0].lon], {icon: myIcon})
          .bindPopup(point.name)
          .addTo(this.myMap);
        });
        
        console.log("load : " + idPosition);
      },
      error: (err) => { console.log("error:"+err)}
    });
  }

}
  
}
