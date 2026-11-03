---
type: "query"
date: "2026-10-12T14:43:48.249665+00:00"
question: "Why are only three headings not shown with an arrow for Projects and Thoughts?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["renderEntryList()", "renderProjects()", "renderThoughts()"]
---

# Q: Why are only three headings not shown with an arrow for Projects and Thoughts?

## Answer

Expanded from original query via graph vocab: [render, projects, thoughts, entry, list, toggle, project]. Both renderProjects() and renderThoughts() call renderEntryList(), which keeps the first three entries visible and toggles the hidden remainder with one accessible arrow button.

## Outcome

- Signal: useful

## Source Nodes

- renderEntryList()
- renderProjects()
- renderThoughts()