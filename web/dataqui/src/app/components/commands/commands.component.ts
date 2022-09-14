import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EventsService, Run, Schema } from 'src/app/services/events.service';
import { SysutilService, RunOperator } from 'src/app/services/sysutil.service';


@Component({
  selector: 'app-commands',
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.css']
})
export class CommandsComponent implements OnInit {

  @Input()
  step: string | undefined;

  run?: RunOperator = undefined
  runit: string = ""
  
  constructor(private sysutilService: SysutilService, private eventService: EventsService) { 
    this.eventService.eventEvent$.subscribe(ev => {
      if(ev instanceof Run) {
        if(ev.step == this.step) {
          this.runit = ev.sh
        }
        if(this.step == undefined) {
          this.runit = ev.sh
        }
      }
    })
  }

  ngOnInit(): void {
  }

  filter(text: string, filter: boolean = true): string {
    if (!filter) {
      return text
    }
    if(text == undefined) {
      return text
    }
    let textarray = text.split("\n")
    return textarray
      .filter(l => !l.includes(" INFO ")) 
      .filter(l => !l.includes(" DEBUG "))
      .filter(l => !l.includes(" WARN ")).join("\n")
  }

  runIt(shcommand: string) {
    this.sysutilService.runShCommand(shcommand).subscribe(value => {
      this.run = this.sysutilService.commands.find(c => c.runid == value);
    })
  }

  private findSchema(log: string) {
    let start = log.indexOf("schema start")
    if(start > -1) {
      let finish = log.indexOf("schema finish")
      let copy = log.slice(start, finish)
      let step = copy.slice("schema start ".length, copy.indexOf(" step"))
      copy = copy.slice(copy.indexOf("{"))
      this.eventService.emitEventEvent(new Schema(step, JSON.parse(copy)))
    }
  }

  refreshlog(command: RunOperator | undefined) {
    if(command) {
      this.sysutilService.refreshLog(command).subscribe(value => {
        command.log = value
        this.findSchema(value)
      })
    }
  }  

}
