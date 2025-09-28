import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() rootMargin = '50px';
  @Input() threshold = 0.1;
  @Output() lazyLoad = new EventEmitter<void>();

  private observer: IntersectionObserver | null = null;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.createObserver();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private createObserver() {
    const options = {
      root: null,
      rootMargin: this.rootMargin,
      threshold: this.threshold
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.lazyLoad.emit();
          if (this.observer) {
            this.observer.unobserve(entry.target);
          }
        }
      });
    }, options);

    this.observer.observe(this.elementRef.nativeElement);
  }
}
