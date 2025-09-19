import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdCreateComponent } from './ad-create.component';

describe('AdCreateComponentComponent', () => {
  let component: AdCreateComponent;
  let fixture: ComponentFixture<AdCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
