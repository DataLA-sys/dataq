import { Component, Input, OnInit } from '@angular/core';
import { EventsService, Run, Schema } from 'src/app/services/events.service';
import { SettingService } from 'src/app/services/setting.service';
import { SysutilService, RunOperator } from 'src/app/services/sysutil.service';


@Component({
  selector: 'app-commands',
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.css']
})
export class CommandsComponent implements OnInit {

  private step_: string | undefined;
  @Input()
  get step(): string | undefined { 
    return this.step_ 
  }
  set step(value: string | undefined) {
    this.step_ = value
    this.runit = ""
  };

  run?: RunOperator = undefined
  runit: string = ""

  @Input()
  rows: number = 20
  @Input()
  cols: number = 100
  
  constructor(private sysutilService: SysutilService, private eventService: EventsService, 
    private settingsService: SettingService) { 
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
  
  getRunCommand() {
    if(this.step)
    this.settingsService.runCommand(this.step).subscribe(sh => this.runit = sh)
  }

  getPrintSchemaCommand() {
    if(this.step)
    this.settingsService.printSchemaCommand(this.step).subscribe(sh => this.runit = sh)  
  }

}
