import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PhysicsError,
  current,
  missionMet,
  circuitCurrent,
  parallelResistance,
  quantity,
  seriesResistance,
  solveParallel,
  solveSeries,
  validateSimState,
} from "./ohm";

test("12 V across 6 Ω gives 2 A", () => {
  assert.equal(current(12, 6), 2);
});

test("two 6 Ω resistors in series across 12 V give 1 A", () => {
  assert.equal(seriesResistance([6, 6]), 12);
  const result = solveSeries(12, [6, 6]);
  assert.equal(result.equivalentResistance, 12);
  assert.equal(result.current, 1);
});

test("two 6 Ω resistors in parallel across 12 V give 4 A total, 2 A per branch", () => {
  assert.equal(parallelResistance([6, 6]), 3);
  const result = solveParallel(12, [6, 6]);
  assert.equal(result.equivalentResistance, 3);
  assert.equal(result.totalCurrent, 4);
  assert.deepEqual(result.branchCurrents, [2, 2]);
});

test("zero or negative resistance is rejected", () => {
  assert.throws(() => current(12, 0), PhysicsError);
  assert.throws(() => current(12, -6), PhysicsError);
  assert.throws(() => seriesResistance([6, 0]), PhysicsError);
  assert.throws(() => parallelResistance([6, -1]), PhysicsError);
});

test("non-finite values and empty networks are rejected", () => {
  assert.throws(() => current(Number.NaN, 6), PhysicsError);
  assert.throws(() => current(12, Number.POSITIVE_INFINITY), PhysicsError);
  assert.throws(() => seriesResistance([]), PhysicsError);
  assert.throws(() => parallelResistance([]), PhysicsError);
});

test("an open circuit carries 0 A", () => {
  assert.equal(circuitCurrent({ voltage: 12, resistance: 6, closed: false }), 0);
  assert.equal(circuitCurrent({ voltage: 12, resistance: 6, closed: true }), 2);
});

test("a quantity with the wrong unit is rejected", () => {
  assert.equal(quantity(6, "ohm", "ohm"), 6);
  assert.throws(() => quantity(6, "ampere", "ohm"), PhysicsError);
  assert.throws(() => quantity(12, "ohm", "volt"), PhysicsError);
});

test("sim state must stay inside the lab ranges", () => {
  assert.deepEqual(validateSimState({ voltage: 12, resistance: 6 }), { voltage: 12, resistance: 6, current: 2 });
  assert.throws(() => validateSimState({ voltage: 25, resistance: 6 }), PhysicsError);
  assert.throws(() => validateSimState({ voltage: 12, resistance: 0 }), PhysicsError);
  assert.throws(() => validateSimState({ voltage: "12", resistance: 6 }), PhysicsError);
});

test("the 2 A mission passes only within ±0.05 A", () => {
  assert.equal(missionMet(current(12, 6)), true);
  assert.equal(missionMet(current(10, 5)), true);
  assert.equal(missionMet(current(13, 6)), false);
  assert.equal(missionMet(2.05), false);
});
