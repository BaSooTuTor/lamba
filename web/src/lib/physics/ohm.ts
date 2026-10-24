// Deterministic DC resistor physics: the single source of truth for every number the
// lesson shows. The AI tutor only explains these results; it never computes them.

export class PhysicsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhysicsError";
  }
}

export type Unit = "volt" | "ohm" | "ampere";

// The lesson simulation's slider ranges (docs/labs-handover-v2.md, 10.2).
export const SIM_LIMITS = {
  voltage: { min: 0, max: 24 },
  resistance: { min: 1, max: 12 },
} as const;

function finite(value: number, name: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new PhysicsError(`${name} must be a finite number`);
  }
  return value;
}

function positiveResistance(value: number) {
  finite(value, "resistance");
  if (value <= 0) throw new PhysicsError("resistance must be greater than 0 Ω");
  return value;
}

// Returns the value only when it carries the expected unit, e.g. rejects "6 A" as a resistance.
export function quantity(value: number, unit: Unit, expected: Unit) {
  if (unit !== expected) throw new PhysicsError(`expected ${expected}, got ${unit}`);
  return finite(value, expected);
}

// I = V / R for one resistor across an ideal source.
export function current(voltage: number, resistance: number) {
  finite(voltage, "voltage");
  return voltage / positiveResistance(resistance);
}

// An open switch breaks the loop: no steady-state DC current flows.
export function circuitCurrent(circuit: { voltage: number; resistance: number; closed: boolean }) {
  const i = current(circuit.voltage, circuit.resistance);
  return circuit.closed ? i : 0;
}

export function seriesResistance(resistances: number[]) {
  if (resistances.length === 0) throw new PhysicsError("a network needs at least one resistor");
  return resistances.reduce((sum, r) => sum + positiveResistance(r), 0);
}

export function parallelResistance(resistances: number[]) {
  if (resistances.length === 0) throw new PhysicsError("a network needs at least one resistor");
  return 1 / resistances.reduce((sum, r) => sum + 1 / positiveResistance(r), 0);
}

export function solveSeries(voltage: number, resistances: number[]) {
  const equivalentResistance = seriesResistance(resistances);
  return { equivalentResistance, current: current(voltage, equivalentResistance) };
}

// Each branch sits across the full source voltage.
export function solveParallel(voltage: number, resistances: number[]) {
  const equivalentResistance = parallelResistance(resistances);
  const branchCurrents = resistances.map((r) => current(voltage, r));
  return {
    equivalentResistance,
    totalCurrent: branchCurrents.reduce((sum, i) => sum + i, 0),
    branchCurrents,
  };
}

export type SimState = { voltage: number; resistance: number; current: number };

// Validates untrusted sim state (from the client) and recomputes the current from it.
export function validateSimState(input: { voltage: unknown; resistance: unknown }): SimState {
  const voltage = finite(input.voltage as number, "voltage");
  const resistance = positiveResistance(input.resistance as number);
  const { voltage: v, resistance: r } = SIM_LIMITS;
  if (voltage < v.min || voltage > v.max) throw new PhysicsError(`voltage must be ${v.min}–${v.max} V`);
  if (resistance < r.min || resistance > r.max) throw new PhysicsError(`resistance must be ${r.min}–${r.max} Ω`);
  return { voltage, resistance, current: current(voltage, resistance) };
}

// The mission on card 2 is met when the ammeter reads 2 A within ±0.05 A.
export function missionMet(i: number, target = 2, tolerance = 0.05) {
  return Math.abs(i - target) < tolerance;
}
