// Read-only floor plan for a room from the app: walls, doors and windows from the room scan
// (or a rectangle for a typed-in room), plus the cameras and Wi-Fi points the customer placed.
// Same drawing as the app's RoomPlan.tsx.
import { useId } from "react";

type Line = [number, number, number, number];
export type PlanShape = { w_ft: number; h_ft: number; walls: Line[]; doors: Line[]; windows: Line[] };
export type PlacedDevice = { id: string; kind: "camera" | "ap"; x: number; y: number; angle: number };
export type PlanRoom = { width_ft: number; length_ft: number; plan?: PlanShape; devices?: PlacedDevice[] };

const CAMERA_RANGE_FT = 25;
const CAMERA_FOV_DEG = 90;
const AP_RANGE_FT = 20;
const PAD = 14;

function planOf(room: PlanRoom): PlanShape {
  if (room.plan && room.plan.walls.length) return room.plan;
  const w = room.width_ft || 10;
  const h = room.length_ft || 10;
  return { w_ft: w, h_ft: h, walls: [[0, 0, w, 0], [w, 0, w, h], [w, h, 0, h], [0, h, 0, 0]], doors: [], windows: [] };
}

function wedge(cx: number, cy: number, r: number, angle: number, fov: number) {
  const a1 = ((angle - fov / 2) * Math.PI) / 180;
  const a2 = ((angle + fov / 2) * Math.PI) / 180;
  return `M ${cx} ${cy} L ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(a2)} ${cy + r * Math.sin(a2)} Z`;
}

export default function RoomPlanView({ room, width = 520, maxH = 320 }: { room: PlanRoom; width?: number; maxH?: number }) {
  const clip = `room${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const devices = room.devices ?? [];
  if (!room.plan && !devices.length) return null;
  const plan = planOf(room);
  const scale = Math.max(0.5, Math.min((width - PAD * 2) / Math.max(plan.w_ft, 1), (maxH - PAD * 2) / Math.max(plan.h_ft, 1)));
  const P = (ft: number) => PAD + ft * scale;
  const W = plan.w_ft * scale + PAD * 2;
  const H = plan.h_ft * scale + PAD * 2;
  const cams = devices.filter((d) => d.kind === "camera").length;
  const aps = devices.length - cams;
  const line = (l: Line, stroke: string, w: number, key: string) => (
    <line key={key} x1={P(l[0])} y1={P(l[1])} x2={P(l[2])} y2={P(l[3])} stroke={stroke} strokeWidth={w} strokeLinecap="round" />
  );
  return (
    <div className="mt-2">
      <div className="inline-block rounded-xl border border-white/10 bg-white/[0.02]">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Floor plan with ${cams} cameras and ${aps} Wi-Fi points`}>
          <defs>
            <clipPath id={clip}>
              <rect x={P(0)} y={P(0)} width={plan.w_ft * scale} height={plan.h_ft * scale} />
            </clipPath>
          </defs>
          <rect x={P(0)} y={P(0)} width={plan.w_ft * scale} height={plan.h_ft * scale} fill="rgba(255,255,255,0.03)" />
          <g clipPath={`url(#${clip})`}>
          {devices.map((d) =>
            d.kind === "camera" ? (
              <path key={`c${d.id}`} d={wedge(P(d.x), P(d.y), CAMERA_RANGE_FT * scale, d.angle, CAMERA_FOV_DEG)} fill="rgba(34,211,238,0.14)" stroke="rgba(34,211,238,0.35)" />
            ) : (
              <circle key={`c${d.id}`} cx={P(d.x)} cy={P(d.y)} r={AP_RANGE_FT * scale} fill="rgba(52,211,153,0.10)" stroke="rgba(52,211,153,0.35)" />
            ),
          )}
          </g>
          {plan.walls.map((l, i) => line(l, "rgba(255,255,255,0.85)", 4, `w${i}`))}
          {plan.windows.map((l, i) => line(l, "#7dd3fc", 5, `n${i}`))}
          {plan.doors.map((l, i) => line(l, "#a78bfa", 6, `d${i}`))}
          {devices.map((d, i) => (
            <g key={d.id}>
              <circle cx={P(d.x)} cy={P(d.y)} r={11} fill={d.kind === "camera" ? "#22d3ee" : "#34d399"} stroke="#06041a" strokeWidth={2} />
              <text x={P(d.x)} y={P(d.y) + 4} fontSize={11} fontWeight={700} fill="#06041a" textAnchor="middle">
                {devices.filter((x, j) => x.kind === d.kind && j <= i).length}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-1 text-xs text-white/50">
        {[cams ? `${cams} camera${cams > 1 ? "s" : ""}` : "", aps ? `${aps} Wi-Fi point${aps > 1 ? "s" : ""}` : ""].filter(Boolean).join(" · ") || "Nothing placed yet"}
        {" · "}
        <span className="text-white/80">━</span> wall <span style={{ color: "#a78bfa" }}>━</span> door <span style={{ color: "#7dd3fc" }}>━</span> window
        {room.plan ? "" : " · typed room, drawn as a rectangle"}
      </p>
    </div>
  );
}
