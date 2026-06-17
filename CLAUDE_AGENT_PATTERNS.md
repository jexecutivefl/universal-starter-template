# CLAUDE_AGENT_PATTERNS.md — Extended Intelligence

> This is the deep-dive companion to `CLAUDE.md`. `CLAUDE.md` is the operating system
> (the rules). This file is the playbook (how to apply them when designing systems,
> workflows, agents, tools, and evaluations).
>
> **Golden rule (from CLAUDE.md):** the goal is NOT to build agents — it's to build the
> **simplest system that works**. Read this before designing anything non-trivial.

---

## 1. The Decision: Workflow vs Agent

Always answer these in order. Stop at the first "yes that's enough."

1. **Can a single LLM call do it?** → Do that.
2. **Are the steps known and ordered?** → Build a **workflow** (prompt chain).
3. **Does input determine which path to take?** → Add **routing**.
4. **Does it need to take real-world actions?** → Add **tools**.
5. **Are the steps genuinely unknowable in advance and iterative?** → Only now consider an **agent loop**.
6. **Do truly independent sub-problems need separate context/expertise?** → Only now consider **multi-agent**.

```
Single call  →  Prompt chain  →  Routing  →  Tool use  →  Agent loop  →  Multi-agent
   simplest ───────────────────────────────────────────────────────────▶  most complex
   prefer left. every step right adds failure surface, cost, and debugging difficulty.
```

> If a workflow can solve it, build a workflow. Agents are the exception, not the goal.

---

## 2. The Building Blocks

Every system — workflow or agent — is made of four parts. Name them explicitly when you design:

- **LLM** — the reasoning. Pick the smallest model that meets accuracy needs.
- **Tools** — the actions. One tool = one responsibility, strongly typed, no overlap.
- **Context** — the input/memory. Include only what's needed; prefer retrieval over big prompts.
- **Control flow** — the orchestration. A deterministic workflow OR an agent loop.

If you can't point to each of these in your design, the design isn't done.

---

## 3. The Approved Patterns (with when to use)

### 3.1 Single LLM Call
One prompt, one structured output. Use for classification, extraction, short generation.
- **Use when:** the task is atomic and the output schema is simple.
- **Upgrade trigger:** you're stuffing multiple unrelated jobs into one prompt → split into a chain.

### 3.2 Prompt Chain (Workflow) — THE DEFAULT
Decompose into ordered steps; validate between each; each step's output feeds the next.
- **Use when:** steps are known and accuracy matters (most systems here).
- **Shape (mandatory):** `Extract → Validate → Clean → Review → Save`.
- **Why it wins:** each step is independently testable, observable, and debuggable.

### 3.3 Routing
A classifier step picks which downstream chain to run.
- **Use when:** inputs fall into distinct categories needing different handling.
- **Keep the router dumb and deterministic** — it decides a path, it doesn't do the work.

### 3.4 Tool Use
The LLM calls typed tools to read/write the real world.
- **Rules:** one responsibility per tool, clear names, no overlapping capability.
- **Validate tool inputs and outputs** — never trust a tool result blindly into the next step.

### 3.5 Agent Loop (RARE)
Think → Act → Observe, repeating until a stopping condition.
- **Use ONLY when** steps can't be predefined and the task needs iteration/exploration.
- **Mandatory:** uses tools, has an explicit stopping condition, logs every step.
- **If you can't state the stopping condition in one sentence, you don't have an agent — you have an infinite loop.**

### 3.6 Multi-Agent (VERY RARE)
Multiple specialized agents/loops coordinating.
- **Use ONLY when** sub-problems are truly independent and need separate context or expertise.
- **Default to NOT this.** A workflow of specialized prompts usually beats a swarm of agents.

---

## 4. Workflow Design Rules

- **Break into the smallest meaningful steps.** A step you can't test is too big.
- **Validate between every step.** Bad data caught at step 2 is cheap; caught at "Save" it's a bug.
- **Add error handling per step** — what happens on malformed input, empty result, timeout?
- **Keep steps pure where possible** — same input → same output makes testing trivial.
- **Required pipeline shape:** `Extract → Validate → Clean → Review → Save`.

```
 Extract ─▶ Validate ─▶ Clean ─▶ Review ─▶ Save
            ▲ stop &              ▲ human or
            return error          rule-based gate
```

---

## 5. Agent Design Rules (only if you got past §1)

- **Think → Act → Observe** loop, always.
- **Must use tools** for any real-world effect — no "imagined" actions.
- **Must have a stopping condition** (max steps, goal reached, confidence threshold, or budget).
- **Log everything** — every thought, tool call, observation, and decision.
- **Bound the loop** — set a hard max-iteration cap as a backstop even if the goal logic should stop it sooner.

---

## 6. Context Engineering

- Include only what the current step needs. More context ≠ better; it's noise + cost.
- **Prefer retrieval over large prompts** — fetch the relevant record, don't paste the whole table.
- Strip irrelevant history between steps.
- Pass structured data (typed objects) between steps, not free-form prose, whenever possible.

---

## 7. Tool Design

- **One tool, one job.** If a tool's name has "and" in it, split it.
- **Strongly typed** inputs and outputs — let the type system catch misuse.
- **Clear, unambiguous names** — the LLM picks tools by name + description.
- **No overlap** — two tools that can do the same thing causes nondeterministic choices.

---

## 8. Observability (REQUIRED for every system)

Every system must log, at minimum:

- **Inputs** — what came in.
- **Outputs** — what went out.
- **Steps** — which step ran, in what order.
- **Errors** — what failed, where, with enough context to reproduce.

If you can't answer "what did the system do and why?" from the logs, it's not production-ready.

---

## 9. Evaluation (REQUIRED for every system)

Define before you ship:

- **Success criteria** — what does "correct" mean for this task?
- **Accuracy metrics** — how do you measure it (exact match, field-level accuracy, pass rate)?
- **Failure cases** — the known ways it breaks, captured as test fixtures.

Build a small eval set early. A workflow you can't measure is a workflow you can't improve.

---

## 10. Build Order (mandatory progression)

```
1. Single prompt          ← get a result at all
2. Structured output      ← make it machine-usable
3. Validation             ← make it trustworthy
4. Workflow               ← make it decomposed & testable
5. Tools                  ← give it real-world effects
6. Agent (only if needed) ← last resort
```

Don't skip ahead. Each level earns the next.

---

## 11. Anti-Patterns (do not do these)

- ❌ Reaching for an agent when a workflow would do.
- ❌ One giant prompt doing extract + validate + transform + decide.
- ❌ Tools with overlapping or vague responsibilities.
- ❌ No validation between steps ("the LLM probably got it right").
- ❌ An agent loop with no explicit stopping condition.
- ❌ Dumping entire datasets into context instead of retrieving.
- ❌ Shipping with no logging and no eval set.
- ❌ Growing the Amplify data schema without a resource budget in mind (see `CLAUDE.md`).

---

## 12. Quick Reference Checklist

Before building any system, confirm:

- [ ] I chose the **simplest** pattern that works (§1).
- [ ] I can name the **LLM / Tools / Context / Control flow** (§2).
- [ ] Workflow steps follow **Extract → Validate → Clean → Review → Save** (§4).
- [ ] There's **validation between steps** (§4).
- [ ] If it's an agent, it has a **stopping condition** and **logs everything** (§5).
- [ ] **Observability** is wired: inputs, outputs, steps, errors (§8).
- [ ] **Eval** defined: success criteria, metrics, failure cases (§9).
- [ ] Schema changes respect the **Amplify resource budget** (`CLAUDE.md`).
