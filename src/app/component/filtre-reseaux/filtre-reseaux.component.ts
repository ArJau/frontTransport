import { Component, Input, OnInit } from '@angular/core';
import { DescReseau } from 'src/app/data/trajets';
import { LstReseauxObservableService } from 'src/_service/lst-reseaux-observable.service';

@Component({
  selector: 'app-filtre-reseaux',
  templateUrl: './filtre-reseaux.component.html',
  styleUrls: ['./filtre-reseaux.component.scss']
})
export class FiltreReseauxComponent implements OnInit {

  public lstCheckBoxDescReseau: DescReseau[] = [];

  constructor(private _lstReseauxObservableService: LstReseauxObservableService) {}

    //private _filtreReseauxComponent: FiltreReseauxComponent
  ngOnInit(): void {
   this._lstReseauxObservableService.lstReseaux$.subscribe((lstReseau:DescReseau[])=>{
    this.lstCheckBoxDescReseau = lstReseau;
   }

   )
  }

  onCheckboxChange(reseau:DescReseau, event:Event){
    const ischecked = (<HTMLInputElement>event.target).checked;
    reseau.display = ischecked;
    //if (ischecked){
      console.log(reseau);
      this._lstReseauxObservableService.lstReseauxAffiche=reseau;
    //}
  }

}
