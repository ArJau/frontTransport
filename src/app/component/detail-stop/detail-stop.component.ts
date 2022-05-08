import { Component, Input, OnInit } from '@angular/core';
import { StopDto } from 'src/app/data/stopDto';
import { Favori } from 'src/app/data/trajets';
import { DetailStopService } from 'src/_service/detail-stop.service';
import { UserService } from 'src/_service/user.service';

@Component({
  selector: 'app-detail-stop',
  templateUrl: './detail-stop.component.html',
  styleUrls: ['./detail-stop.component.scss']
})
export class DetailStopComponent implements OnInit {

  constructor(private _detailStopService$: DetailStopService
    , private _userService: UserService) { }

  public stopDto: StopDto = new StopDto();
  public maplstFavori= new Map();

  ngOnInit(): void {
    this._detailStopService$.stopDetail$.subscribe((stopDto: StopDto) => {
      console.log(stopDto);
      console.log(this.maplstFavori);
      this.stopDto = stopDto;
    })

    this._userService.getFavoris().subscribe({
      next: (lstFavori: Favori[]) => {
        for (let i in lstFavori) {
          if (lstFavori[i].stopId) {
            this.maplstFavori.set(lstFavori[i].reseauId + "_" + lstFavori[i].routeId + "_" + lstFavori[i].stopId, true);
          }else  if (lstFavori[i].routeId) {
            this.maplstFavori.set(lstFavori[i].reseauId + "_" + lstFavori[i].routeId, true);
          }else  if (lstFavori[i].reseauId) {
            this.maplstFavori.set(lstFavori[i].reseauId, true);
          }
        }
      }
    })
  }
  isCheked(id:string){
    //console.log("toto: " +  id + " : " + this.maplstFavori.get(id));
    return this.maplstFavori.get(id);
  }

  onCheckboxChange(stopDto: StopDto, event: Event, typeFavori: string) {
    const isChecked = (<HTMLInputElement>event.target).checked;

    let favori = new Favori();
    let idFavori:string;
    if (typeFavori == "reseau") {
      favori.reseauId = stopDto.id;
      idFavori = favori.reseauId;
    } else if (typeFavori == "ligne") {
      favori.reseauId = stopDto.id;
      favori.routeId = stopDto.route_id;
      idFavori = favori.reseauId + "_" + favori.routeId;
    } else if (typeFavori == "arret") {
      favori.reseauId = stopDto.id;
      favori.routeId = stopDto.route_id;
      favori.stopId = stopDto.stop_id;
      idFavori = favori.reseauId + "_" + favori.routeId + "_" + favori.stopId;
    }
    if (!isChecked) {
      this._userService.deleleteFavoris(favori).subscribe({
        next: data => {
          this.maplstFavori.delete(idFavori);
        },
        error: error => {
          console.error('There was an error!', error);
        }
      });
    } else {
      this._userService.saveFavoris(favori).subscribe({
        next: data => {
          this.maplstFavori.set(idFavori, true);
        },
        error: error => {
          console.error('There was an error!', error);
        }

      });
    }

  }

}
