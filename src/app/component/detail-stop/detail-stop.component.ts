import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-detail-stop',
  templateUrl: './detail-stop.component.html',
  styleUrls: ['./detail-stop.component.scss']
})
export class DetailStopComponent implements OnInit {

  constructor() { }

  @Input()
  public stopId:any;
  
  
  ngOnInit(): void {
  
  }

}
