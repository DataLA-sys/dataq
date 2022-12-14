import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { Node } from '@swimlane/ngx-graph';
import { EntityService } from 'src/app/services/entity.service';
import { Entity } from 'src/app/classes/entity';
import { CenterGraph, EventsService, FitGraph, GraphSize, RedrawGraph, Refresh, Schema, StepSelect } from 'src/app/services/events.service';
import { Step } from 'src/app/classes/step';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.styl']
})
export class GraphComponent implements OnInit, OnChanges {
  x: number = 1000;
  y: number = 1000;
  zoomToFit$: Subject<boolean> = new Subject();
  panToNode$: Subject<any> = new Subject();
  center$: Subject<boolean> = new Subject();
  clusters: any[] = []
  nodes: any[] = []
  links: any[] = []
  showMiniMap: boolean = false;
  showClusters: boolean = true;

  selected: Step | undefined;
  entity: Entity | undefined;

  checkIfSelected(node: Node) {
    return node.data.step == this.selected
  }

  fit() {
    this.zoomToFit$.next(true)
    this.center$.next(true)
  }

  center() {
    this.center$.next(true)
  }

  constructor(private entityService: EntityService, private eventService: EventsService,
    private sanitizer: DomSanitizer) { 
    this.fillGraphData()
    this.eventService.eventEvent$.subscribe(ev => {if(ev instanceof StepSelect) {this.selected = ev.step}})
    this.eventService.eventEvent$.subscribe(ev => {if(ev instanceof RedrawGraph) {this.fillGraphData()}})
    this.eventService.eventEvent$.subscribe(ev => {
      if(ev instanceof GraphSize) {
        setTimeout(() => {
          //this.y = ev.h - 7;
          //this.x = ev.w;
        }, 10)
      }
      if(ev instanceof CenterGraph) { this.center() }
      if(ev instanceof FitGraph) { this.fit() }
      if(ev instanceof Refresh) {this.fillGraphData()}
      if(ev instanceof Schema) {
        let found = this.entity?.steps.find(s=>s.name==ev.step)
        if(found) {
          found.schema = ev.schema
        }
      }
    })
  }

  getSVGImageUrl(image: string) {
    let base64string = btoa(image);
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `data:image/svg+xml;base64,${base64string}`
    );
  }

  fillGraphData() {
    this.entity = this.entityService.getEntity()
    if(this.selected && !this.entity.steps.includes(this.selected)){
      this.selected = undefined
    }
    this.nodes = this.entity?.steps.map(step => {
      return {
        id: step.name, 
        label: step.name, 
        data: {image: this.entityService.getStepImage(step.opt.name), step: step}
      }
    }) || []
    let i = 0
    this.links = this.entity?.steps.filter(s => s.in.length > 0).flatMap(s => s.in.map(in_ => {return {id: i++, source: in_.name, target: s.name} })) || []
  }

  ngOnChanges(changes: SimpleChanges) {
    this.fillGraphData()
  }

  ngOnInit(): void {
   
  }

  nodeClick(node: Node) {
    this.selected = node.data.step
    this.eventService.emitEventEvent(new StepSelect(node.data.step))
  }

}
