import { Component, Input, OnInit, OnChanges, Type, SimpleChanges } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Step } from 'src/app/classes/step';
import { EntityService } from 'src/app/services/entity.service';
import { EventsService, StepFile, Refresh, Run, UpdateFileList, RedrawGraph, Schema } from 'src/app/services/events.service';
import { FilesService } from 'src/app/services/files.service';
import { SettingService } from 'src/app/services/setting.service';

@Component({
  selector: 'app-step-opts',
  templateUrl: './step-opts.component.html',
  styleUrls: ['./step-opts.component.styl']
})
export class StepOptsComponent implements OnInit, OnChanges {
  private step_: Step | undefined;
  private myType: any;
  optsTypes!: any;
  files: string[] = ["file.sql"]
  prettySchema: any

  @Input()
  set step(step: Step | undefined) {
    this.step_ = step
    this.setOptsName()
    this.prettySchema = this.getPrettySchema()
    this.eventsService.emitEventEvent(new UpdateFileList())
  }

  get step(): Step | undefined {
    return this.step_;
  }

  private setOptsName() {
    this.entityService.getOptType().subscribe(optsTypes => {
      this.entityService.options = optsTypes
      this.optsTypes = optsTypes
      this.myType = optsTypes.find((ot: any) => ot.name === this.step?.opt?.name)
      this.optsControl = this.fb.group({
        opt: this.fb.array(
          this.usedOpts().map((s: any) => {
            let option = Object.keys(s)[0]
            let value: any = this.step?.opt?.opts?.find(o => o.option === option)?.value
  
            if(Object.values(s)[0] === "string") {
              return this.fb.control(value)
            }
            if(Object.values(s)[0] === "number") {
              return this.fb.control(value)
            }
            return this.fb.control(value)
          })
        )
      })
  
      this.optsControl.valueChanges.subscribe(s => {
        let labels: string[] = this.labels
        let value: any[] = []
        s.opt.forEach((o: any, idx: number) => {
          let res: any = {}
          res["option"] = labels[idx]
          res["value"] = o
          value.push(res)
        });
        if(this.step && this.step.opt) {
          this.step.opt.opts = value
        } else {
          if(this.step) {
            this.step.opt = {name: "SparkSQL", opts: value}
          }
        }
  
      })
    })

  }

  optsControl: FormGroup | undefined;

  private getType(option: any): string {
    if(Array.isArray(Object.values(option)[0])) {
      return "array"
    }
    if(typeof Object.values(option)[0] === "object") {
      return "object"
    }
    return "" + Object.values(option)[0]
  }

  private usedOpts() {
    if(this.myType) {
      if(this.myType.opts) {
        return this.myType.opts.filter((o: any) => ["string", "boolean", "number"].includes(this.getType(o)))
      }
    }
    return []
  }

 constructor(private fb: FormBuilder, private entityService: EntityService, 
  private eventsService: EventsService, private fileService: FilesService,
  private settingsService: SettingService) {
    this.eventsService.eventEvent$.subscribe(ev => {
      if(ev instanceof Refresh){ this.step = undefined}
      if(ev instanceof UpdateFileList){ 
        this.fileService.getListFiles().subscribe(ev => this.files = ev, 
          error => {
            console.error(error)
            alert(error.error)
          }) 
        }
        if(ev instanceof Schema){
          if(ev.step == this.step_?.name){
            this.prettySchema = this.getPrettySchema()
          }
        }
    })
  }

  get opt(): FormArray {
    return this.optsControl?.get('opt') as FormArray;
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    
  }

  modelChangeFn(l: any){
    this.setOptsName()
    this.eventsService.emitEventEvent(new RedrawGraph())
  }
  get labels(): string[] {
    return this.usedOpts().flatMap((o: any) => Object.keys(o))
  }
  get types(): string[] {
    return this.usedOpts().flatMap((o: any) => this.getType(o))
  }

  openFile(file: string) {
    if(this.step_) {
      this.eventsService.emitEventEvent(new StepFile(file, this.step_.name))
    }
  }

  deleteFile(file: string) {
    if(confirm("Are you sure delete file " + file + "?")) {
      this.fileService.delete(file).subscribe(s => alert(s), error => {console.error(error); alert(error.error)})
      this.opt.controls.forEach(c => {
        if(c.value === file) {
          c.setValue("")
        }
      })
      this.eventsService.emitEventEvent(new UpdateFileList())
    }
  }

  run() {
    this.settingsService.getSettings().subscribe(st => {
      let s = st.sparkSubmit + " --master local" +
      " " + st.projects + "/q.py" +
      " sparkApp=" + st.projects + "/" + this.entityService.getEntity().name + "/" + this.entityService.getEntity().name + ".json" + 
      " stepTo=" + this.step_?.name
      if(this.step_) {
        this.eventsService.emitEventEvent(new Run(s, this.step_?.name))
      }
    })
    
  }

  printSchema() {
    this.settingsService.getSettings().subscribe(st => {
      let s = st.sparkSubmit +  " --master local" +
      " " + st.projects + "/q.py" +
      " sparkApp=" + st.projects + "/" + this.entityService.getEntity().name + "/" + this.entityService.getEntity().name + ".json" + 
      " stepTo=" + this.step_?.name + 
      " printSchema=true"
      if(this.step_) {
        this.eventsService.emitEventEvent(new Run(s, this.step_?.name))
      }
    })
  }

  sourcesOpts() {
    if(this.optsTypes) {
      return this.optsTypes.filter((o: any)=>o.type==='source')
    } else {
      return []
    }
  }
  stepsOpts() {
    if(this.optsTypes) {
      return this.optsTypes.filter((o: any)=>o.type===undefined)
    } else {
      return []
    }
  }
  targetsOpts() {
    if(this.optsTypes) {
      return this.optsTypes.filter((o: any)=>o.type==='target')
    } else {
      return []
    }
  }
  
  private getPrettySchema() {
    let a = this.step_?.schema
    if(a) {
      return JSON.stringify(a, undefined, "   ")
    } else {
      return undefined
    }
  }
}
