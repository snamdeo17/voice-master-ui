import { Component, OnInit } from '@angular/core';
import { RecordRTCService } from "../../services/record.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
userName:string;
  constructor(private recordRTCService:RecordRTCService) { 
    this.recordRTCService.userNameObs.subscribe((userNameObs) => {
      console.log("userNameObs=="+userNameObs);
      this.userName = userNameObs
    });
  }

  ngOnInit(): void {
  }

}
