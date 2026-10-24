# LAMBA (لمبة) — Four-Subject AI-Controlled Interactive Learning Labs
## Product & Technical Handover for Claude / Claude Code
**Prepared:** 24 October 2026 · **Revision:** v2, four-subject handover  
**Status:** Product vision and implementation specification; **not** a claim that the features below have already been built.

> **Read this alongside the original “Handover لـ ChatGPT — فهّمني(1).docx”.** The original document establishes the hackathon, business model, payment requirements, initial MVP, and UI decisions. This revised handover describes the four-subject interactive learning vision (**one concrete lesson in Physics, Chemistry, Biology, Mathematics**), with **Physics first for implementation** and Paymob first for hackathon eligibility. Preserve earlier decisions unless there is a real blocker. If the repository contradicts either document, inspect the actual code and report the discrepancy; do not assume the code is already implemented.

---

## 1. Project identity and mission

- **Product name:** لمبة — **Lamba**. The Arabic expression “اللمبة نورت” means the concept has finally clicked.
- **Audience:** Egyptian secondary-school students, initially Thanaweya Amma (grade 12 / third secondary). Mobile-first, Arabic-first, RTL.
- **Core positioning:** An interactive learning platform tailored to the Egyptian curriculum, inspired by the engagement of Brilliant but with authentic experiments and a contextual AI tutor.
- **Problem:** Students memorize laws and watch passive explanations without building intuition. They need a space to test a hypothesis, observe a consequence, and understand *why their own attempt* worked or failed.
- **Key differentiator:** The tutor can inspect the **real, structured state and history of the student’s simulation**, not merely the written answer. Crucially, the student can **control the lab through natural-language conversation** as well as by hand.

### The new vision in one sentence

**The student asks to build, change, test, or explore an experiment in Physics, Chemistry, Biology, or Mathematics; Claude routes a validated domain-specific tool action to that subject’s trusted simulator; the simulation computes the outcome; Claude explains that verified observation in understandable Egyptian Arabic.**

This is **not** a generic chat assistant next to a prerecorded animation, nor an LLM generating fake measurements. It is a set of four stateful, manipulable subject labs with one coherent tutor experience. **The hackathon vertical slice remains Physics-only** until payment requirements are satisfied.

---

## 2. Existing hackathon scope: DO NOT BREAK

The original event is **Paymob × ALX EdTech Build Night**, with a four-hour build window. The requirement that makes the entry eligible is a **successful Paymob Sandbox payment flow**. That takes precedence over advanced simulation work.

**Already-decided original MVP:**
- One subject initially: **third-secondary Physics**, chapter **electric current and Ohm’s law**.
- A map of **three lessons**, with lesson 1 free and lessons 2–3 behind a paywall.
- An interactive lesson engine: roughly **4–6 cards**, progressing concept → simulation → question → takeaway.
- Ohm’s-law simulation using voltage and resistance sliders, showing calculated current and a labeled simplified bulb-glow response.
- AI tutor explains a student’s error using question, attempted answer, and simulation values.
- Arabic RTL / mobile-first, primary blue approximately `#2F5BEA`.

**Existing intended stack:** Next.js App Router, TypeScript, Tailwind CSS, Supabase (Auth + Postgres), Cloudflare Workers via OpenNext, Claude Code for development. The original handover contains one stray mention of Convex, but its later concrete implementation sections consistently specify **Supabase**. Do not migrate technology on a whim.

**Payment/business constraints:**
- Paymob **Sandbox card checkout**, **one-time payments**, not monthly subscriptions.
- Access is tied to the student's exam cohort; 2027 cohort access is planned through **31 August 2027**, covering the second exam round. Prices are date-window dependent according to the original handover (e.g., full-year 799 EGP in the stated window); **do not hardcode those figures into the physics module or silently reinterpret them**.
- Server-side price selection, signed payment callbacks / HMAC verification, idempotent activation, billing result, subscription status, and the required policy/contact pages remain intact.
- Do **not** touch functioning checkout, authentication, or billing code while developing the new lab unless an essential integration issue requires it.
- The original handover stated that code had not yet started **at that time**. It may have changed since. **Inspect the live repository before claiming any feature exists or does not exist.**

**Strategic prioritization:** The fully generative AI Lab is the **expanded product vision**. Only a constrained physics vertical slice is appropriate before the Payment Gate, and only if the payment flow is functioning.

---

## 3. Physics-first experience: what the student can do

There are two synchronized, equal ways to operate the same laboratory:

**A. Direct manipulation:** Touch / drag components, add wires, edit numbers, flip switches, place meters, inspect graphs, pause and reset.

**B. Conversational manipulation:** Ask Claude in natural Egyptian Arabic to perform those same operations. Claude invokes safe typed actions. The circuit on-screen changes, the solver runs, and the tutor reports the *verified* outcome.

Example user requests and intended behavior:

| Student request in Arabic | Expected real behavior |
|---|---|
| «ضيف مقاومة 6 أوم» | Add an unconnected resistor to the canvas or ask where to connect it; do not assume a topology. |
| «وصلها على التوالي مع R1» | Construct the correct electrical topology using identifiable terminals/nodes; recompute. |
| «خلّي البطارية 24 فولت» | Validate the allowed range, change source voltage, recompute readings. |
| «ضيف مقاومة على التوازي» | If target is ambiguous, ask which two nodes / which resistor. |
| «حط أميتر هنا» | Place an ammeter in series with the specified branch; clarify what “here” refers to if no component/edge is selected. |
| «قيس فرق الجهد على R1» | Add a voltmeter or voltage probe across R1 and show the reading. |
| «اقفل المفتاح» | Toggle the switch, run the model, update animated conventional-current markers and readings. |
| «ليه اللمبة مطفية؟» | Inspect connectivity, switch state, source voltage, and load readings; provide evidence-based diagnosis. |
| «رجّع آخر خطوة» | Undo the latest committed circuit mutation. |
| «ضيف مكثف 100 ميكروفاراد» | **Only when supported** by a valid transient model: add it, ask for placement if necessary, and show real charging/discharging behavior. Otherwise clearly mark as not yet supported; never pretend an animation is a solved capacitor. |
| «اعمل لي تحدي على الدائرة دي» | Generate a curriculum-appropriate challenge grounded in current circuit state and independently verify its answer. |

