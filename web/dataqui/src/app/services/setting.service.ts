import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventsService, Run } from './events.service';
import { EntityService } from './entity.service';


@Injectable({
  providedIn: 'root'
})
export class SettingService {
  
  constructor(private http: HttpClient, private eventsService: EventsService, private entityService: EntityService) { }

  getSettings(): Observable<any> {    
    return this.http.get<any>("/settings")
  }

  runCommand(step: string) {
    return this.getSettings().pipe(map(st => {
      let sh = st.sparkSubmit + " --master local" +
      " " + st.projects + "/q.py" +
      " sparkApp=" + st.projects + "/" + this.entityService.getEntity().name + "/" + this.entityService.getEntity().name + ".json" + 
      " stepTo=" + step +
      " env=" + this.entityService.env
      return sh
    }))
  }

  printSchemaCommand(step: string) {
    return this.getSettings().pipe(map(st => {
      let sh = st.sparkSubmit +  " --master local" +
      " " + st.projects + "/q.py" +
      " sparkApp=" + st.projects + "/" + this.entityService.getEntity().name + "/" + this.entityService.getEntity().name + ".json" + 
      " stepTo=" + step + 
      " printSchema=true" +
      " env=" + this.entityService.env
      return sh
    }))
  }

}
