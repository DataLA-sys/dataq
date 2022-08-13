import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EntityService } from './entity.service';
import { EventsService, Refresh } from './events.service';
 
@Injectable({ providedIn: 'root' })
export class FilesService {
    
    constructor(private http: HttpClient, private eventsService: EventsService, private entityService: EntityService) {
    
    }

    getFile(file: string) {
      let opt: Object = {
        responseType: 'text' as 'json'
      }
      return this.http.get<string>("./getFile?project=" + this.entityService.getEntity().name + "&file=" + file, opt)
    }

    getListFiles() {
      return this.http.get<string[]>("./getListFiles?project=" + this.entityService.getEntity().name)
    }

    save(file: string, content: string) {
      let opt: Object = {
        responseType: 'text' as 'json'
      }
      return this.http.post<string>("./saveFile?project=" + this.entityService.getEntity().name + "&file=" + file, content, opt)
    }

    delete(file: string) {
      let opt: Object = {
        responseType: 'text' as 'json'
      }
      return this.http.post<string>("./deleteFile?project=" + this.entityService.getEntity().name + "&file=" + file, null, opt)
    }
}