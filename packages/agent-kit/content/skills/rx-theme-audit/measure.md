# The measuring function

Pass this function to the browser tool that evaluates JavaScript in the page (for example
`evaluate_script` in Chrome DevTools, or `javascript_tool` in browser automation). It is
read-only: it changes nothing on the page except scrolling images into view so they load.

It returns:

- `fails`: text whose contrast is under its WCAG AA target, with the colours, the measured
  ratio and the element's classes to trace it by;
- `lightSurfaces`: large elements with a light background, which in a dark theme usually
  means a component ignored the theme;
- `brightImages`: images whose average brightness is high, measured on a small canvas
  (cross-origin images report `unreadable`).

The background is found by walking up the ancestors and blending translucent layers, so text
over a gradient or a picture can be reported wrongly. Confirm those with a screenshot.

```js
async () => {
  const parse = (value) => {
    const srgb = value.match(/color\(srgb ([^)]+)\)/);
    const rgb = value.match(/rgba?\(([^)]+)\)/);
    const parts = (srgb ?? rgb)?.[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(Number);
    if (!parts) return null;
    const scale = srgb ? 255 : 1;
    return { r: parts[0] * scale, g: parts[1] * scale, b: parts[2] * scale, a: parts[3] ?? 1 };
  };
  const channel = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = ({ r, g, b }) =>
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  const over = (top, under) => ({
    r: top.r * top.a + under.r * (1 - top.a),
    g: top.g * top.a + under.g * (1 - top.a),
    b: top.b * top.a + under.b * (1 - top.a),
    a: 1,
  });
  const backgroundOf = (element) => {
    const layers = [];
    for (let node = element; node; node = node.parentElement) {
      const colour = parse(getComputedStyle(node).backgroundColor);
      if (colour && colour.a > 0) {
        layers.push(colour);
        if (colour.a >= 1) break;
      }
    }
    return layers.reduceRight((under, top) => over(top, under), { r: 255, g: 255, b: 255, a: 1 });
  };
  const opacityOf = (element) => {
    let opacity = 1;
    for (let node = element; node; node = node.parentElement)
      opacity *= Number(getComputedStyle(node).opacity);
    return opacity;
  };
  const hex = ({ r, g, b }) =>
    `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

  const fails = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const element = walker.currentNode.parentElement;
    if (!element || seen.has(element) || !walker.currentNode.textContent.trim()) continue;
    seen.add(element);
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    const opacity = opacityOf(element);
    const colour = parse(style.color);
    if (!colour || box.width === 0 || style.visibility === "hidden" || opacity < 0.05) continue;
    const background = backgroundOf(element);
    const text = over({ ...colour, a: colour.a * opacity }, background);
    const [light, dark] = [luminance(text), luminance(background)].sort((x, y) => y - x);
    const ratio = (light + 0.05) / (dark + 0.05);
    const size = parseFloat(style.fontSize);
    const large = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
    const target = large ? 3 : 4.5;
    if (ratio < target)
      fails.push({
        text: walker.currentNode.textContent.trim().slice(0, 40),
        element: `${element.tagName.toLowerCase()}.${[...element.classList].join(".")}`,
        colour: hex(text),
        background: hex(background),
        ratio: Number(ratio.toFixed(2)),
        target,
      });
  }

  const lightSurfaces = [...document.querySelectorAll("body *")]
    .filter((element) => {
      const colour = parse(getComputedStyle(element).backgroundColor);
      const box = element.getBoundingClientRect();
      return (
        colour && colour.a > 0.5 && luminance(colour) > 0.4 && box.width > 40 && box.height > 20
      );
    })
    .slice(0, 20)
    .map((element) => `${element.tagName.toLowerCase()}.${[...element.classList].join(".")}`);

  const brightImages = [];
  for (const image of document.images) {
    image.loading = "eager";
    await image.decode().catch(() => undefined);
    if (!image.naturalWidth) continue;
    let brightness = "unreadable";
    try {
      const canvas = Object.assign(document.createElement("canvas"), { width: 32, height: 32 });
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, 32, 32);
      const { data } = context.getImageData(0, 0, 32, 32);
      let sum = 0;
      let count = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 10) continue;
        sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
        count += 1;
      }
      brightness = count ? Math.round(sum / count) : 0;
    } catch {
      // A cross-origin image cannot be read back from the canvas.
    }
    if (brightness === "unreadable" || brightness > 200)
      brightImages.push({
        src: image.currentSrc.split("/").pop(),
        alt: image.alt.slice(0, 40),
        brightness,
      });
  }

  return {
    page: location.pathname,
    theme:
      document.documentElement.dataset.theme ??
      getComputedStyle(document.documentElement).colorScheme,
    textChecked: seen.size,
    fails,
    lightSurfaces,
    brightImages,
  };
};
```
