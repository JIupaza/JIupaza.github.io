/* Ярослав Шапорев — сайт-визитка · behaviour */
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- nav scroll state --- */
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --- scroll reveal --- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* --- live crypto ticker (CoinGecko public API, no key) --- */
  const COINS = [
    { id: 'bitcoin',  sym: 'BTC', name: 'Bitcoin'  },
    { id: 'ethereum', sym: 'ETH', name: 'Ethereum' },
    { id: 'solana',   sym: 'SOL', name: 'Solana'   },
    { id: 'the-open-network', sym: 'TON', name: 'Toncoin' },
  ];
  const body = document.getElementById('ticker-body');
  if (body) {
    const fmt = (n) => n >= 1000
      ? '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });

    const render = (data) => {
      body.innerHTML = COINS.map(c => {
        const d = data[c.id];
        if (!d) return '';
        const chg = d.usd_24h_change ?? 0;
        const dir = chg >= 0 ? 'up' : 'down';
        const sign = chg >= 0 ? '▲' : '▼';
        return `<div class="ticker__row">
          <span class="ticker__sym">${c.sym}<small>${c.name}</small></span>
          <span class="ticker__price">${fmt(d.usd)}</span>
          <span class="ticker__chg ${dir}">${sign} ${Math.abs(chg).toFixed(2)}%</span>
        </div>`;
      }).join('');
    };

    const load = async () => {
      try {
        const ids = COINS.map(c => c.id).join(',');
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(res.status);
        render(await res.json());
      } catch (err) {
        if (!body.children.length) {
          body.innerHTML = COINS.map(c =>
            `<div class="ticker__row"><span class="ticker__sym">${c.sym}<small>${c.name}</small></span>` +
            `<span class="ticker__price" style="color:var(--faint)">—</span>` +
            `<span class="ticker__chg" style="color:var(--faint)">офлайн</span></div>`
          ).join('');
        }
      }
    };
    load();
    setInterval(load, 60000);
  }

  /* --- year --- */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
