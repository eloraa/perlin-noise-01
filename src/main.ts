import { Effect } from './effect';
import './style.css';

declare global {
  interface String {
    format(): string;
  }
}

(function () {
  new Effect({ element: document.querySelector('.app')! });

  String.prototype.format = function (this: string) {
    let result = '';
    for (let i = 0; i < this.length; i++) result += '\\x' + this.charCodeAt(i).toString(16).padStart(2, '0');
    return result;
  };

  const DOM = {
    atob: document.querySelector('.atob') as HTMLElement,
    sub: document.querySelector('.sub') as HTMLElement,
    in: document.querySelector('input[name=pass]') as HTMLInputElement,
    copy: document.querySelector('.atob button'),
  };
  DOM.sub?.addEventListener('click', (e): void => {
    e.preventDefault();
    DOM.atob!.classList.remove('none');

    DOM.atob!.querySelector('p')!.textContent = atob(DOM.in.value).format();
  });

  let timeline: number | undefined;

  DOM.copy?.addEventListener('click', () => {
    if (timeline) clearTimeout(timeline);
    DOM.copy?.classList.add('copied');

    timeline = setTimeout(() => {
      DOM.copy?.classList.remove('copied');
    }, 2000);

    navigator.clipboard.writeText(DOM.atob!.querySelector('p')!.textContent!);
  });
})();