**A defining pedagogical principle:** A student may intentionally build a poor or surprising circuit. Do not silently “fix” it to satisfy an expected answer. Show the outcome, warn when needed, and help the student reason from it.

---

## 4. Mistake handling, safety, and ambiguity

1. **Correct but unexpected design:** Permit and simulate. Explain why the observation differs from the student's intuition.
2. **Conceptual/unit error:** For «خلي المقاومة 5 أمبير», explain that resistance is measured in ohms (Ω), while current is measured in amperes (A). Ask whether they meant 5 Ω; do not silently change the unit.
3. **Ambiguous request:** For «ضيف مكثف» without terminals or capacitance, ask one short clarifying question or place a clearly unconnected component if the component is supported.
4. **Open circuit:** Show zero steady-state current in the interrupted branch; distinguish no current from an unavailable or invalid meter reading.
5. **Short circuit:** Simulate safely only within the solver's capability. Never invent finite current for an ideal zero-ohm short across an ideal voltage source. Report an undefined/unsupported idealized configuration, or use explicitly modeled source/internal resistance and current limits. Explain the real-world risk of overheating, damage, and fire, without implying that actual experimentation is advisable.
6. **Unsupported circuit/topology:** Explicitly say that the current model does not support it. Do not hallucinate readings or visual behavior.
7. **Answering questions:** In guided practice, start with a hint or a suggested experiment before revealing the solution; in conceptual Q&A, answer clearly when asked. Use the existing question context to decide.

---

## 5. Two learning modes

### Guided Learning (curriculum-aligned)
The student is inside a named lesson. Use a cycle of **Predict → Manipulate → Observe → Explain → Challenge / Reflect**. Tie feedback to Egyptian syllabus learning objectives. Log misconception tags and attempts, not just right/wrong. Allow an optional jump to free exploration when an off-topic component is requested.

### Free Lab (open exploration)
The student can build any circuit within supported component and solver capabilities. Claude can coach, demonstrate, diagnose, and suggest extensions. This mode is a future expansion; a simple component palette and sandboxed circuit editor can be phased in first.

### Smallest first demo
An ideal 12 V source and a 6 Ω resistor form one correctly closed loop:
- **I = 12 / 6 = 2 A**.
- User: «ضيف مقاومة 6 أوم على التوالي». New equivalent resistance 12 Ω; source current becomes **1 A**.
- Alternative: two 6 Ω resistors in parallel directly across 12 V: each branch draws 2 A, total source current **4 A**.
- Let the student change resistor value manually, then ask Claude why current fell or rose. Claude must use the actual computed graph and history in its explanation.
- The first lamp visualization can use a **fixed-resistance load approximation**, explicitly labeled as a simplified educational model (not a real nonlinear filament simulation).

---

## 6. Architecture: Claude is the agent, NOT the laws of physics

**Student UI → Lamba server → Claude Tool Use → Schema + authorization validator → Circuit domain actions → Deterministic physics solver → Structured observation → Claude's Egyptian-Arabic explanation → synchronized UI.**

Important separation of responsibilities:
- **Claude**: understand colloquial intent; decide which allowlisted action to call; request clarification; pedagogically explain a state change; formulate grounded challenges.
- **Action layer**: validate tool parameters and student/session permissions; resolve component IDs and selection; apply circuit changes atomically; record a revision for undo; enforce rate/size limits.
- **Circuit editor**: maintain a typed electrical graph, not merely visual coordinates. Wires connect actual component terminals/nodes; series/parallel is derived from topology.
- **Solver**: the sole source of electrical measurements. Must calculate voltages, currents, equivalent resistance (where defined), and power; later time-domain transients. Detect singular/undefined circuits and communicate limitations.
- **UI renderer**: wire drawing, readouts, probes, plots, and conventional-current animation from solver state; never derive authoritative current from a purely decorative animation.
- **AI explanation layer**: receives the exact prior and current snapshot, actions, warnings, and measurement values. It must not generate numbers that are absent from the solver output.

**Suggested internal state types:**
- `CircuitDocument { id, revision, components[], connections[], settings }`
- `Component { id, type, terminals[], properties, visualPosition }`
- `SimulationResult { revision, status, nodeVoltages, branchCurrents, powers, warnings[], modelAssumptions[] }`
- `LabAction { actionId, type, args, expectedRevision }`
- `LabHistoryEvent { action, previousRevision, newRevision, summary, result }`

Store circuit state as a canonical graph. Component positions are visualization attributes, not the basis of electrical connectivity. Prevent concurrent AI/student updates from clobbering one another with revision checks. Multi-step edits must commit or roll back as a unit. Undo should restore the previous complete state, including wiring.

### Proposed Claude tools (not claimed to exist yet)
- `get_lab_state`
- `add_component`
- `connect_components`
- `update_component`
- `remove_component`
- `toggle_switch`
- `add_measurement_probe`
- `run_simulation`
- `diagnose_circuit`
- `undo_action`

