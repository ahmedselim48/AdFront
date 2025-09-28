import { Directive, EventEmitter, HostListener, Input, Output, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appDebounce]',
  standalone: true
})
export class DebounceDirective implements OnInit, OnDestroy {
  @Input() debounceTime = 300;
  @Output() debouncedEvent = new EventEmitter<Event>();

  private timeout: any;

  ngOnInit() {
    // Directive initialization
  }

  ngOnDestroy() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.debouncedEvent.emit(event);
    }, this.debounceTime);
  }

  @HostListener('keyup', ['$event'])
  onKeyUp(event: Event) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.debouncedEvent.emit(event);
    }, this.debounceTime);
  }
}
