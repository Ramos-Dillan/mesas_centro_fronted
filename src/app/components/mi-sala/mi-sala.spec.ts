import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiSala } from './mi-sala';

describe('MiSala', () => {
  let component: MiSala;
  let fixture: ComponentFixture<MiSala>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiSala],
    }).compileComponents();

    fixture = TestBed.createComponent(MiSala);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