Tool schemas should have restricted enums, IDs, numeric limits and recognized physical units. **Never permit arbitrary JavaScript, shell commands, SQL, payment actions, external URL fetches, or server-side code execution via student chat.** Tool call execution belongs server-side; expose no API or billing secrets to the client. The student’s text is untrusted input. The AI endpoint must use authorization, input validation, token/rate limits and an affordable response budget. Do not send names, emails, parent phone numbers, or other unnecessary personal identifiers to Claude.

Each successful mutation follows: **intent → typed tool call → validation → atomic edit → physical solve → structured tool result → grounded explanation**. For ambiguous targets, prefer a tap-to-select UI affordance or clarification rather than a guessed wire placement.

---

## 7. Physics model roadmap

### Stage 1 — True DC resistor lab (priority)
- DC voltage source, ideal resistors, wires, switch, fixed-resistance lamp model, ammeter, voltmeter.
- Closed/open circuits, series/parallel networks, branch/node readings, simple Kirchoff-law-compatible network solving.
- Resistor/source sliders and editable property inspector.
- Deterministic recomputation on *all* graph/value mutations.
- Selection-aware chat commands, undo, warnings, current animation, explanatory graphs where relevant.
- Physically accurate sign conventions, units, and explicit model assumptions.

### Stage 2 — Transient circuits (not a fake CSS demo)
Add capacitors (then inductors) **only after** validated transient simulation exists. A useful educational RC example:
- 10 V source, R = 10 kΩ, C = 100 µF, initially uncharged capacitor.
- Time constant **τ = RC = 1 s**.
- Capacitor voltage during ideal charging: **Vc(t) = 10 × (1 − exp(−t / 1 s)) V**.
- Show capacitor voltage and current vs. time, pause/scrub/slow motion, and let the student modify R or C during experimentation according to a defined reset/continuation policy.
- Doubling R doubles τ, slowing charging under the same stated ideal assumptions.
- Later: inductors, more complex transient/AC analysis, only when scientifically and technically supported.

### Circuit engine options
A custom deterministic DC solver for the first scope, integrated with a graphical circuit editor (e.g., React Flow for **UI only**), is a practical vertical slice. For richer analog simulation, evaluate a dedicated engine such as CircuitJS/SPICE, but independently verify its integration, browser/performance suitability, and open-source licensing obligations **before** inclusion in a commercial product. No engine has been finally selected merely by this handover.

---

## 8. UX / interface behavior

- Use the original Lamba design system: Arabic-first RTL, mobile-first, clear touch targets, approximately 390×844 reference layout, strong primary blue (`#2F5BEA`).
- On mobile, the lab canvas is primary; AI tutor opens in a bottom sheet. On desktop, a side chat panel is acceptable.
- Visible component palette, clear connection terminals, selection inspector, Run/Pause/Reset, Undo, readings, and a small graph panel.
- Chat supports free text plus contextual chips like «ضيف مقاومة», «قيس التيار», «اشرح اللي حصل».
- When the student selects R1 then says «زودها للضعف», the agent can resolve the pronoun against the selected component.
- Direct manipulation and chat **must share the same canonical state and action history**. The AI cannot have an independent invisible circuit.
- Show action confirmations, model assumptions and warnings in student-friendly language; avoid long verbose answers blocking the canvas.
- Keep physics units legible and avoid reversing mathematical notation even in RTL layouts.
- Optional later enhancements: voice, narrated explanation, collaborative labs, saved experiments, teacher dashboard. **None are required for this vertical slice.**

---

## 9. Teaching intelligence and assessment

The tutor should get a concise factual context for each exchange:
- syllabus/lesson and learning objective;
- latest student intent and any selected object;
- authoritative circuit graph or compact relevant subset;
- simulation state before and after action;
- solver measurements/status/assumptions;
- last answer and misconception history when relevant.

Desired outputs in Arabic Egyptian:
1. What changed, using actual values where available;
2. What physical principle explains it;
3. One question, short hint, or next experiment to reinforce understanding.

The first hackathon tutor contract from the original file was `diagnosis`, `hint`, `try_in_sim` (short Arabic lines). Keep it for guided answer-error feedback, and add a separate action/observation/explanation contract for the new interactive lab rather than overloading all responses into one format.

AI-generated exam-style questions must be checked by deterministic answer logic, or rejected if independent validation fails. Personalize based on observed edits (e.g., repeatedly multiplying V×R instead of using V/R), never based on unsupported guesses about the student's ability or personal traits.

---

## 10. Four-subject showcase mandate — NOT physics-only

**This section updates and supersedes the previous handover's short 'cross-subject expansion' section.** The **target product** must have **one fully specified, genuinely interactive, AI-controllable showcase lesson per subject**: Physics, Chemistry, Biology, and Pure Mathematics (four distinct lessons, four domain engines). The lessons below are **product/engineering specifications, not assertions that code has been written**.

**Priority distinction to preserve:** The original Paymob × ALX 4-hour hackathon MVP remains **Physics-first, one chapter/three lessons, one free**; the other three showcase lessons must be documented and planned now, **not rushed into the Payment Gate build**. After the payment-critical MVP is safe, implement the remaining three showcase lessons in planned increments. Do not tell stakeholders that the complete four-subject platform has been implemented merely because this document describes it.

**Curriculum anchors** (third-secondary, Egypt; final 2026/27 textbooks and lesson wording must be rechecked before educational release):

