import { Component, Input, OnInit } from '@angular/core';
import { DescReseau } from 'src/app/data/descReseau';
import { StopDto } from 'src/app/data/stopDto';
import { Stop } from 'src/app/data/stops';
import { Favori } from 'src/app/data/trajets';
import { DetailStopService } from 'src/_service/detail-stop.service';
import { LstReseauxObservableService } from 'src/_service/lst-reseaux-observable.service';
import { UserService } from 'src/_service/user.service';

@Component({
  selector: 'app-filtre-reseaux',
  templateUrl: './filtre-reseaux.component.html',
  styleUrls: ['./filtre-reseaux.component.scss']
})
export class FiltreReseauxComponent implements OnInit {

  public lstCheckBoxDescReseau: DescReseau[] = [];

  constructor(private _lstReseauxObservableService: LstReseauxObservableService, 
    private _userService: UserService,
    private _detailStopService : DetailStopService) {}

    //private _filtreReseauxComponent: FiltreReseauxComponent
  ngOnInit(): void {
   this._lstReseauxObservableService.lstReseaux$.subscribe((lstReseau:DescReseau[])=>{
    this.lstCheckBoxDescReseau = lstReseau;
   })
  }

  onCheckboxChange(reseau:DescReseau, event:Event){
    const isChecked = (<HTMLInputElement>event.target).checked;
    reseau.display = isChecked;
    this._lstReseauxObservableService.lstReseauxAffiche=reseau;
    let favori = new Favori(reseau.id);
    if (isChecked){
      this._userService.deleleteFavoris(favori).subscribe({
        next: data => {
          //console.log(data);
      },
      error: error => {
          console.error('There was an error!', error);
      }

      });
    }else{
      this._userService.saveFavoris(favori).subscribe({
        next: data => {
          //console.log(data);
      },
      error: error => {
          console.error('There was an error!', error);
      }

      });
    }
  }

  onClickImage(descReseau: DescReseau){
    this._detailStopService.stopDetail = StopDto.stopCompletReseau(descReseau);
  }

  

  afficheAgence(reseau:DescReseau) :string{
    if (reseau.agence && reseau.agence[0])
      return reseau.agence[0].url;
    return ""
  }

  imageReseau(reseau:DescReseau) :string{
    if (reseau.rt)
      return "assets/img/busReseauxRt.png"
    else
      return "assets/img/busReseaux.png"
  }
}
