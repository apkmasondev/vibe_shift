document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('is-ready');

  const header = document.querySelector('.site-header');
  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 28);
    const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    document.documentElement.style.setProperty('--page-progress', `${Math.min(100, (window.scrollY / available) * 100)}%`);
  };
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const alignTimelineNodes = () => {
    const rail = document.querySelector('.timeline-rail');
    const path = document.querySelector('.path-progress');
    if (!rail || !path) return;
    const railBox = rail.getBoundingClientRect();
    const totalLength = path.getTotalLength();
    const viewBoxWidth = 320;
    const viewBoxHeight = 1400;

    document.querySelectorAll('.timeline-step').forEach((step) => {
      const marker = step.querySelector('.step-node');
      if (!marker) return;
      const markerBox = marker.getBoundingClientRect();
      const previousShift = Number.parseFloat(marker.dataset.pathShift || '0');
      const baseCenterX = markerBox.left + markerBox.width / 2 - previousShift;
      const markerCenterY = markerBox.top + markerBox.height / 2;
      const targetY = Math.max(0, Math.min(viewBoxHeight, ((markerCenterY - railBox.top) / railBox.height) * viewBoxHeight));

      let low = 0;
      let high = totalLength;
      for (let i = 0; i < 16; i += 1) {
        const middle = (low + high) / 2;
        if (path.getPointAtLength(middle).y < targetY) low = middle;
        else high = middle;
      }
      const point = path.getPointAtLength((low + high) / 2);
      const pathCenterX = railBox.left + (point.x / viewBoxWidth) * railBox.width;
      const shift = pathCenterX - baseCenterX;
      marker.dataset.pathShift = shift.toFixed(2);
      marker.style.setProperty('--node-shift-x', `${shift.toFixed(2)}px`);
    });
  };

  let alignFrame = 0;
  const scheduleTimelineAlignment = () => {
    if (alignFrame) cancelAnimationFrame(alignFrame);
    alignFrame = requestAnimationFrame(() => {
      alignTimelineNodes();
      alignFrame = 0;
    });
  };
  window.addEventListener('resize', scheduleTimelineAlignment, { passive: true });
  document.fonts?.ready.then(scheduleTimelineAlignment);
  scheduleTimelineAlignment();

  if (!reduceMotion && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true, syncTouch: true });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
  }

  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.addEventListener('refresh', scheduleTimelineAlignment);
    const progress = document.querySelector('.path-progress');
    if (progress) {
      const length = progress.getTotalLength();
      gsap.set(progress, { strokeDasharray: length, strokeDashoffset: length });
      const runner = document.querySelector('.timeline-runner');
      gsap.to(progress, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.journey-stage', start: 'top 62%', end: 'bottom 62%', scrub: 0.6, onUpdate: (self) => {
        if (!runner) return;
        const point = progress.getPointAtLength(length * self.progress);
        runner.style.setProperty('--runner-x', `${(point.x / 320) * 100}%`);
        runner.style.setProperty('--runner-y', `${(point.y / 1400) * 100}%`);
        runner.style.opacity = self.progress > 0.005 && self.progress < 0.998 ? '1' : '0';
      } } });
    }
    gsap.utils.toArray('.timeline-step').forEach((step) => {
      gsap.fromTo(step.querySelector('article'), { opacity: 0.42, y: 22, filter: 'blur(2px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: step, start: 'top 72%', end: 'top 43%', scrub: 0.8, onEnter: () => step.classList.add('is-active'), onEnterBack: () => step.classList.add('is-active'), onLeaveBack: () => step.classList.remove('is-active') } });
    });
    gsap.from('.manifesto h2', { y: 70, opacity: 0, duration: 1, scrollTrigger: { trigger: '.manifesto', start: 'top 75%' } });
    gsap.utils.toArray('.agent-card').forEach((card, i) => gsap.from(card, { y: 80, opacity: 0, duration: .8, delay: i * .12, ease: 'power3.out', scrollTrigger: { trigger: '.agent-grid', start: 'top 78%' } }));
    gsap.to('.orbit-a', { yPercent: 18, xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    gsap.to('.orbit-b', { yPercent: 30, xPercent: 7, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 } });
    gsap.utils.toArray('.section-kicker').forEach((kicker) => gsap.from(kicker, { opacity: 0, x: -24, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: kicker, start: 'top 88%' } }));
    gsap.utils.toArray('.principles-list article').forEach((item, i) => gsap.from(item, { opacity: 0, x: 28, duration: .65, delay: i * .08, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 88%' } }));
    gsap.utils.toArray('.timeline-step h3').forEach((heading) => gsap.from(heading, { backgroundPositionX: '120%', duration: 1.1, ease: 'power2.out', scrollTrigger: { trigger: heading, start: 'top 82%' } }));
    gsap.utils.toArray('.step-art, .code-card, .plan-stack, .build-metrics, .proof-card').forEach((visual) => gsap.from(visual, { opacity: 0, y: 28, scale: .96, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: visual, start: 'top 88%' } }));
    gsap.from('.launch h2', { opacity: 0, y: 55, filter: 'blur(8px)', duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.launch', start: 'top 75%' } });
    gsap.utils.toArray('.manifesto-copy, .journey-intro, .agents-head > p').forEach((copy) => gsap.from(copy, { opacity: 0, y: 24, filter: 'blur(4px)', duration: .9, ease: 'power3.out', scrollTrigger: { trigger: copy, start: 'top 86%' } }));
  } else {
    document.documentElement.classList.add('motion-fallback');
    document.querySelectorAll('.timeline-step').forEach((step) => step.classList.add('is-active'));
  }

  const glow = document.querySelector('.cursor-glow');
  if (glow && !reduceMotion) {
    let frame = 0;
    window.addEventListener('pointermove', (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => { document.documentElement.style.setProperty('--mx', `${event.clientX - 180}px`); document.documentElement.style.setProperty('--my', `${event.clientY - 180}px`); frame = 0; });
    }, { passive: true });
  }

  document.querySelectorAll('.magnetic').forEach((button) => {
    if (reduceMotion) return;
    button.addEventListener('pointermove', (event) => { const box = button.getBoundingClientRect(); const x = (event.clientX - box.left - box.width / 2) * .16; const y = (event.clientY - box.top - box.height / 2) * .16; button.style.transform = `translate(${x}px, ${y}px)`; });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });

  document.querySelectorAll('.agent-card').forEach((card) => {
    if (reduceMotion) return;
    card.addEventListener('pointermove', (event) => {
      const box = card.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width) * 100;
      const y = ((event.clientY - box.top) / box.height) * 100;
      card.style.setProperty('--card-x', `${x}%`);
      card.style.setProperty('--card-y', `${y}%`);
      card.style.setProperty('--tilt-y', `${((x - 50) / 50) * 4}deg`);
      card.style.setProperty('--tilt-x', `${((50 - y) / 50) * 4}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });

  const heroConsole = document.querySelector('.hero-console');
  if (heroConsole && !reduceMotion) {
    heroConsole.addEventListener('pointermove', (event) => {
      const box = heroConsole.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5;
      const y = (event.clientY - box.top) / box.height - .5;
      heroConsole.style.setProperty('--console-ry', `${x * 5}deg`);
      heroConsole.style.setProperty('--console-rx', `${y * -4}deg`);
    });
    heroConsole.addEventListener('pointerleave', () => {
      heroConsole.style.setProperty('--console-ry', '0deg');
      heroConsole.style.setProperty('--console-rx', '0deg');
    });
  }
});
