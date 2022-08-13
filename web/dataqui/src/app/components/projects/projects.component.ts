import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { EntityService } from 'src/app/services/entity.service';
import { EventsService, RefreshProjects } from 'src/app/services/events.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.styl']
})
export class ProjectsComponent implements OnInit {

  @Output()
  onDrawerToggle = new EventEmitter<boolean>();
    
  projects: string[] = []

  toggleDrawer() {
    this.load()
    this.onDrawerToggle.emit(true);
  }
  
  constructor(private entityService: EntityService, private eventsService: EventsService) {
    eventsService.eventEvent$.subscribe(ev => {if(ev instanceof RefreshProjects) {this.load()}})
  }

  private load(){
    this.entityService.loadList().subscribe(
      s => {
        this.projects = s
        console.log(s)
      },
      error => {
        alert(error.error)
        console.log(error)
      }
    )
   }

  ngOnInit(): void {
    this.load()
  }

  loadProject(name: string) {
    this.entityService.loadEntity(name)
    this.toggleDrawer();
  }

}