| Subject / audience | Proposed first interactive showcase | Curriculum anchor | Distinct engine |
|---|---|---|---|
| Physics / science + mathematics streams | Electric current, Ohm's law, series/parallel circuits | Unit 1, Chapter 1: electric current, Ohm's law, Kirchhoff's laws | Electric circuit solver |
| Chemistry / science + mathematics streams | Quantitative volumetric analysis: acid–base titration | Chapter 2: chemical analysis; quantitative/volumetric analysis | Stoichiometry and pH model |
| Biology / science stream | Sarcomere and sliding-filament muscle contraction | Chapter 1: support and movement in living organisms | Bounded physiological/conceptual state engine |
| Pure Mathematics / mathematics stream | Definite integrals, signed area, and Riemann sums | Calculus, Unit 3: definite integration and its applications | Validated expression parser + numerical/analytic calculator |

The onboarding/lesson map must respect stream eligibility. **Physics and Chemistry** are relevant to both science and mathematics streams; **Biology** is targeted to the science stream; **Pure Mathematics** is targeted to the mathematics stream. A science-stream student may preview the math demo as an optional exploration where appropriate; do not present it as a required exam lesson. Avoid making claims about any other educational system without syllabus mapping.

### 10.1 Shared lesson engine — the same teaching philosophy everywhere

Each showcase lesson must be runnable with **manual interactions** and with **natural Egyptian-Arabic chat commands**, both affecting one authoritative simulator state. Minimum **six learner-facing beats** (which can be grouped into the existing 4–6-card UI):

1. **Prediction:** 'إنت متوقع يحصل إيه لو ...؟' Record the hypothesis before revealing the result.
2. **Manipulation:** Change actual experiment variables by tap/drag, input, or Claude tool calls.
3. **Observation:** Show the verified physical/chemical/mathematical result, with clear units and time if applicable.
4. **Counterfactual:** 'ولو عكسنا التغيير أو كررناه؟' Undo, replay, compare before/after.
5. **Misconception and feedback:** Diagnose the learner's specific attempted action or explanation, without inventing facts.
6. **Challenge and takeaway:** Give a checkable exam-aligned task, hint, second attempt, and short summary.

Every subject must implement the same high-level contract:

`student utterance or UI action → domain agent/tool router → strict schema validation → atomic domain-state mutation → trusted domain engine recomputes → structured observation → Claude explanation → persisted attempt/history`.

The **LLM is not the computational source of truth**. It may propose permissible actions and explain trusted outputs. Each engine publishes its supported commands, assumptions, error statuses, and output types. Unsupported actions must never result in fabricated readings or decorative animations passed off as numerical simulation.

### 10.2 PHYSICS SHOWCASE — Real AI-controlled electric circuit lab (first build)

**Lesson ID:** `phy_s3_electric_current_ohm`  
**UI title:** `خلّي الكهرباء تمشي قدامك — قانون أوم`  
**Student objective:** Build/edit a real DC circuit; connect components; distinguish current, voltage, resistance; see how series/parallel changes node and branch measurements; use the law to predict before measuring.

**Canvas:** Battery, labeled resistors (R1/R2), wires with selectable terminals, switch, current/voltage probes, fixed-resistance educational lamp. Show current direction, node voltages, branch currents, power where meaningful, warnings, and time/history. **A component's screen position cannot define its electrical topology.**

**Student chat action examples and exact expected behavior:**

| Student says | Claude/tool response |
|---|---|
| `ضيف مقاومة 6 أوم` | Add an **unconnected** resistor to the canvas; ask for targets if connection isn't specified. |
| `وصل R2 على التوالي مع R1` | Rewire matching terminals into correct series topology; recalculate. |
| `وصلها على التوازي بدل التوالي` | Set R2 across the same two nodes as R1; recalculate; provide before/after current. |
| `خلّي البطارية 24 فولت` | Validate supported limit, update source, run solver. |
| `حط أميتر على فرع R2` | Insert a modeled current probe in that branch and show its computed current. |
| `قيس الجهد على R1` | Place a high-impedance voltage probe across R1, display computed voltage. |
| `افتح المفتاح` | Open circuit and update steady-state current appropriately. |
| `ضيف مكثف 100 ميكروفاراد` | Only execute if a **validated transient RC engine** exists. Otherwise explain the feature is not supported yet and optionally show a separate verified RC preset; do not fake a capacitor. |
| `ليه اللمبة مطفية؟` | Inspect source/switch/connectivity/load readings; explain actual reason, not a canned answer. |
| `رجع آخر تعديل` | Atomic undo of both graph and computed state. |

**Lesson journey:** Predict current at 12 V / 6 Ω → observe **2 A** → ask Claude to add another 6 Ω **in series** → observe **1 A** → tap a component and adjust the voltage manually → explain observed change → switch to two 6 Ω parallel branches across 12 V and observe **4 A total**, **2 A per branch** → short quiz on change of resistance/current, using last real circuit state.

**Engine and conceptual safeguards:**
- A typed circuit graph and deterministic DC-resistive/Kirchhoff solver, not text substitution of `I=V/R` on an arbitrary drawing.
- For a physical bulb, label constant-resistance lamp as **simplified model**; don't claim realistic filament response.
- An open branch has zero steady-state DC current, with appropriate meter model semantics.
- An ideal wire short directly across an ideal voltage source is a singular/unbounded ideal model; clearly warn, don't invent a finite current, and emphasize **virtual-only** experimentation.
- Capacitor/inductor transient behavior is **separate Phase 2**, not forced into the initial DC-resistor release.
- For a verified RC demonstration after transient engine integration: source 10 V, R = 10 kΩ, C = 100 µF, initially uncharged, `tau=RC=1 s`, charging `Vc(t)=10*(1-exp(-t/tau)) V`; doubling R doubles tau under these assumptions. Include time controls.

