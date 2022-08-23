import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Entity } from '../classes/entity';
import { Step } from '../classes/step';
import { EventsService, Refresh } from './events.service';
 
@Injectable({ providedIn: 'root' })
export class EntityService {
    private entity = new Entity()
    constructor(private http: HttpClient, private eventsService: EventsService) {
       
    }

    getStepUniqName(): string  {
      let i = 1
      while(this.entity.steps.find(s => s.name === "Step" + i)) {
        i++
      }
      return "Step" + i
    }

    getEntity(): Entity {
        return this.entity;
    }

    getAsJson(): string {
      let tosave: any = {name: this.entity.name}
      tosave.steps = this.entity.steps.map(s => {
        return {
          name: s.name,
          in: s.in.map(i => i.name),
          opt: {
            name: s.opt.name,
            opts: s.opt.opts?.map(o => {return {option: o.option, value: o.value}})
          }
        }
      })
      tosave.options = this.entity.options
      let value = JSON.stringify(tosave,undefined,"  ")
      console.log(value)
      return value
    }

    save() {
      let opt: Object = {
        responseType: 'text' as 'json'
      }
      let value = this.getAsJson()
      return this.http.post<string>("/save", value, opt)
    }

    loadEntity(name: string) {
      this.http.get<string>("getEntity?project=" + name).subscribe(entity => {
        this.load(entity)
        this.eventsService.emitEventEvent(new Refresh)
      }, error => {
        alert(error.error)
        console.log(error)
      })
    }

    private load(value: any) {
      let entity = new Entity()
      entity.name = value.name
      value.steps?.forEach((s: any) => {
        let step = new Step(s.name)
        step.opt.name = s.opt.name
        step.opt.opts = s.opt.opts?.map((o: any) => {
          return {option: o.option, value: o.value}
        })
        entity.steps.push(step)
      })
      value.steps?.forEach((s: any) => { 
        let parent: Step | undefined = entity.steps.find(p => p.name == s.name)
        s.in.forEach((ss: string) => {
          let sss: Step | undefined = entity.steps.find(p => p.name === ss)
          if(sss) {
            parent?.in.push(sss)
          }
        })
      });
      entity.options = value.options || []
      this.entity = entity
    }

    loadList() {
      return this.http.get<string[]>("projects")
    }
    
    options: any;

    getStepImage(type: string): string {
      if(type === "CsvSource") {
        return "assets/csv.png"
      }
      if(type === "ParquetTarget") {
        return "assets/icon--parquet.png"
      }
      if(type === "ParquetSource") {
        return "assets/icon--parquet.png"
      }
      if(type === "JDBCSource") {
        return "assets/linkedTable.png"
      }
      
      return "assets/sql.png"
    }

    getOptType() {
      if(this.options !== undefined) {
        return of(this.options)
      } else {
        return this.http.get<string>("/options")
      }
    }

    createNew(name: string) {
      this.entity = new Entity()
      this.entity.name = name
      this.save().subscribe(s => {
        this.loadEntity(name)
        alert("Created!")
      }, error => {
        alert("Error " + error.error)
        console.error(error)
      })
    }

    copy(source: string, target: string) {
      let opt: Object = {
        responseType: 'text' as 'json'
      }
      this.http.post<string>("/copyProject?source=" + source + "&" + "target=" + target, null, opt).subscribe(s => {
        this.loadEntity(target)
        alert(s)
      }, error => {
        alert("Error " + error.error)
        console.error(error)
      })
    }

    private loadNew() {
      this.entity = new Entity()
    }

    delete(name: string) {
      let opt: Object = {
        responseType: 'text' as 'json'
      }
      this.http.post<string>("./deleteProject?name=" + name, null, opt).subscribe(s => {
        this.loadNew()
        this.eventsService.emitEventEvent(new Refresh())
      }, error => {
        console.error(error)
        alert(error.error)
      })
      
    }
}