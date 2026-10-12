import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile("site.js", "utf8");

function functionSource(name) {
  const start = source.indexOf(`function ${name}(`);
  const openingBrace = source.indexOf("{", start);
  let depth = 0;

  assert.notEqual(start, -1, `${name} must exist`);

  for (let index = openingBrace; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}" && --depth === 0) return source.slice(start, index + 1);
  }

  throw new Error(`Could not read ${name}`);
}

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.attributes = new Map();
    this.children = [];
    this.listeners = new Map();
    this.hidden = false;
  }

  append(...children) {
    this.children.push(...children);
  }

  replaceChildren(...children) {
    this.children = children;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(name, listener) {
    this.listeners.set(name, listener);
  }

  click() {
    this.listeners.get("click")?.();
  }
}

const document = { createElement: (tagName) => new FakeElement(tagName) };
const renderEntryList = vm.runInNewContext(`${functionSource("renderEntryList")}; renderEntryList`, { document });

test("projects and thoughts share the three-entry toggle", async () => {
  assert.match(source, /renderEntryList\(container, entries, "project"\)/);
  assert.match(source, /renderEntryList\(container, entries, "thought"\)/);

  const container = new FakeElement("section");
  const entries = Array.from({ length: 5 }, (_, index) => {
    const entry = new FakeElement("article");
    entry.textContent = `Test thought ${index + 1}`;
    return entry;
  });

  renderEntryList(container, entries, "thought");

  const [list, toggle] = container.children;
  assert.equal(list.children.length, 5);
  assert.deepEqual(entries.map(({ hidden }) => hidden), [false, false, false, true, true]);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(toggle.getAttribute("aria-label"), "Show 2 more thoughts");

  toggle.click();
  assert.deepEqual(entries.map(({ hidden }) => hidden), [false, false, false, false, false]);
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(toggle.getAttribute("aria-label"), "Show fewer thoughts");

  toggle.click();
  assert.deepEqual(entries.map(({ hidden }) => hidden), [false, false, false, true, true]);

  const styles = await readFile("style.css", "utf8");
  assert.match(styles, /dropdown-transparent\.png/);
  assert.match(styles, /\.entry-toggle\[aria-expanded="true"\]/);
  await access("assets/images/dropdown-transparent.png");
});

test("four projects use a singular accessible toggle label", () => {
  const container = new FakeElement("section");
  renderEntryList(container, Array.from({ length: 4 }, () => new FakeElement("article")), "project");
  assert.equal(container.children[1].getAttribute("aria-label"), "Show 1 more project");
});
