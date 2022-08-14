import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FilesService } from 'src/app/services/files.service';
import 'brace'
import 'brace/mode/sql'
import 'brace/theme/eclipse'
import * as ace from "ace-builds";
import { EventsService, FileChanged, FileSaved, MainSave } from 'src/app/services/events.service';

@Component({
  selector: 'app-open-file',
  templateUrl: './open-file.component.html',
  styleUrls: ['./open-file.component.styl']
})
export class OpenFileComponent implements OnInit {

  @ViewChild("editor") private editor!: ElementRef<HTMLElement>;

  @Input()
  file!: string;
  events: string[] = []
  aceEditor!: ace.Ace.Editor;

  constructor(private fileService: FilesService, private eventsService: EventsService) {
    this.eventsService.eventEvent$.subscribe(ev => {
      if(ev instanceof MainSave) {
        this.save()
      }
    })
  }

  content: any = "";
  savedContent: any = "";
  
  ngOnInit(): void {
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
      this.eventsService.emitEventEvent(new FileSaved(this.file))
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
      this.eventsService.emitEventEvent(new FileChanged(this.file))
    }
    if(this.content == this.savedContent) {
      this.events = []
      this.events.push("save")
      this.eventsService.emitEventEvent(new FileSaved(this.file))
    }
  }

}