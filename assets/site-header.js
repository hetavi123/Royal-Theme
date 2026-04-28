/**
 * site-header.js
 * EISLAB — minimal header behaviour
 * Sticky scroll + drawer open/close only
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        stickyHeader();
        drawerMenu();
    });

    /* ── Sticky: transparent → cream on scroll ───────────────── */
    function stickyHeader() {
        const header = document.getElementById('site-header');
        if (!header) return;

        const sentinel = document.createElement('div');
        sentinel.style.cssText =
            'position:absolute;top:1px;left:0;width:1px;height:1px;pointer-events:none;';
        document.body.prepend(sentinel);

        new IntersectionObserver(
            ([entry]) => header.classList.toggle('is-scrolled', !entry.isIntersecting),
            { threshold: 0 }
        ).observe(sentinel);
    }

    /* ── Drawer open / close ─────────────────────────────────── */
    function drawerMenu() {
        const menuBtn = document.querySelector('.sh__menu-btn[data-sh-toggle]');
        const drawer = document.getElementById('sh-drawer');
        if (!menuBtn || !drawer) return;

        document.querySelectorAll('[data-sh-toggle]').forEach(function (btn) {
            btn.addEventListener('click', toggle);
        });

        drawer.querySelectorAll('.sh__drawer-link').forEach(function (link) {
            link.addEventListener('click', close);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });

        function toggle() {
            drawer.classList.contains('is-open') ? close() : open();
        }

        function open() {
            menuBtn.setAttribute('aria-expanded', 'true');
            menuBtn.setAttribute('aria-label', 'Close menu');
            drawer.classList.add('is-open');
            drawer.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function close() {
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.setAttribute('aria-label', 'Open menu');
            drawer.classList.remove('is-open');
            drawer.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

})();