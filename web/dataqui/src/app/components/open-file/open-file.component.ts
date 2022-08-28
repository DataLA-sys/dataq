import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FilesService } from 'src/app/services/files.service';
import 'brace'
import 'brace/mode/sql'
import 'brace/theme/eclipse'
import * as ace from "ace-builds";
import { EventsService, StepFileChanged, StepFileSaved, MainSave } from 'src/app/services/events.service';
import { Step } from 'src/app/classes/step';
import { EntityService } from 'src/app/services/entity.service';

@Component({
  selector: 'app-open-file',
  templateUrl: './open-file.component.html',
  styleUrls: ['./open-file.component.styl']
})
export class OpenFileComponent implements OnInit {

  @ViewChild("editor") private editor!: ElementRef<HTMLElement>;

  @Input()
  file!: string;
  @Input()
  step!: string;
  schema: string =""
  
  events: string[] = []
  aceEditor!: ace.Ace.Editor;

  constructor(private fileService: FilesService, private eventsService: EventsService, private entityService: EntityService) {
    this.eventsService.eventEvent$.subscribe(ev => {
      if(ev instanceof MainSave) {
        this.save()
      }
    })
  }

  content: any = "";
  savedContent: any = "";
  
  ngOnInit(): void {
    let step = this.entityService.getEntity().steps.find(s=>s.name==this.step)
    if(step){
      let schema = ["{\"" + step.name + "\"" + ": " + JSON.stringify(step.schema, undefined, "    ") +"}"]
      schema = schema.concat(step.in.map(i=>"{\"" + i.name + "\": " + JSON.stringify(i.schema, undefined, "    ") + "}"))
      let s = "[" + schema.join(", \r") + "]" 
      this.schema = JSON.stringify(JSON.parse(s.replace(": undefined", ": \"undefined\"")), undefined, "    ")
    }

    this.fileService.getFile(this.file).subscribe(ev => {
      this.aceEditor = ace.edit(this.editor.nativeElement);
      this.content = ev
      this.savedContent = ev
      setTimeout(() => this.aceEditor.focus(), 100)
    }, error => {
      console.error(error);
      alert(error.error)
    })
  }

  save() {
    if(this.content == this.savedContent) {
      return;
    }
    this.fileService.save(this.file, this.content).subscribe(s => {
      this.eventsService.emitEventEvent(new StepFileSaved(this.file, this.step))
      this.savedContent = this.content
      this.events = []
      this.events.push("edit")
    }, error => {
      console.error(error);
      alert(error.error)
    })
  }

  onChange(event: any) {
    this.events.push("edit")
    if(this.events.length > 1) {
      this.eventsService.emitEventEvent(new StepFileChanged(this.file, this.step))
    }
    if(this.content == this.savedContent) {
      this.events = []
      this.events.push("save")
      this.eventsService.emitEventEvent(new StepFileSaved(this.file, this.step))
    }
  }

}