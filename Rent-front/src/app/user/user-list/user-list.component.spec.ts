import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListUserComponent } from './user-list.component';

describe('ListLocataireComponent', () => {
  let component: ListUserComponent;
  let fixture: ComponentFixture<ListUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
