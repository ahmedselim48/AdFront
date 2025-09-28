import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

export const fadeInOut = trigger('fadeInOut', [
  state('in', style({ opacity: 1 })),
  transition('void => *', [
    style({ opacity: 0 }),
    animate('300ms ease-in')
  ]),
  transition('* => void', [
    animate('300ms ease-out', style({ opacity: 0 }))
  ])
]);

export const slideInOut = trigger('slideInOut', [
  state('in', style({ transform: 'translateX(0)' })),
  transition('void => *', [
    style({ transform: 'translateX(-100%)' }),
    animate('300ms ease-in')
  ]),
  transition('* => void', [
    animate('300ms ease-out', style({ transform: 'translateX(100%)' }))
  ])
]);

export const scaleInOut = trigger('scaleInOut', [
  state('in', style({ transform: 'scale(1)' })),
  transition('void => *', [
    style({ transform: 'scale(0)' }),
    animate('300ms ease-in')
  ]),
  transition('* => void', [
    animate('300ms ease-out', style({ transform: 'scale(0)' }))
  ])
]);

export const bounceIn = trigger('bounceIn', [
  transition('void => *', [
    animate('600ms ease-in', keyframes([
      style({ transform: 'scale(0)', offset: 0 }),
      style({ transform: 'scale(1.1)', offset: 0.6 }),
      style({ transform: 'scale(1)', offset: 1 })
    ]))
  ])
]);

export const pulse = trigger('pulse', [
  state('in', style({ transform: 'scale(1)' })),
  transition('* => *', [
    animate('1000ms ease-in-out', keyframes([
      style({ transform: 'scale(1)', offset: 0 }),
      style({ transform: 'scale(1.05)', offset: 0.5 }),
      style({ transform: 'scale(1)', offset: 1 })
    ]))
  ])
]);

export const slideUp = trigger('slideUp', [
  state('in', style({ transform: 'translateY(0)', opacity: 1 })),
  transition('void => *', [
    style({ transform: 'translateY(20px)', opacity: 0 }),
    animate('400ms ease-out')
  ])
]);

export const rotateIn = trigger('rotateIn', [
  transition('void => *', [
    style({ transform: 'rotate(-180deg)', opacity: 0 }),
    animate('500ms ease-in', style({ transform: 'rotate(0deg)', opacity: 1 }))
  ])
]);

export const staggerIn = trigger('staggerIn', [
  transition('void => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger(100, [
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ])
]);
