import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  constructor() { }

  public zoom :any= 12 ;
  public lng:any=1.390962;
  public lat:any=43.506453;

  public clientHeight :Number=0;
  public clientWidth :Number=0;

  
  onMapZoom(e:any){
    this.zoom = e;
  }
  onMapMove(e:any){
    this.lat = e.lat;
    this.lng = e.lng;
  }
  ngOnInit(): void {
    
  const myMap = L.map('busMap').setView([this.lat, this.lng], this.zoom)
    
    
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Map'
    }).addTo(myMap);

    myMap.on("zoom",  (e:any) => { 
      this.zoom = myMap.getZoom();
      this.onMapMove(myMap.getCenter());
      this.clientHeight = myMap.getBounds().getNorth() - myMap.getBounds().getSouth();
      this.clientWidth = myMap.getBounds().getEast() - myMap.getBounds().getWest();
    });

    myMap.on("drag",  (e:any) => {  
      this.onMapMove(myMap.getCenter());
    });

    this.clientHeight = myMap.getBounds().getNorth() - myMap.getBounds().getSouth();
    this.clientWidth = myMap.getBounds().getEast() - myMap.getBounds().getWest();

    const myIcon = L.icon({
      iconSize: [ 25, 41 ],
      iconAnchor: [ 13, 41 ],
      iconUrl: 'assets/img/arretBus.png',
      iconRetinaUrl: 'assets/img/arretBus.png',
      shadowUrl: 'assets/img/arretBus.png'
    });
    L.marker([this.lat, this.lng], {icon: myIcon})
    .bindPopup('Je suis un Frugal Marqueur')
    .addTo(myMap);

    /*var points = [
      [lat+0.01, lon+0.01],
      [lat+0.02, lon+0.03],
      [lat+0.03, lon+0.05],
      [lat+0.04, lon+0.07],
      [lat+0.05, lon+0.09],
      [lat+0.06, lon+0.12]
  ];*/

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
   .addTo(myMap)
   .addEventListener("click", function(){
     alert("toto");
   }); 
}
  
}
