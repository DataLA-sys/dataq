import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepLinksComponent } from './step-links.component';

describe('StepLinksComponent', () => {
  let component: StepLinksComponent;
  let fixture: ComponentFixture<StepLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepLinksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