**Physics acceptance tests:** Exact Ohm/series/parallel values above, open switch; correct branch current probe; invalid resistance unit (amperes instead of ohms) must **not** mutate the circuit; ambiguous placement must request a target; undo works; unsupported capacitor cannot pretend to charge; Claude's numeric explanation equals solver's data.

### 10.3 CHEMISTRY SHOWCASE — Virtual acid/base titration, not a chemistry video

**Lesson ID:** `chem_s3_volumetric_titration`  
**UI title:** `عاير المحلول بإيدك واكتشف تركيزه`  
**Student objective:** Understand volumetric analysis; perform a controlled titration in a virtual laboratory; read a burette, add titrant, identify equivalence vs indicator endpoint, relate moles, volume, concentration, and pH.

**Lab canvas:** Burette and tap/stopcock, stand, flask, volumetric sample, specified aqueous acid/base reagents, optional chosen indicator, digital volume display, live pH meter, pH vs added-volume graph, clear reagent labels. Model reactions only in a bounded **virtual** reagent set with declared temperature/concentration assumptions. This is not an unrestricted chemical synthesis sandbox and makes no claims about safe real-world mixing.

**MVP scientific scenario:** At **25°C**, place **25.00 mL of 0.100 mol/L HCl** in the flask, and **0.100 mol/L NaOH** in the burette; assume ideal, fully dissociated strong acid/base, additive solution volumes, and sufficient mixing. Neutralization stoichiometry is **1:1**. The calculated equivalence point is **25.00 mL of NaOH added**; the ideal modeled pH at equivalence is **7.00**. An optional indicator must have its *own* specified transition interval/behavior and must not magically guarantee the exact equivalence point.

**Student commands:**

| Student says | Trusted lab action |
|---|---|
| `حط 25 ملي حمض HCl تركيزه 0.1 مولاري` | Add specified sample, checking supported reagents, volume, concentration. |
| `املأ السحاحة بـ NaOH تركيزه 0.1` | Assign titrant with recognized unit `mol/L`; read initial burette level. |
| `افتح الصنبور نقطة نقطة` | Add a configured small increment per simulated drop with updated pH. |
| `زود 5 مل مرة واحدة` | Add 5.00 mL, update delivered total, moles and graph. |
| `قربنا من نقطة التعادل؟` | Derive status from calculated reaction state; provide numbers or a hint according to mode. |
| `إيه اللي هيحصل لو زودت 2 مل بعد التعادل؟` | In hypothetical mode **preview** or execute if user explicitly requests actual addition; distinguish these. |
| `ارجع لقبل ما زودت الحجم` | Restore prior solution composition and volume correctly. |
| `ليه اللون اتغير؟` | Explain supported chosen indicator range and solution pH, not an invented chemical mechanism. |

**Required learning journey:** Predict endpoint → set up reagents with drag/drop or chat → add in large increments → slow down near equivalence → plot pH/volume → deliberately overshoot and understand why → undo → solve unknown concentration from stoichiometry → take one exam-style check.

**Mistakes to detect:** volume units mL vs L; forgetting reaction coefficients; swapping analyte/titrant; equating indicator color change with exact equivalence; reading initial/final burette volumes incorrectly; thinking added volume always increases concentration; overshooting endpoint. Show a specific corrective action e.g. `قلّل مقدار الإضافة وراقب منحنى pH قرب 25 mL`.

**Verified math checks:**
- Initial acid moles: `0.02500 L * 0.100 mol/L = 0.002500 mol`.
- At `25.00 mL` added, base moles `0.002500 mol`, equals acid moles.
- At `24.00 mL` added, excess H+ `0.000100 mol` in total `0.04900 L`, giving approximately `pH = 2.69` under the ideal model.
- At `26.00 mL` added, excess OH- `0.000100 mol` in total `0.05100 L`, giving approximately `pH = 11.29` under the ideal model.
- `undo` of a 2 mL addition restores both total volume and concentration state; never only change the displayed burette number.

**Scope boundaries:** Do not support arbitrary metals, organic synthesis, incompatible reagents, equilibrium chemistry, or temperature dependence until separately modeled/tested. Do not conflate an illustrative pH curve with a quantitatively valid arbitrary titration.

**Chemistry tool names:** `chem_get_state`, `chem_set_analyte`, `chem_load_burette`, `chem_set_indicator`, `chem_dispense_titrant`, `chem_read_ph`, `chem_preview_addition`, `chem_reset`, `chem_undo`. Each command validates reagent, concentration, volume, units and state before applying.

**Chemistry acceptance tests:** Equivalence at 25.00 mL; pH trend and points above; volume conservation under simplified mixing; wrong unit gets clarified; deliberate overshoot is allowed virtually and explained; chosen indicator behavior is constrained by its documented transition range; no hazardous experiment advice for real-world replication.

### 10.4 BIOLOGY SHOWCASE — Sarcomere & muscle contraction interactive model

**Lesson ID:** `bio_s3_muscle_sarcomere`  
**UI title:** `شوف العضلة بتنقبض إزاي من جوّه`  
**Student objective:** Discover the sliding-filament model by manipulating a muscle sarcomere and observing actin–myosin interaction, Z-line separation, and band widths; understand the essential roles of calcium and ATP without confusing animation with clinical muscle measurements.

**Canvas:** Zoom from skeletal muscle → myofibril → a **single sarcomere**; show Z-discs, thin actin and thick myosin filaments, A-band, I-band, H-zone, overlap, cross-bridges and a legend. Animate controlled contraction/relaxation in a **clearly labeled conceptual/kinematic model**, not a measured, complete biochemical simulation.

**Commands with supported model effects:**

