import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocketviewComponent } from './socketview.component';

describe('SocketviewComponent', () => {
  let component: SocketviewComponent;
  let fixture: ComponentFixture<SocketviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocketviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocketviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
