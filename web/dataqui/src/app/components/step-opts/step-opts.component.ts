import { Component, Input, OnInit, OnChanges, Type, SimpleChanges } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Step } from 'src/app/classes/step';
import { EntityService } from 'src/app/services/entity.service';
import { EventsService, File, Refresh, UpdateFileList } from 'src/app/services/events.service';
import { FilesService } from 'src/app/services/files.service';

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

  @Input()
  set step(step: Step | undefined) {
    this.step_ = step
    this.setOptsName()
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
  private eventsService: EventsService, private fileService: FilesService) {
    this.eventsService.eventEvent$.subscribe(ev => {
      if(ev instanceof Refresh){ this.step = undefined}
      if(ev instanceof UpdateFileList){ 
        this.fileService.getListFiles().subscribe(ev => this.files = ev, 
          error => {
            console.error(error)
            alert(error.error)
          }) 
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
  }
  get labels(): string[] {
    return this.usedOpts().flatMap((o: any) => Object.keys(o))
  }
  get types(): string[] {
    return this.usedOpts().flatMap((o: any) => this.getType(o))
  }

  openFile(file: string) {
    this.eventsService.emitEventEvent(new File(file))
  }

  deleteFile(file: string) {
    if(prompt("Are you sure delete file " + file + "?")) {
      this.fileService.delete(file).subscribe(s => alert(s), error => {console.error(error); alert(error.error)})
    }
  }

}