| Student says | Behavior |
|---|---|
| `كبّر الساركومير` | Zoom and show anatomical labels. |
| `شغّل الانقباض ببطء` | Animate increasing filament overlap and Z-disc approach under supported conditions. |
| `قف عند نص الانقباض` | Pause/seek to a state snapshot and freeze band labels. |
| `خلي الكالسيوم غير متاح` | Switch qualitative calcium-availability state; prevent further Ca-enabled crossbridge cycling in conceptual model. |
| `خلّي ATP غير متاح` | Display **model-limited** blocked cycling/detachment and explain ATP roles; **do not** model normal full relaxation or claim measured tension. |
| `وريني الفرق بين A و I و H` | Highlight each band and compare widths and definitions before/after state. |
| `هل الأكتين نفسه بيقصر؟` | Explain thin filament length remains approximately constant in this simplified sliding model, while sarcomere overlap and band widths change. |
| `ارجع للوضع المرتخي` | Reset to baseline with indicated state/assumptions. |

**Journey:** Predict which structures shorten → run contraction → highlight **Z-disc distance decreases**, **I-band typically decreases**, **H-zone typically decreases/disappears with high overlap**, **A-band stays the same** because thick filament length is constant → pause/compare → test ATP/calcium availability within the stated conceptual model → misconception challenge.

**Misconceptions:** `A band shrinks during contraction`; `actin filaments themselves shorten`; `calcium is an energy source`; `ATP only powers shortening and has no role in detachment`; `low calcium instantly implies a perfectly relaxed muscle without any qualifications`.

**Biology engine contract:** Deterministic state machine / bounded kinematic geometry, e.g. `rest → activation_available → cycling → shortened → relax/restart`. State contains `sarcomereLengthNormalized`, `actinLength`, `myosinLength`, `overlap`, `bandWidths`, `calciumAvailable`, `atpAvailable`, `phase`, `modelAssumptions`. Keep relative/notional lengths; **do not emit invented physical force (N), milliseconds, or clinical tissue predictions**. When ATP/ion dynamics are too complex, present a conceptual explanation rather than confident literal kinetic claims.

**Biology tools:** `bio_get_state`, `bio_select_structure`, `bio_set_calcium_available`, `bio_set_atp_available`, `bio_set_contraction_progress`, `bio_play_pause`, `bio_compare_states`, `bio_reset`, `bio_undo`.

**Biology acceptance tests:** A-band stays constant in every contracted state; I and H zones do not increase with increasing contraction within supported range; geometry never yields negative band width; filaments' own modeled lengths remain constant; deleting ATP does not trigger a physically wrong automatic full relaxation animation; student request for real muscle force returns an explicitly unsupported-measurement explanation.

### 10.5 MATHEMATICS SHOWCASE — Interactive definite integrals and function graphs

**Lesson ID:** `math_s3_definite_integral`  
**UI title:** `حرّك حدود التكامل وشوف المساحة بتتغير`  
**Student objective:** Type or choose a supported function, inspect its graph and derivative where supported, change integration bounds live, see positive vs negative signed area, and connect Riemann rectangles to the definite integral.

**Canvas:** Coordinate axes and plotted function, draggable limits `a` and `b`, shaded signed regions (distinguish above/below x-axis), integral readout, Riemann sum rectangles with count/side-selection controls, live comparison between approximation and trusted integral. Support desktop typing and mobile selection and sliders.

**Commands:**

| Student says | Behavior |
|---|---|
| `ارسم الدالة x^2` | Parse a safe mathematical expression and plot with correct axes. |
| `خلي حدود التكامل من صفر لاتنين` | Set `a=0`, `b=2`; compute signed integral and shade. |
| `زود الحد الأعلى لـ 3` | Recompute integral and visualization immediately. |
| `خلّي المستطيلات 8 بدل 4` | Update validated Riemann partition and numeric estimate. |
| `اظهر المشتقة` | Compute verified derivative for supported function set; plot as distinct curve. |
| `ارسم x من سالب 1 لموجب 1` | Show signed areas above/below axis and their cancellation. |
| `ليه الناتج صفر رغم إن فيه مساحة؟` | Explain **signed definite integral ≠ geometric total area** using actual graph. |
| `جرّب دالة فيها جذر` | Only parse/function if supported, define real domain, avoid plotting undefined points. |
| `ارجع قبل آخر تغيير` | Restore expression, bounds, partitions, plot and calculated values. |

**Journey:** Start with `f(x)=x^2`; predict definite integral from `0` to `2`; shade and calculate `8/3 ≈ 2.6666667` → drag upper bound to `3` yielding `9` → visualize Riemann approximations improving as `n` increases for a valid method and smooth function → switch to `f(x)=x` from `-1` to `1` yielding signed integral `0` but geometric total area `1` → explanatory challenge.

**Safe math engine:** Use **an allowlisted expression parser and validated numerical/analytic computation**, NOT JavaScript `eval`, unrestricted code execution, or numbers generated by Claude. Define function grammar and domain before use. Separate analytic exact results where known from numerical estimates with tolerance/precision and an indicator when approximate. Validate discontinuities, nonreal values, swapped bounds (negative orientation), overflow, and unsupported functions. Use numerical techniques with defensible error estimates where possible; don't imply all functions have elementary antiderivatives.

**Misconceptions:** integral always equals physical area; negative signed regions are ignored; `a > b` is the same as `a < b`; increasing rectangles always makes a particular Riemann approximation monotonically closer (not guaranteed for all functions/schemes); integral and derivative are identical operations; treating a numerical approximation as exact.

**Math tools:** `math_get_state`, `math_set_expression`, `math_set_bounds`, `math_set_partition_count`, `math_select_sum_method`, `math_show_derivative`, `math_show_geometric_area`, `math_compute_integral`, `math_reset`, `math_undo`.

