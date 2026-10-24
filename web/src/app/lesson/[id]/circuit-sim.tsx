"use client";

import { SIM_LIMITS, current } from "@/lib/physics/ohm";

type Props = {
  voltage: number;
  resistance: number;
  onChange: (next: { voltage: number; resistance: number }) => void;
};

// Battery, resistor, bulb and ammeter in one loop. The ammeter shows the physics engine's
// current; the bulb glow is a fixed-resistance educational approximation.
export function CircuitSim({ voltage, resistance, onChange }: Props) {
  const i = current(voltage, resistance);
  const glow = Math.min(0.9, i / 4);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-[#D8DBE0] bg-[#FAFAFB] p-4">
        <svg viewBox="0 0 320 200" className="h-auto w-full" role="img" aria-label="دايرة كهربية فيها بطارية ومقاومة ولمبة وأميتر">
          <rect x="40" y="40" width="240" height="120" rx="6" fill="none" stroke="#1F2328" strokeWidth="2" />
          <rect x="22" y="80" width="36" height="40" fill="#FAFAFB" stroke="#1F2328" strokeWidth="2" />
          <text x="40" y="105" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1F2328">V</text>
          <rect x="130" y="150" width="60" height="20" fill="#FAFAFB" stroke="#1F2328" strokeWidth="2" />
          <text x="160" y="190" textAnchor="middle" fontSize="12" fill="#5B616B">R</text>
          <circle cx="160" cy="40" r="34" fill="#F5B400" fillOpacity={glow} />
          <circle cx="160" cy="40" r="18" fill="#FAFAFB" stroke="#1F2328" strokeWidth="2" />
          <path d="M152 40l16 0M160 32l0 16" stroke="#1F2328" strokeWidth="2" />
          <circle cx="280" cy="100" r="20" fill="#FAFAFB" stroke="#1F2328" strokeWidth="2" />
          <text x="280" y="105" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1F2328">A</text>
        </svg>
        <p className="text-center text-[11px] text-[#5B616B]">نموذج مبسّط: اللمبة هنا مقاومة ثابتة.</p>
        <div className="flex items-baseline justify-between gap-2 border-t-[1.5px] border-dashed border-[#D8DBE0] pt-3">
          <span className="text-[13px] text-[#5B616B]">التيار في الأميتر</span>
          <span dir="ltr" className="text-[26px] font-bold" aria-live="polite">
            I = {i.toFixed(1)} A
          </span>
        </div>
      </div>

      <Slider
        id="volt"
        label="الجهد (V)"
        unit="V"
        value={voltage}
        {...SIM_LIMITS.voltage}
        onChange={(v) => onChange({ voltage: v, resistance })}
      />
      <Slider
        id="res"
        label="المقاومة (R)"
        unit="Ω"
        value={resistance}
        {...SIM_LIMITS.resistance}
        onChange={(r) => onChange({ voltage, resistance: r })}
      />
    </div>
  );
}

function Slider(props: {
  id: string;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <label htmlFor={props.id} className="font-semibold">
          {props.label}
        </label>
        <span dir="ltr">
          {props.value} {props.unit}
        </span>
      </div>
      <input
        id={props.id}
        type="range"
        min={props.min}
        max={props.max}
        step={1}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="h-8 w-full accent-accent"
      />
    </div>
  );
}
