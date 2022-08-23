import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EntityService } from 'src/app/services/entity.service';
import { CenterGraph, EventsService, StepFile, StepFileChanged, StepFileSaved, FitGraph, GraphSize, MainSave, Refresh, RefreshProjects } from 'src/app/services/events.service';
import 'brace'
import 'brace/mode/json'
import 'brace/theme/eclipse'
import * as ace from "ace-builds";
import { Entity } from 'src/app/classes/entity';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  filebody: any = ""
  openFiles: StepFile[] = []
  filesChanged: StepFileChanged[] = []
  selectedTabIndex = 0;
  
  selectedIndexChange(event: number) {
    if(event == 2) {
      this.filebody = this.entityService.getAsJson()
    }
  }

  a(event: MatTabChangeEvent) {
    console.log("MatTabChangeEvent")
    console.log(event)
  }

  @ViewChild("editor") private editor!: ElementRef<HTMLElement>;
   
  openDrawer() {
    this.eventService.emitEventEvent(new RefreshProjects())
  }

  entity!: Entity

  constructor(private http: HttpClient, private eventService: EventsService, public entityService: EntityService) { 
    this.entity = this.entityService.getEntity()
    this.eventService.eventEvent$.subscribe(ev => {
      if(ev instanceof Refresh) {
        this.entity = entityService.getEntity()
        this.filebody = this.entityService.getAsJson()
      }
      if(ev instanceof StepFile) {
        let found = this.openFiles.find(f => f.name == ev.name && f.step == ev.step)
        if(!found) {
          this.openFiles.push(ev)
          found = ev
        }
        setTimeout(() => this.selectedTabIndex = 4 + this.openFiles.indexOf(found || new StepFile("", "")), 100)
        
      }
      if(ev instanceof StepFileChanged) {
        if(!this.filesChanged.find(f=>ev.name==f.name&&ev.step==f.step)) {
          this.filesChanged.push(ev)
        }
      }
      if(ev instanceof StepFileSaved) {
        let found = this.filesChanged.find(f=>ev.name==f.name&&ev.step==f.step)
        if(found) {
          this.filesChanged.splice(this.filesChanged.indexOf(found), 1)
        }
      }
    })
  }

  @ViewChild('graphContainer') graphContainer: ElementRef | undefined;
  w: number = screen.width * 0.75;
  h: number = screen.height * 0.355;

  hello: string = ""
  panelOpenState = false;
  ngOnInit(): void {
    let opt: Object = {
        responseType: 'text' as 'json'
    }
    this.http.get<string>('/hello', opt).subscribe(s => {
      this.hello = s
      console.log(s)
    },
    error => {
      console.log(error)
    })
  }

  ngAfterViewInit() {
    if(this.graphContainer) {
      this.w = this.graphContainer.nativeElement.offsetWidth;
      this.h = this.graphContainer.nativeElement.offsetHeight;
      this.eventService.emitEventEvent(new GraphSize(this.h, this.w))
    }
    //const aceEditor = ace.edit(this.editor.nativeElement);
    //aceEditor.setTheme('ace/theme/twilight');
    //aceEditor.session.setMode('ace/mode/html');
  }

  save() {
    this.entityService.save().subscribe(
      s => {
        this.eventService.emitEventEvent(new MainSave())
        alert("Saved!")
      },
      error => {
        alert(error.error)
        console.log(error)
      })
  }

  createNew() {
    let answer = prompt("New project name")
    if(answer != null) {
      this.entityService.createNew(answer)
    }
  }

  copy() {
    let answer = prompt("Save copy as")
    if(answer != null) {
      this.entityService.copy(this.entity.name, answer)
    }
  }

  delete() {
    if(confirm("Are your sure? Project will be deleted.")) {
      this.entityService.delete(this.entity.name)
    }
  }

  closeFile(file: StepFile) {
    this.openFiles.splice(this.openFiles.indexOf(this.openFiles.filter(f=>f.name===file.name && f.step===file.step)[0]), 1)
    let found = this.filesChanged.find(f=>f.name==file.name&&f.step==file.step)
    if(found) {
      this.filesChanged.splice(this.filesChanged.indexOf(found), 1)
    }
    this.selectedTabIndex = 0  
  }

  stepFileIsChanged(file: StepFile): boolean {
    let found = this.filesChanged.find(f=>f.name==file.name&&f.step==file.step)
    return found != undefined
  }
}
