import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Step } from 'src/app/classes/step';
import { EntityService } from 'src/app/services/entity.service';
import { EventsService, RedrawGraph, Refresh, StepSelect, UnSelect } from 'src/app/services/events.service';

@Component({
  selector: 'app-step-props',
  templateUrl: './step-props.component.html',
  styleUrls: ['./step-props.component.styl']
})
export class StepPropsComponent implements OnInit, OnChanges {
  step: Step | undefined = undefined;
  steps: Step[];
 
  selectedStep: Step | undefined;

  constructor(private eventService: EventsService, private entityServis: EntityService) { 
    this.eventService.eventEvent$.subscribe(ev => {
      if(ev instanceof StepSelect) {
        this.step = ev.step
      }
      if(ev instanceof UnSelect) {
        this.step = undefined
      }
      if(ev instanceof Refresh) {
        this.step = undefined
        this.steps = this.entityServis.getEntity().steps;    
      }
    })
    this.steps = this.entityServis.getEntity().steps;
  }

  addIn(step: Step) {
    if(this.step) {
      this.step.in.push(step)
      this.eventService.emitEventEvent(new RedrawGraph())
    }
  }

  rmIn(step: Step | undefined) {
    if(this.step && step) {
      let idx = this.step.in.indexOf(step)
      if(idx >= 0) {
        this.step.in.splice(idx, 1)
        this.eventService.emitEventEvent(new RedrawGraph())
      }
    }
  }

  filtered(): Step[] {
    return this.steps.filter(s => !(s === this.step || this.step?.in.includes(s)))
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    console.log(changes)
  }

}
