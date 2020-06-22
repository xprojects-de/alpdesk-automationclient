import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicesviewComponent } from './devicesview.component';

describe('DevicesviewComponent', () => {
  let component: DevicesviewComponent;
  let fixture: ComponentFixture<DevicesviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevicesviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicesviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
