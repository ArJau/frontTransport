import { Component, OnInit } from '@angular/core';
import { Alert } from 'src/app/data/alert';
import { AlertService } from 'src/_service/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  public alerts : Alert[] = []; 

  constructor(private _alert: AlertService) { }
  
  ngOnInit(): void {
    this._alert.alert$.subscribe((alerts)=>{
      this.alerts = alerts;
      this.afficheFiltreAlert();
    })
  }

  private afficheFiltreAlert(){
   for (let i in alert){

   }
  }

}