**Math acceptance tests:** `∫_0^2 x² dx = 8/3`; `∫_0^3 x² dx = 9`; `∫_-1^1 x dx = 0`, while area `∫_-1^1 |x| dx = 1`; reversing bounds flips the signed integral; malformed expressions do not execute; unsupported domains are marked clearly; plotted/returned computed values agree within documented tolerance; Undo is atomic.

### 10.6 Shared Claude integration architecture for all four lessons

**Key design principle: one tutor, four scientific engines.** Claude can share conversation style and instructional policy, but **must not route Chemistry actions to Physics, or compute scientific results directly**. Every tool is scoped to the current subject, lesson, student session, and permitted operation.

**Suggested typed contracts (conceptual, not existing code):**

```ts
type Subject = 'physics' | 'chemistry' | 'biology' | 'mathematics';

type LabContext = {
  subject: Subject;
  lessonId: string;
  sessionId: string;
  stateRevision: number;
  selectedObjectId?: string;
};

type DomainCommand = {
  operation: string;       // must be an allowlisted operation for this subject
  args: unknown;           // parsed/validated with a strict per-tool schema
  expectedRevision: number;
};

type DomainObservation = {
  revision: number;
  status: 'ok' | 'ambiguous' | 'invalid' | 'unsupported' | 'solver_error';
  measurements: unknown;   // typed and verified per subject
  changes: unknown;
  assumptions: string[];
  warnings: string[];
};
```

**Interaction loop:**

1. The browser sends the user's text plus authoritative session reference and selected object (never trust arbitrary client-supplied measurements).
2. Server reads authorized session and a compact domain-state snapshot.
3. Claude decides whether to answer, ask a clarification, or request a permitted **Tool Use** command.
4. The server validates typed parameters, units, domain boundaries, ownership, state revision and lesson permissions.
5. The domain engine performs mutation/solve **atomically** and creates an observation. For hypothetical wording ('ماذا لو') default to **preview without mutation**, unless the user explicitly asks to apply the edit.
6. Send **verified observation** in the `tool_result` to Claude; ask for a short Egyptian-Arabic explanation of what changed, why, and one optional next experiment.
7. Save a concise action log/learning evidence with appropriate student-data privacy and retention controls; UI renders the same canonical state through direct manipulation or chat.

**Examples of safe ambiguity handling:**
- Chemistry: `زود 5` → ask whether mL and which reagent, or use a selected burette if unmistakable; never assume dangerous/unsupported combinations.
- Biology: `زود الكالسيوم` → if the conceptual model only supports available/not available, explain supported toggle; don't invent a physiological concentration scale.
- Mathematics: `كامل من 0 لـ 2` → use selected function if one is selected; otherwise ask which function.
- Physics: `وصّلها هنا` → use selected terminals if known; otherwise ask where; never wire to arbitrary coordinate.

**Security and reliability:** No student prompt may invoke arbitrary server code, SQL, payments, secrets, webhooks, other users' data or model credentials. Build a strict per-subject tool registry, apply authorization, rate/usage caps and server-side logging. Send minimal student learning state (no name, email, or parent phone) to the LLM. Separate prewritten pedagogical fallback explanations from invented solver results. Make locale-aware unit parsing robust; UI in Arabic RTL, equations/numbers legible in LTR segments. Maintain Undo/Redo and deterministic replay.

### 10.7 Four real demo scripts for judges/teachers (45–90 s each)

**Physics** — Show `12 V + 6 Ω = 2 A` → student chats 'ضيف 6 أوم على التوالي' → circuit rewires and reads `1 A` → student asks 'ليه التيار قل؟' → Claude cites real change.

**Chemistry** — Student chats 'ابدأ معايرة 25 مل HCl 0.1 مولاري بـ NaOH 0.1 مولاري' → adds titrant in small increments → pH graph evolves → at `25.00 mL`, modeled ideal pH `7` → another mL overshoots → tutor explains from verified moles/pH and allows Undo.

**Biology** — Student asks 'شغّل الانقباض ببطء وعلّم على منطقة A' → actin/myosin visual slides, Z discs approach, A-band stays constant → student asks 'ليه A مش بتقصر؟' → grounded explanation; toggle ATP to discuss limitation.

**Math** — Student asks 'ارسم x من -1 لـ 1 وحسب التكامل والمساحة' → signed integral `0`, geometric area `1` → student asks 'ليه مختلفين؟' → tutor shades/calls out positive and negative regions without pretending they're the same.

### 10.8 Four-subject Definition of Done (DoD)

A subject showcase is **not complete** until:

- Its lesson card flow exists in Arabic; the student can predict/manipulate/observe/reflect.
- Its dedicated interactive canvas works from direct hand/drag inputs **and** Claude's vetted tool calls.
- At least **three meaningful commands** mutate actual structured domain state correctly.
- At least **one deliberately wrong action or misconception** produces safe, outcome-based feedback without silently altering the student's intent.
- Model-derived measurements/graphics are independently verified by executable tests; assumptions and unsupported behaviors are explicit.
- Undo restores previous exact state; results and chat stay synchronized across session revision.
- One 45–90-second scripted walkthrough passes without fake data or privileged/manual hidden interventions.
- The subject is shown only to eligible curriculum tracks, with a clear optional preview for other tracks.
- No one describes planned work as 'already built' absent repository and live-test evidence.

### 10.9 Curriculum sources for final academic QA

The following public curriculum outlines were consulted **on 24 October 2026** to anchor the topic names; they are not substitutes for a final review of the latest official Ministry textbook edition and its exact examples:

