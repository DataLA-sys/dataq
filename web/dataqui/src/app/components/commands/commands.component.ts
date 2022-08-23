import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EventsService, Run } from 'src/app/services/events.service';
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
      }
    })
  }

  ngOnInit(): void {
  }

  filter(text: string, filter: boolean = true): string {
    if (!filter) {
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

  refreshlog(command: RunOperator) {
    this.sysutilService.refreshLog(command).subscribe(value => {
      command.log = value
    })
  }  

}
