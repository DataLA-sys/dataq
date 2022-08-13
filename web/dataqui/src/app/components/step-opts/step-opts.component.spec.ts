import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepOptsComponent } from './step-opts.component';

describe('StepOptsComponent', () => {
  let component: StepOptsComponent;
  let fixture: ComponentFixture<StepOptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepOptsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepOptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
