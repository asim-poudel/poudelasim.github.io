import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const text = (value, name) => {
  assert.equal(typeof value, "string", `${name} must be a string`);
  assert.ok(value.trim(), `${name} must not be empty`);
};

const httpsUrl = (value, name) => {
  text(value, name);
  assert.equal(new URL(value).protocol, "https:", `${name} must use HTTPS`);
};

const emailAddress = (value, name) => {
  text(value, name);
  assert.match(value, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, `${name} must be a valid email address`);
};

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const about = await readJson("about.json");
text(about.heading, "about.heading");
text(about.paragraph, "about.paragraph");

const projects = await readJson("project.json");
text(projects.heading, "projects.heading");
assert.ok(Array.isArray(projects.items), "projects.items must be an array");
projects.items.forEach((project, index) => {
  text(project.heading, `projects.items[${index}].heading`);
  text(project.description, `projects.items[${index}].description`);
  httpsUrl(project.websiteUrl, `projects.items[${index}].websiteUrl`);
  httpsUrl(project.githubUrl, `projects.items[${index}].githubUrl`);
});

const thoughts = await readJson("thoughts.json");
text(thoughts.heading, "thoughts.heading");
assert.ok(Array.isArray(thoughts.items), "thoughts.items must be an array");
thoughts.items.forEach((thought, index) => {
  text(thought.heading, `thoughts.items[${index}].heading`);
  text(thought.description, `thoughts.items[${index}].description`);
  httpsUrl(thought.blogUrl, `thoughts.items[${index}].blogUrl`);
});

const contact = await readJson("contact.json");
text(contact.heading, "contact.heading");
emailAddress(contact.email, "contact.email");
httpsUrl(contact.facebookUrl, "contact.facebookUrl");
httpsUrl(contact.instagramUrl, "contact.instagramUrl");
httpsUrl(contact.linkedinUrl, "contact.linkedinUrl");

console.log("Content JSON is valid.");
