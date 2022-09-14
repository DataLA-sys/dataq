import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { EntityService } from './services/entity.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl']
})
export class AppComponent {
  title = 'dataqui';

  constructor(private http: HttpClient, private entityService: EntityService) {
    this.http.get<string>("/options").subscribe(opt => entityService.options = opt)
  }

  images = ["assets/csv.svg", "assets/linkedTable.svg1"];
  loaded = 0;

  loadImages(){
    for(let i = 0; i < this.images.length; i++){
      let img = new Image();
      img.onload = () => {
        this.isloaded();
      }
      img.src = this.images[i];
    }
  }

  isloaded(){
    this.loaded++;
    if(this.images.length == this.loaded){
      //all images loaded
    }
  }
}
