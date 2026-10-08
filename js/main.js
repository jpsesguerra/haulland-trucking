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

  // ── Header "Call Us" CTA: Contact page on desktop, phone call on phones ──
  var callCta = document.querySelector('.nav-call-cta');
  if (callCta) {
    var phoneQuery = window.matchMedia('(max-width: 767px), (hover: none) and (pointer: coarse)');
    var setCallHref = function () {
      callCta.href = phoneQuery.matches ? callCta.dataset.tel : '/contact-us';
    };
    setCallHref();
    if (phoneQuery.addEventListener) phoneQuery.addEventListener('change', setCallHref);
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

  // ── Phone click tracking ──
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="tel:"]');
    if (link) {
      gtag('event', 'phone_click', { page_path: window.location.pathname });
    }
  });

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
            gtag('event', 'form_submit', { page_path: window.location.pathname });
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