- Egyptian Ministry of Education e-learning textbook entry: https://moe.gov.eg/ar/elearningenterypage/e-learning/
- Third-secondary physics contents (chapter 1, Ohm and Kirchhoff): https://sahl.io/eg/book/1448/
- Third-secondary chemistry, chemical analysis / volumetric analysis: https://sahl.io/sa/lesson/3791/
- Third-secondary biology, support and movement / sliding-filament model: https://sahl.io/eg/lesson/25163/
- Third-secondary pure mathematics, definite integration: https://sahl.io/eg/lesson/39726/

**No proprietary educational content, screenshots, or protected diagrams are authorized for copying** merely because a syllabus/topic was consulted. Build original simulations and teaching text; check licensing before embedding third-party labs.

---
## 11. Delivery order / release priorities

**P0 — Payment Gate first (original requirement):** Complete and verify Paymob Sandbox card payment end-to-end, cohort entitlement activation, receipt/results, and existing minimal lesson/paywall requirements. Do not destabilize these while working on the AI Lab.

**P0/P1 — Smallest Physics vertical slice once payment is safe:**
1. Read repository and identify existing screens/state/API boundaries.
2. Provide a brief gap analysis separating already-working parts from missing features.
3. Build a typed circuit graph and a tested deterministic DC-resistive solver.
4. Connect direct UI interactions to a single circuit action/state layer.
5. Add just enough Claude Tool Use to change a resistor/value/connection on student request, with schema validation and tool-result-grounded tutoring.
6. Show a 12 V / 6 Ω → additional 6 Ω series demonstration and one deliberate student misconception.
7. Verify responsive layout, rollback/undo and error handling.

**P1/P2 — Later:** Generalized editing, full branch/voltage measurements, multiple challenges, learning analytics, free lab, RC transients; **then implement one verified Chemistry titration lesson, one Biology sarcomere lesson, and one Mathematics definite-integrals lesson to the section 10 DoD**. Choose sequence by team capacity after Physics/payment are safe.

Do not expand to a full electronic CAD system or rush all four science/math engines during the hackathon. A small honest, mathematically correct Physics demo plus a credible, detailed four-subject rollout plan is more compelling than large decorative fake labs.

---

## 12. Minimum acceptance tests

**Physics correctness**
- Ideal 12 V source + 6 Ω resistor in a closed loop → 2 A.
- Same source + two 6 Ω resistors in series → 1 A.
- Same source + two 6 Ω resistors in parallel → 4 A total; 2 A in each branch.
- Opening a series switch → 0 A steady-state current in that interrupted branch.
- Ideal short across ideal voltage source → defined warning/unsupported or explicitly modeled current limit; **not an invented infinity/finite reading displayed as measured truth**.
- Meter connections respect their modeled placement; units validated.
- Changing a wire/topology updates results; coordinates alone do not.

**Agent correctness / product behavior**
- «ضيف مقاومة 6 أوم على التوالي مع R1» changes actual graph and produces correct new reading and explanation.
- «خلي المقاومة 5 أمبير» causes clarification, not mutation.
- «ضيف مكثف» is not falsely simulated while transients are unsupported.
- Unknown component IDs / malformed tool arguments cause no partial mutation.
- Undo restores graph, values, and readings.
- An AI answer never claims a measurement outside solver output.
- Chat and direct manipulation never diverge in state.
- Rate/auth checks keep student chat isolated from billing, secrets and other users' data.

**Demo script (~90 seconds)**
1. Open free Ohm’s-law lesson and run 12 V / 6 Ω experiment (2 A).
2. Student chats: «ضيف مقاومة 6 أوم على التوالي»; canvas visibly changes; reading becomes 1 A.
3. Student incorrectly says «يعني المقاومة الأكبر بتزوّد التيار؟»; tutor explains the observed reversal without giving a generic unrelated answer.
4. Student changes voltage manually; tutor recognizes the state change.
5. Student tries «وصل البطارية بسلك مباشر»; product explains the invalid ideal short model and real danger, safely.
6. If the original checkout flow is in scope for the live event, finish with a verified Sandbox purchase and successful entitlement activation.

---

## 13. Explicit next instruction to Claude Code

**First read the original handover and this revised v2 document, then inspect the actual repository.** Summarize in 10–15 lines what is existing versus proposed; explicitly acknowledge the FOUR required subject showcase lessons and their lesson IDs. Confirm payment-flow status without guessing. Propose the smallest implementable Physics vertical slice that will not compromise the Payment Gate, then a realistic roadmap and test plan for Chemistry, Biology, and Mathematics. Only then make code changes, in narrow testable increments. Run real lint/type/tests and report exact outcomes and any missing credentials or unsupported capabilities. Do not claim the entire AI laboratory has been completed unless it actually works end to end.

**Ultimate product promise:** «في الفيزياء والكيمياء والأحياء والرياضيات: قول للمبة تعمل تجربة مدعومة، وشوفها بتحصل قدامك، واسأل ليه — وهي تشرحلك بناءً على اللي إنت عملته فعلًا.»


---

## 14. Mandatory instruction to Claude Code — never accidentally reduce scope to Physics only

> **PRODUCT SCOPE CONFIRMATION:** This revised handover specifies **four** separate interactive showcase lessons — `phy_s3_electric_current_ohm`, `chem_s3_volumetric_titration`, `bio_s3_muscle_sarcomere`, and `math_s3_definite_integral`. Each has concrete tools, scientific modeling assumptions, user commands, a learning journey, misconceptions and acceptance tests. The **implementation order** is *Paymob Payment Gate → Physics first → other three showcases*; **the product vision is multi-subject from day one**. Do not misrepresent priority as a permanent Physics-only product. Keep 'Lamba' as working name until an explicit rename is approved.
