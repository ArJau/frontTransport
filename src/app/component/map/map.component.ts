import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { Stop } from 'src/app/data/stops';
import { StopsService } from 'src/app/service/stops.service';
import { Trajet } from 'src/app/data/trajets';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  
  public zoom :any= 18 ;
  public lng:any=1.390962;
  public lat:any=43.506453;
  public myMap:any;
  public clientHeight :Number=0;
  public clientWidth :Number=0;
  public stopsService:StopsService;
  public mapCacheStops = new Map();

  public pVerti :number[]= [1, 10];//precisionVerticale
  public pHoriz :number[]= [2, 10];//precisionHorizontale
  public allMarker : any = []
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
      iconSize: [ 10, 15 ],
      iconAnchor: [ 0, 30 ],
      iconUrl: 'assets/img/arretBus.png',
      iconRetinaUrl: 'assets/img/arretBus.png',
      shadowUrl: 'assets/img/arretBus.png'
    }));
    this.myIcons.push( L.icon({
      iconSize: [ 10, 15 ],
      iconAnchor: [ 0,0 ],
      iconUrl: 'assets/img/arretBusVert.png',
      iconRetinaUrl: 'assets/img/arretBusVert.png',
      shadowUrl: 'assets/img/arretBusVert.png'
    }));
    this.myIcons.push( L.icon({
      iconSize: [ 15, 25 ],
      iconAnchor: [  0,0 ],
      iconUrl: 'assets/img/arretBusBleu.png',
      iconRetinaUrl: 'assets/img/arretBusBleu.png',
      shadowUrl: 'assets/img/arretBusBleu.png'
    }));
    this.myIcons.push( L.icon({
      iconSize: [ 0, 0 ],
      iconAnchor: [  0,0 ],
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

      
      if (this.zoom>=13){
        console.log("on:" + this.zoom);
        this.allMarker.forEach((marker:L.Marker)=>{
          marker.setIcon(this.myIcons[0]);
        });
      }else{
        console.log("off:" + this.zoom);
        this.allMarker.forEach((marker:L.Marker)=>{
          marker.setIcon(this.myIcons[3]);
        });
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
    
    /*this.stopsService.getStopsByIdPosition$(idPosition)
    .subscribe({
      next: (lstStops : Stop[])=>{ 
        lstStops.forEach(points => {
          //console.log(points.coord.length);
          //for (let numCoord in points.coord){
          //  L.marker([points.coord[numCoord].lat, points.coord[numCoord].lon], {icon: myIcons[(Number(numCoord)>2?0:numCoord)]})
          //  .bindPopup(points.name)
          //  .addTo(this.myMap);
          //}

          L.marker([points.coord[0].lat, points.coord[0].lon], {icon: myIcons[0]})
          .bindPopup("id: " + points.id + "<br>" +  points.name + "<br>"+ " lat: " + points.coord[0].lat + " lon: " + points.coord[0].lon)
          .addTo(this.myMap);
        });
        
        console.log("load : " + idPosition +", nb stop:" + lstStops.length);
      },
      error: (err) => { console.log("error:"+err)}
    });*/

    this.stopsService.getStopsByIdPositionTrajet$(idPosition)
    .subscribe({
      next: (lstTrajet : Trajet[])=>{
        lstTrajet.forEach(trajet => {
          var stopTrajet :any= [];
          trajet.stops.forEach(stop => {
            stopTrajet.push(L.latLng(stop.stop_lat, stop.stop_lon));
           
            this.allMarker.push(L.marker([stop.stop_lat, stop.stop_lon], {icon: this.myIcons[0]})
            .bindPopup("id: " + trajet.id + "<br>" +  stop.stop_name + "<br>"+ " lat: " + stop.stop_lat + " lon: " + stop.stop_lon)
            .addTo(this.myMap));
          });
          
          //console.log(trajet.route_color + " " + stopTrajet.length);  

          L.polyline(stopTrajet, {
            color: "#" + trajet.route_color, 
            weight: 5
           })
           .bindPopup(trajet.name)
           .addTo(this.myMap)
           .addEventListener("click", () =>{
             alert("toto");
           }); 

        });
        
        console.log("load : " + idPosition +", nb stop:" + lstTrajet.length);
      },
      error: (err) => { console.log("error:"+err)}
    });
  }

}
  
}
