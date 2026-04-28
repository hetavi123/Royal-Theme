(function () {
    "use strict";

    if (window.matchMedia("(max-width: 900px)").matches) return;

    document.documentElement.classList.add("hero-loading");

    /* ── CHAR SPLIT ─────────────────────────────────────────────── */
    function splitLineInner(lineInner) {
        var text = lineInner.innerText.trim();
        lineInner.innerHTML = "";
        return text.split("").map(function (char) {
            var clip = document.createElement("span");
            clip.style.cssText = "display:inline-block;overflow:hidden;vertical-align:top;";
            var letter = document.createElement("span");
            letter.style.cssText = "display:inline-block;";
            if (char === " ") {
                letter.innerHTML = "&nbsp;";
                clip.style.width = "0.28em";
            } else {
                letter.textContent = char;
            }
            clip.appendChild(letter);
            lineInner.appendChild(clip);
            return letter;
        });
    }

    function splitSpoonLine(spoonFlex) {
        var chars = [];
        Array.from(spoonFlex.children).forEach(function (child) {
            if (child.classList.contains("hero-spoon-slot")) return;
            var text = child.innerText.trim();
            if (!text) return;
            child.innerHTML = "";
            text.split("").forEach(function (char) {
                var clip = document.createElement("span");
                clip.style.cssText = "display:inline-block;overflow:hidden;vertical-align:top;";
                var letter = document.createElement("span");
                letter.style.cssText = "display:inline-block;";
                if (char === " ") {
                    letter.innerHTML = "&nbsp;";
                    clip.style.width = "0.28em";
                } else {
                    letter.textContent = char;
                }
                clip.appendChild(letter);
                child.appendChild(clip);
                chars.push(letter);
            });
        });
        return chars;
    }

    /* ── BOOTSTRAP ──────────────────────────────────────────────── */
    function init() {
        if (typeof gsap === "undefined") { requestAnimationFrame(init); return; }
        document.fonts.ready.then(runAnimation);
    }

    /* ── MAIN ───────────────────────────────────────────────────── */
    function runAnimation() {
        var title = document.querySelector(".js-title");
        var lineInners = document.querySelectorAll(".js-li");
        var spoonFlex = document.querySelector(".js-spoon-flex");
        var spoonSlot = document.querySelector(".js-spoon-slot");
        var spoonImg = document.querySelector(".js-spoon-img");
        var img = document.querySelector(".js-img, .hero-img");
        var desc = document.querySelector(".js-desc");
        var layers = document.querySelectorAll(".hero-layer");

        if (!title || !lineInners.length) return;

        /* ── centre offset ───────────────────────────────────────── */
        var rect = title.getBoundingClientRect();
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var offsetX = vw / 2 - (rect.left + rect.width / 2);
        var offsetY = vh / 2 - (rect.top + rect.height / 2);
        title.style.transform = "translate(" + offsetX + "px," + offsetY + "px)";

        /* ── split chars ──────────────────────────────────────────── */
        var allChars = [];
        lineInners.forEach(function (li) {
            if (li.classList.contains("js-spoon-flex")) {
                allChars.push.apply(allChars, splitSpoonLine(li));
            } else {
                allChars.push.apply(allChars, splitLineInner(li));
            }
        });

        var layerArr = Array.from(layers);

        /* ── INITIAL STATES ──────────────────────────────────────── */
        gsap.set(title, { x: offsetX, y: offsetY, autoAlpha: 1 });
        gsap.set(allChars, { scale: 2.2, y: 40, autoAlpha: 0, transformOrigin: "center bottom" });
        gsap.set(spoonSlot, { width: 0 });
        gsap.set(spoonImg, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.3, rotate: -20 });
        if (desc) gsap.set(desc, { autoAlpha: 0, y: 20 });

        /* Layers: full width, start far off-screen right */
        gsap.set(layerArr, {
            x: vw,
            width: "100%",
            height: "100%"
        });

        /* Image: hidden via clipPath, wipes right→left */
        if (img) {
            gsap.set(img, {
                autoAlpha: 1,
                clipPath: "inset(0 0% 0 100%)"
            });
        }

        document.documentElement.classList.remove("hero-loading");

        /* ── TIMELINE ─────────────────────────────────────────────── */
        var tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        /* 1. Chars animate in */
        tl.to(allChars, {
            scale: 1, y: 0, autoAlpha: 1,
            duration: 0.65,
            stagger: { each: 0.04, from: "start" },
            ease: "back.out(1.4)",
        });

        /* 2. Title slides to final position */
        tl.to(title, {
            x: 0, y: 0, duration: 1.2, ease: "expo.inOut",
        }, "-=0.10");

        tl.addLabel("reveal", "-=0.20");

        /* 3. Spoon slot + gap open */
        tl.to(spoonSlot, { width: 120, duration: 0.5, ease: "back.out(1.5)" }, "reveal");
        if (spoonFlex) {
            tl.to(spoonFlex, { gap: 16, duration: 0.5, ease: "back.out(1.5)" }, "reveal");
        }

        /* 4. Spoon image pops in */
        tl.to(spoonImg, {
            autoAlpha: 1, scale: 1, rotate: 0, duration: 0.55, ease: "back.out(2.2)",
        }, "reveal+=0.10");

        /* 5. Description fades in */
        if (desc) {
            tl.to(desc, { autoAlpha: 1, y: 0, duration: 0.50 }, "reveal+=0.15");
        }

        /* ─────────────────────────────────────────────────────────
           6. LAYERS — slow cinematic sweep right → left
              Each layer travels full vw distance
              duration: 2.2s  (very slow, cinematic)
              stagger:  0.28s (clear visible gap between each strip)
              ease: power1.inOut = constant speed, no snap
        ──────────────────────────────────────────────────────────── */
        tl.to(layerArr, {
            x: -vw,
            duration: 2.2,
            ease: "power1.inOut",
            stagger: 0.28
        }, "reveal");

        /* ─────────────────────────────────────────────────────────
           7. IMAGE REVEAL — wipes right→left
              Starts slightly after first layer enters (0.3s delay)
              Duration matches total layer sweep window so image
              is fully revealed as last (blue) layer exits
        ──────────────────────────────────────────────────────────── */
        if (img) {
            tl.to(img, {
                clipPath: "inset(0 0% 0 0%)",
                duration: 2.0,
                ease: "power1.inOut"
            }, "reveal+=0.5");
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            requestAnimationFrame(function () { requestAnimationFrame(init); });
        });
    } else {
        requestAnimationFrame(function () { requestAnimationFrame(init); });
    }

})();