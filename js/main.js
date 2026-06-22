document.addEventListener('DOMContentLoaded', function () {

  // ── Scroll-aware nav background ──
  var nav = document.querySelector('.sticky-nav');
  function updateNav() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // ── Mobile nav toggle ──
  var menuBtn = document.querySelector('.menu-button');
  var navMenu = document.querySelector('.nav-menu');

  // Inject phone number link before the Order Now button (mobile only)
  if (navMenu) {
    var orderNowBtn = navMenu.querySelector('.brokrete-trigger.nav');
    var phoneLink = document.createElement('a');
    phoneLink.href = 'tel:+19055379832';
    phoneLink.className = 'mobile-phone-link';
    phoneLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>(905) 537-9832';
    if (orderNowBtn) {
      navMenu.insertBefore(phoneLink, orderNowBtn);
    } else {
      navMenu.appendChild(phoneLink);
    }
  }

  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', function () {
      navMenu.classList.toggle('open');
      menuBtn.classList.toggle('open');
    });
  }

  // ── Services dropdown (mobile tap toggle) ──
  var dropdownWrap = document.querySelector('.nav-dropdown-wrap');
  var dropdownToggle = dropdownWrap && dropdownWrap.querySelector('.nav-link---inner');
  var dropdown = dropdownWrap && dropdownWrap.querySelector('.nav-dropdown');

  if (dropdownToggle && dropdown) {
    dropdownToggle.addEventListener('click', function (e) {
      if (window.innerWidth < 768) {
        e.preventDefault();
        dropdown.classList.toggle('open');
        dropdownToggle.classList.toggle('open');
      }
    });
  }

  // Close nav/dropdown when clicking outside
  document.addEventListener('click', function (e) {
    if (navMenu && !e.target.closest('.nav-holder')) {
      navMenu.classList.remove('open');
      menuBtn && menuBtn.classList.remove('open');
    }
    if (dropdown && !e.target.closest('.nav-dropdown-wrap')) {
      dropdown.classList.remove('open');
      dropdownToggle && dropdownToggle.classList.remove('open');
    }
  });

  // ── YouTube lightbox ──
  var ytTriggers = document.querySelectorAll('.yt-trigger');
  var ytBackdrop = document.querySelector('.yt-modal-backdrop');
  var ytIframe = document.querySelector('.yt-modal-iframe');
  var ytClose = document.querySelector('.yt-modal-close');

  function openYT(url) {
    if (!ytBackdrop || !ytIframe) return;
    ytIframe.src = url + '?autoplay=1';
    ytBackdrop.classList.add('open');
  }

  function closeYT() {
    if (!ytBackdrop || !ytIframe) return;
    ytBackdrop.classList.remove('open');
    ytIframe.src = '';
  }

  ytTriggers.forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openYT(el.dataset.ytUrl);
    });
  });

  if (ytClose) ytClose.addEventListener('click', closeYT);
  if (ytBackdrop) {
    ytBackdrop.addEventListener('click', function (e) {
      if (e.target === ytBackdrop) closeYT();
    });
  }

  // ── Web3Forms submission ──
  document.querySelectorAll('form[action="https://api.web3forms.com/submit"]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      fetch('https://api.web3forms.com/submit', { method: 'POST', body: data })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (json.success) {
            form.style.display = 'none';
            var success = form.closest('.contact-form').querySelector('.success');
            if (success) success.style.display = 'block';
          } else {
            alert('Something went wrong. Please try again or call us directly.');
          }
        })
        .catch(function () {
          alert('Something went wrong. Please try again or call us directly.');
        });
    });
  });

  // ── Brokrete "Order Now" triggers ──
  document.querySelectorAll('.brokrete-trigger').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.postMessage({ name: 'BrokreteWidget', action: 'open' }, '*');
    });
  });

});
