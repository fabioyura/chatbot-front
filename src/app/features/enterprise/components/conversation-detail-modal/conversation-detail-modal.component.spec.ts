import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationDetailModalComponent } from './conversation-detail-modal.component';

describe('ConversationDetailModalComponent', () => {
  let component: ConversationDetailModalComponent;
  let fixture: ComponentFixture<ConversationDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationDetailModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConversationDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
