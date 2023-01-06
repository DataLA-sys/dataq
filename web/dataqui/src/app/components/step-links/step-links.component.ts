import { Component, OnChanges, Input, OnInit, SimpleChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Step } from 'src/app/classes/step';
import { EntityService } from 'src/app/services/entity.service';
import { EventsService, RedrawGraph, Refresh, StepSelect, UnSelect } from 'src/app/services/events.service';

@Component({
  selector: 'app-step-links',
  templateUrl: './step-links.component.html',
  styleUrls: ['./step-links.component.styl']
})
export class StepLinksComponent implements OnInit, OnChanges {
  private step_: Step | undefined = undefined
  forAdd: Step[] = []
  
  get step(): Step | undefined {
    return this.step_
  }

  @Input()
  set step(value: Step | undefined) {
    this.step_ = value
    this.steps = this.entityServis.getEntity().steps
    this.selectedStep = undefined
    this.test()
  }

  steps: Step[];
 
  selectedStep: Step | undefined;

  constructor(private eventService: EventsService, private entityServis: EntityService) { 
    this.eventService.eventEvent$.subscribe(ev => {
      if(ev instanceof Refresh) {
        this.steps = this.entityServis.getEntity().steps;    
      }
    })
    this.steps = this.entityServis.getEntity().steps;
  }

  private check(step: Step): Observable<boolean> {
    if(step === this.step_) {
      return of(false)
    }
    if(this.step_) {
      if(this.step_.in.indexOf(step) > -1) {
        return of(false)
      }
    }
    return this.entityServis.getOptType().pipe(
      map(opts => {
        if(this.step) {
          let add = opts.find((o:any)=>step.opt.name==o.name)
          let myopt = opts.find((o:any)=>this.step?.opt.name==o.name)
          if(add.type == "target") {
            return false
          }
          if(myopt.type == "source") {
            return false
          }
          if(myopt.type == "target") {
            if(this.step?.in?.length > 0) {
              return false
            }
          }
          return true
        }
        return false
      }))
  }

  private test() {
    this.forAdd = []
    this.steps.forEach(s => this.check(s).subscribe(b => {if(b === true) {
      this.forAdd.push(s)
    }}))
  }

  addIn(step: Step) {
    if(this.step) {
      this.step.in.push(step)
      this.eventService.emitEventEvent(new RedrawGraph())
      this.test()
    }
  }

  rmIn(step: Step | undefined) {
    if(this.step && step) {
      let idx = this.step.in.indexOf(step)
      if(idx >= 0) {
        this.step.in.splice(idx, 1)
        this.eventService.emitEventEvent(new RedrawGraph())
      }
      this.test()
    }
  }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges) {

  }

  onSelection(e: any, v: any) {
//    let selected = e.option.selected
    let step: Step | undefined = e.option.value
    this.selectedStep = step
//    if(selected && step) {
//      this.eventService.emitEventEvent(new StepSelect(step))
//    }
  }

}
