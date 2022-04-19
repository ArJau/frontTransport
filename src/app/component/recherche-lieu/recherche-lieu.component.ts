import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RechercherLieuService } from 'src/_service/rechercher-lieu.service';
import lstDep from '../../../assets/departements-region.json';

@Component({
  selector: 'app-recherche-lieu',
  templateUrl: './recherche-lieu.component.html',
  styleUrls: ['./recherche-lieu.component.scss']
})
export class RechercheLieuComponent implements OnInit {

  constructor(public _rechercherLieuService: RechercherLieuService) { }
  public q: string = "brest";
  public dep: string = "";
  public lstLieuAffichable: any = [];
  public lstDepartement: any = [];

  @Output()
  locationSelected = new EventEmitter();

  rechercheLieu() {
    this.lstLieuAffichable = [];
    let mapLieuFiltre = new Map();
    this._rechercherLieuService.getRechercheLieu$(this.q)
      .subscribe({
        next: (lstLieu: any[]) => {
          lstLieu.forEach(lieu => {
            if (lieu.address.country == "France"
              && (lieu.type == "city" || lieu.type == "postcode" || lieu.type == "administrative")) {
              console.log(lieu);
              if (!mapLieuFiltre.get(lieu.address.county + lieu.address.municipality)) {
                mapLieuFiltre.set(lieu.address.county + lieu.address.municipality, lieu);
                lieu.zoom = 12;
                this.lstLieuAffichable.push(lieu);
              }
            }
          });
          if (this.lstLieuAffichable.length == 1) {
            this.afficheLieu(this.lstLieuAffichable[0]);
          }
        },
        error: (err) => { console.log("error:" + err) }
      });
  }

  rechercheLieuDep(dep: string) {
    this.lstLieuAffichable = [];
    this._rechercherLieuService.getRechercheLieu$(dep)
      .subscribe({
        next: (lstLieu: any[]) => {
          lstLieu.forEach(lieu => {
            console.log(lieu.address.municipality);
            if (lieu.address.country == "France" && lieu.address.county == dep && lieu.type == "administrative" 
            && lieu.address.municipality == undefined) {
                lieu.zoom = 10;
                console.log(lieu);
                this.lstLieuAffichable.push(lieu);
            }
          });

          if (this.lstLieuAffichable.length == 1) {
            this.afficheLieu(this.lstLieuAffichable[0]);
          }
        },
        error: (err) => { console.log("error:" + err) }
      });
  }

  afficheLieu(lieu: any) {
    this.locationSelected.emit(lieu);
  }

  ngOnInit(): void {
    this.lstDepartement.push(lstDep);
  }

}
