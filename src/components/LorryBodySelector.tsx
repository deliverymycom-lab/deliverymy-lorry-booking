import React, { useState } from 'react';
import { Truck, Check, Eye, ShieldCheck, Sparkles, Layers, Info } from 'lucide-react';
import { Language } from '../types';
import { LORRY_BODY_METAS, LorryBodyMeta } from '../services/malaysiaLocations';

interface LorryBodySelectorProps {
  currentLang: Language;
  selectedBodyType: string;
  onSelectBodyType: (bodyType: string) => void;
  options: string[];
}

// Custom Vector Illustrations for each body type
export const LorryBodyIllustration: React.FC<{
  typeKey: string;
  className?: string;
  large?: boolean;
}> = ({ typeKey, className = '', large = false }) => {
  const norm = typeKey.toLowerCase();
  const isLowLoader = norm.includes('low loader') || norm.includes('lowloader') || norm.includes('tunda rendah') || norm.includes('低平板');
  const isTowing = !isLowLoader && (norm.includes('towing') || norm.includes('tunda') || norm.includes('拖车'));
  const isCrane = norm.includes('crane') || norm.includes('kren') || norm.includes('吊车');
  const isTipper = norm.includes('tipper') || norm.includes('自卸') || norm.includes('angkat');
  const isTanker = norm.includes('tanker') || norm.includes('tangki') || norm.includes('罐车');
  const is20Ft = (norm.includes('20') && (norm.includes('feet') || norm.includes('kaki') || norm.includes('尺') || norm.includes('ft'))) || norm.includes('container20');
  const is40Ft = (norm.includes('40') && (norm.includes('feet') || norm.includes('kaki') || norm.includes('尺') || norm.includes('ft'))) || norm.includes('container40');
  const isContainer = (norm.includes('container') || norm.includes('kontena') || norm.includes('集装箱') || is20Ft || is40Ft) && !isLowLoader;
  const isCanvas = norm.includes('canvas') || norm.includes('kanvas') || norm.includes('帆布');
  const isClosed = norm.includes('closed') || norm.includes('tertutup') || norm.includes('封闭');
  const isOpen = norm.includes('open') || norm.includes('terbuka') || norm.includes('开放');
  const isCurtain = norm.includes('curtain') || norm.includes('tirai') || norm.includes('帘布');
  const isReefer = norm.includes('refrigerated') || norm.includes('beku') || norm.includes('冷藏');
  const isPickup = norm.includes('pickup') || norm.includes('皮卡');

  const width = large ? 300 : 180;
  const height = large ? 160 : 96;

  // 0. LOW LOADER (Heavy multi-axle drop-deck trailer carrying a construction excavator)
  if (isLowLoader) {
    return (
      <svg
        viewBox="0 0 200 110"
        className={`w-full h-auto drop-shadow-md ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ground shadow */}
        <ellipse cx="100" cy="100" rx="94" ry="6" fill="#000000" opacity="0.14" />

        {/* Heavy Prime Mover Tractor Unit Cab (Front Right) */}
        <path
          d="M138 34H172C176 34 180 38 183 45L191 62V82H138V34Z"
          fill="#0284C7"
          stroke="#0369A1"
          strokeWidth="2"
        />
        {/* Prime Mover Windshield */}
        <path
          d="M164 38H144V60H186L179 46C177 41 173 38 168 38H164Z"
          fill="#BAE6FD"
          opacity="0.9"
        />
        {/* High Exhaust Stack behind Cab */}
        <rect x="133" y="16" width="4" height="66" rx="1.5" fill="#64748B" stroke="#334155" strokeWidth="1" />
        <path d="M132 16H138V22H132Z" fill="#334155" />
        <circle cx="187" cy="74" r="3" fill="#FDE047" />

        {/* Gooseneck / Neck Section coupling to prime mover */}
        <path
          d="M112 60L138 52V76L126 76L112 72Z"
          fill="#1E293B"
          stroke="#0F172A"
          strokeWidth="1.5"
        />

        {/* Ultra-Low Drop Deck Well (Sits very close to the ground for height clearance) */}
        <rect x="42" y="70" width="76" height="8" rx="1" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
        {/* Heavy Steel Outrigger / Deck Ribs */}
        <line x1="44" y1="74" x2="116" y2="74" stroke="#78350F" strokeWidth="1.5" />
        {[52, 64, 76, 88, 100].map((x) => (
          <line key={x} x1={x} y1="70" x2={x} y2="78" stroke="#78350F" strokeWidth="1.2" />
        ))}

        {/* Heavy Rear Axle Bogie */}
        <rect x="8" y="66" width="36" height="12" rx="2" fill="#334155" stroke="#1E293B" strokeWidth="1.5" />

        {/* Foldable Heavy-Duty Rear Loading Ramps */}
        <path d="M6 76L2 52L5 52L9 76Z" fill="#64748B" stroke="#334155" strokeWidth="1" />
        <path d="M2 52L-4 38L-2 37L4 52Z" fill="#94A3B8" stroke="#475569" strokeWidth="0.8" />
        {/* Safety Warning Chevron on rear bumper */}
        <rect x="8" y="72" width="22" height="6" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.8" />
        <line x1="12" y1="72" x2="16" y2="78" stroke="#000000" strokeWidth="1.5" />
        <line x1="18" y1="72" x2="22" y2="78" stroke="#000000" strokeWidth="1.5" />
        <line x1="24" y1="72" x2="28" y2="78" stroke="#000000" strokeWidth="1.5" />

        {/* CARGO: Heavy Yellow Hydraulic Excavator on Low Deck */}
        <g transform="translate(48, 28)">
          {/* Track undercarriage resting on deck */}
          <rect x="2" y="34" width="46" height="8" rx="4" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
          <circle cx="8" cy="38" r="3" fill="#64748B" />
          <circle cx="18" cy="38" r="3" fill="#64748B" />
          <circle cx="28" cy="38" r="3" fill="#64748B" />
          <circle cx="38" cy="38" r="3" fill="#64748B" />
          <circle cx="44" cy="38" r="3" fill="#64748B" />
          {/* Excavator Slew Ring / Turntable */}
          <rect x="18" y="31" width="16" height="4" fill="#334155" />
          {/* Excavator Cabin & Engine Housing */}
          <path d="M4 14H32C35 14 38 17 38 21V32H4V14Z" fill="#EAB308" stroke="#CA8A04" strokeWidth="1.5" />
          {/* Operator Glass Window */}
          <path d="M22 17H34V29H22V17Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1" />
          <line x1="26" y1="17" x2="26" y2="29" stroke="#0284C7" strokeWidth="1" />
          {/* Counterweight */}
          <rect x="4" y="16" width="10" height="15" rx="2" fill="#CA8A04" />
          {/* Excavator Heavy Articulated Boom, Arm & Bucket */}
          <path d="M30 26L48 4L54 6L36 30Z" fill="#CA8A04" stroke="#A16207" strokeWidth="1.5" />
          <circle cx="49" cy="5" r="2.5" fill="#334155" />
          <path d="M49 5L66 22L62 25L46 7Z" fill="#EAB308" stroke="#A16207" strokeWidth="1.5" />
          <circle cx="64" cy="23" r="2" fill="#334155" />
          {/* Excavator Digging Bucket Teeth curled down */}
          <path d="M64 23L72 32L68 37L60 30Z" fill="#475569" stroke="#1E293B" strokeWidth="1.2" />
          <line x1="72" y1="32" x2="75" y2="34" stroke="#0F172A" strokeWidth="1.2" />
          <line x1="70" y1="35" x2="73" y2="37" stroke="#0F172A" strokeWidth="1.2" />
        </g>

        {/* Low Loader Heavy-Haulage Badge */}
        <rect x="46" y="10" width="70" height="13" rx="2.5" fill="#78350F" opacity="0.95" />
        <text x="50" y="19.5" fill="#FEF08A" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
          🚜 LOW LOADER / DROP DECK
        </text>

        {/* Multi-Axle Wheels: 3 Trailer Rear Axles (Small Low-Profile Heavy Duals) */}
        <g>
          <circle cx="16" cy="85" r="9" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1.8" />
          <circle cx="16" cy="85" r="3.5" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="30" cy="85" r="9" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1.8" />
          <circle cx="30" cy="85" r="3.5" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="44" cy="85" r="9" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1.8" />
          <circle cx="44" cy="85" r="3.5" fill="#94A3B8" />
        </g>

        {/* Tractor Unit Wheels (Twin Drive Axles + Steer Axle) */}
        <g>
          <circle cx="146" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="146" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="176" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="176" cy="85" r="6" fill="#94A3B8" />
        </g>
      </svg>
    );
  }

  // 1. TOWING SERVICE (Tilt flatbed breakdown recovery truck carrying a car with warning beacon)
  if (isTowing) {
    return (
      <svg
        viewBox="0 0 200 110"
        className={`w-full h-auto drop-shadow-md ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ground shadow */}
        <ellipse cx="100" cy="100" rx="90" ry="6" fill="#000000" opacity="0.12" />

        {/* Chassis */}
        <rect x="18" y="74" width="160" height="7" rx="2" fill="#1E293B" />

        {/* Flashing Amber Roof Lightbar */}
        <rect x="144" y="41" width="18" height="5" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
        <circle cx="147" cy="43.5" r="1.5" fill="#FEF08A" />
        <circle cx="158" cy="43.5" r="1.5" fill="#FEF08A" />
        <path d="M141 38L145 42H161L165 38" stroke="#FBBF24" strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />

        {/* Tow Truck Cab */}
        <path
          d="M132 46H168C172 46 177 50 180 56L188 68V81H132V46Z"
          fill="#D97706"
          stroke="#B45309"
          strokeWidth="2"
        />
        {/* Windshield */}
        <path
          d="M158 50H138V67H183L175 54C173 51 170 50 166 50H158Z"
          fill="#BAE6FD"
          opacity="0.9"
        />
        <circle cx="185" cy="74" r="3" fill="#FDE047" />

        {/* Heavy Headboard & Winch Tower behind cab */}
        <rect x="126" y="32" width="7" height="43" rx="1.5" fill="#334155" stroke="#1E293B" strokeWidth="1" />
        <circle cx="129.5" cy="40" r="3" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
        {/* Winch steel cable extending to car */}
        <line x1="126" y1="42" x2="88" y2="52" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 1" />

        {/* Slide-Bed Tilt Flatbed Deck (Angled ramp with diamond plate texture) */}
        <path
          d="M16 68L126 56V62L16 74Z"
          fill="#475569"
          stroke="#334155"
          strokeWidth="1.5"
        />
        {/* Ramp edge safety stripes */}
        <line x1="20" y1="71" x2="35" y2="69" stroke="#FDE047" strokeWidth="2" />
        <line x1="45" y1="68" x2="60" y2="66" stroke="#FDE047" strokeWidth="2" />
        <line x1="70" y1="65" x2="85" y2="63" stroke="#FDE047" strokeWidth="2" />

        {/* Towed Breakdown Car resting on bed */}
        <g transform="translate(32, 38) rotate(-6)">
          {/* Car body */}
          <path d="M0 16L12 8H38L50 16H62V24H0V16Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1.2" />
          {/* Car windows */}
          <path d="M14 9L24 9V15H4L14 9Z" fill="#E0F2FE" />
          <path d="M27 9H36L44 15H27V9Z" fill="#E0F2FE" />
          {/* Car wheels */}
          <circle cx="14" cy="24" r="5" fill="#0F172A" stroke="#94A3B8" strokeWidth="1" />
          <circle cx="48" cy="24" r="5" fill="#0F172A" stroke="#94A3B8" strokeWidth="1" />
          {/* Wheel tie-down straps */}
          <path d="M9 25L19 25" stroke="#F59E0B" strokeWidth="2" />
          <path d="M43 25L53 25" stroke="#F59E0B" strokeWidth="2" />
        </g>

        {/* Towing Emblem Badge */}
        <rect x="22" y="24" width="62" height="13" rx="2.5" fill="#78350F" opacity="0.95" />
        <text x="26" y="33.5" fill="#FEF08A" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
          🛻 TOWING / TUNDA
        </text>

        {/* Wheels */}
        <g>
          <circle cx="48" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="48" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="78" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="78" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="160" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="160" cy="85" r="6" fill="#94A3B8" />
        </g>
      </svg>
    );
  }

  // 2. CRANE LORRY (Heavy chassis with knuckle-boom articulated crane, hook, outriggers)
  if (isCrane) {
    return (
      <svg
        viewBox="0 0 200 110"
        className={`w-full h-auto drop-shadow-md ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="100" cy="100" rx="90" ry="6" fill="#000000" opacity="0.12" />

        {/* Chassis */}
        <rect x="18" y="74" width="160" height="7" rx="2" fill="#1E293B" />

        {/* Deployed Hydraulic Outrigger Stabilizer Leg */}
        <rect x="122" y="74" width="8" height="20" rx="1" fill="#CA8A04" stroke="#854D0E" strokeWidth="1" />
        <rect x="118" y="92" width="16" height="4" rx="1" fill="#475569" />

        {/* Cab */}
        <path
          d="M132 46H168C172 46 177 50 180 56L188 68V81H132V46Z"
          fill="#2563EB"
          stroke="#1D4ED8"
          strokeWidth="2"
        />
        <path
          d="M158 50H138V67H183L175 54C173 51 170 50 166 50H158Z"
          fill="#BAE6FD"
          opacity="0.9"
        />
        <circle cx="185" cy="74" r="3" fill="#FDE047" />

        {/* Open Cargo Bed Behind Crane */}
        <rect x="20" y="55" width="94" height="20" rx="1.5" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
        <rect x="28" y="40" width="34" height="15" fill="#0284C7" stroke="#0369A1" strokeWidth="1" />
        <text x="31" y="50" fill="#FFFFFF" fontSize="5.5" fontWeight="bold">GENSET 50KW</text>

        {/* CRANE BASE & KNUCKLE-BOOM ASSEMBLY (Behind cab at x=116) */}
        <rect x="114" y="42" width="14" height="33" rx="2" fill="#EAB308" stroke="#CA8A04" strokeWidth="1.5" />
        <circle cx="121" cy="46" r="4.5" fill="#713F12" stroke="#FEF08A" strokeWidth="1.2" />

        {/* Main Boom Arm (reaching up and over cargo) */}
        <path d="M121 46L82 18" stroke="#EAB308" strokeWidth="6" strokeLinecap="round" />
        <path d="M121 46L82 18" stroke="#CA8A04" strokeWidth="1.5" strokeDasharray="4 2" />

        {/* Articulated Jib Arm (angled forward) */}
        <circle cx="82" cy="18" r="4" fill="#713F12" stroke="#FEF08A" strokeWidth="1.2" />
        <path d="M82 18L44 26" stroke="#CA8A04" strokeWidth="4.5" strokeLinecap="round" />

        {/* Hydraulic Piston Cylinders */}
        <line x1="117" y1="58" x2="98" y2="30" stroke="#94A3B8" strokeWidth="2.5" />
        <line x1="86" y1="23" x2="62" y2="23" stroke="#CBD5E1" strokeWidth="2" />

        {/* Steel Hoist Cable & Hook */}
        <line x1="44" y1="26" x2="44" y2="40" stroke="#1E293B" strokeWidth="1.5" />
        <path d="M42 40C42 43 46 43 46 40C46 38 43 38 43 40" stroke="#0F172A" strokeWidth="2" fill="none" />

        {/* Crane Badge */}
        <rect x="136" y="24" width="56" height="13" rx="2" fill="#854D0E" />
        <text x="140" y="33" fill="#FEF08A" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
          🏗️ CRANE / HIAB
        </text>

        {/* Wheels */}
        <g>
          <circle cx="48" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="48" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="78" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="78" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="160" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="160" cy="85" r="6" fill="#94A3B8" />
        </g>
      </svg>
    );
  }

  // 3. TIPPER (Hydraulic dump bed tilted up with hydraulic ram and gravel cargo)
  if (isTipper) {
    return (
      <svg
        viewBox="0 0 200 110"
        className={`w-full h-auto drop-shadow-md ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="100" cy="100" rx="90" ry="6" fill="#000000" opacity="0.12" />

        {/* Chassis */}
        <rect x="18" y="74" width="160" height="7" rx="2" fill="#1E293B" />

        {/* Cab */}
        <path
          d="M132 46H168C172 46 177 50 180 56L188 68V81H132V46Z"
          fill="#C2410C"
          stroke="#9A3412"
          strokeWidth="2"
        />
        <path
          d="M158 50H138V67H183L175 54C173 51 170 50 166 50H158Z"
          fill="#BAE6FD"
          opacity="0.9"
        />
        {/* Cab Protector / Spill Shield */}
        <path d="M128 32L140 46H128V32Z" fill="#9A3412" stroke="#7C2D12" strokeWidth="1" />
        <circle cx="185" cy="74" r="3" fill="#FDE047" />

        {/* Telescopic Chrome Hydraulic Cylinder Ram (raising bed) */}
        <line x1="88" y1="74" x2="78" y2="46" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
        <line x1="86" y1="68" x2="79" y2="48" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />

        {/* Tilted Dump Bucket (At dynamic 22° dumping angle) */}
        <g transform="translate(24, 74) rotate(-20) translate(-24, -74)">
          {/* Main bucket bed */}
          <path
            d="M20 44L124 44L120 74L20 74Z"
            fill="#EA580C"
            stroke="#9A3412"
            strokeWidth="2"
          />
          {/* Reinforced Vertical Ribs */}
          {[36, 54, 72, 90, 106].map((x) => (
            <line key={x} x1={x} y1="44" x2={x} y2="74" stroke="#9A3412" strokeWidth="2.5" />
          ))}
          {/* Top Rail */}
          <line x1="20" y1="44" x2="124" y2="44" stroke="#7C2D12" strokeWidth="3" />
          {/* Swinging Rear Tailgate with hinge pin */}
          <rect x="18" y="44" width="4" height="30" fill="#7C2D12" />
          <circle cx="20" cy="46" r="2" fill="#FEF08A" />

          {/* Gravel / Sand in bed */}
          <path d="M26 68Q50 56 80 62Q100 60 116 70Z" fill="#B45309" opacity="0.8" />
        </g>

        {/* Tipper Badge */}
        <rect x="25" y="16" width="60" height="13" rx="2.5" fill="#7C2D12" />
        <text x="29" y="25" fill="#FED7AA" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
          🚜 TIPPER / DUMP
        </text>

        {/* Wheels */}
        <g>
          <circle cx="48" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="48" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="78" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="78" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="160" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="160" cy="85" r="6" fill="#94A3B8" />
        </g>
      </svg>
    );
  }

  // 4. TANKER (Polished stainless steel / aluminium liquid vessel with dome manholes, ladder, hazmat diamond)
  if (isTanker) {
    return (
      <svg
        viewBox="0 0 200 110"
        className={`w-full h-auto drop-shadow-md ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="100" cy="100" rx="90" ry="6" fill="#000000" opacity="0.12" />

        {/* Chassis */}
        <rect x="18" y="74" width="160" height="7" rx="2" fill="#1E293B" />

        {/* Cab */}
        <path
          d="M132 46H168C172 46 177 50 180 56L188 68V81H132V46Z"
          fill="#0284C7"
          stroke="#0369A1"
          strokeWidth="2"
        />
        <path
          d="M158 50H138V67H183L175 54C173 51 170 50 166 50H158Z"
          fill="#BAE6FD"
          opacity="0.9"
        />
        <circle cx="185" cy="74" r="3" fill="#FDE047" />

        {/* Top Catwalk Walkway with Handrail */}
        <line x1="32" y1="21" x2="114" y2="21" stroke="#475569" strokeWidth="1.2" />
        <line x1="40" y1="21" x2="40" y2="25" stroke="#475569" strokeWidth="1" />
        <line x1="72" y1="21" x2="72" y2="25" stroke="#475569" strokeWidth="1" />
        <line x1="104" y1="21" x2="104" y2="25" stroke="#475569" strokeWidth="1" />

        {/* Inspection Manhole Domes on top */}
        <rect x="44" y="21" width="12" height="4" rx="1.5" fill="#334155" />
        <rect x="86" y="21" width="12" height="4" rx="1.5" fill="#334155" />

        {/* CYLINDRICAL TANK BODY (Sleek stainless steel with curved domed front and rear heads) */}
        <path
          d="M28 25H118C126 25 130 36 130 49C130 62 126 73 118 73H28C20 73 16 62 16 49C16 36 20 25 28 25Z"
          fill="#E2E8F0"
          stroke="#475569"
          strokeWidth="2"
        />
        {/* Specular Chrome Highlights */}
        <path d="M26 31H120" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.9" strokeLinecap="round" />
        <path d="M22 62H124" stroke="#94A3B8" strokeWidth="3" opacity="0.6" strokeLinecap="round" />

        {/* Tank Baffle Structural Rings */}
        <line x1="52" y1="25" x2="52" y2="73" stroke="#CBD5E1" strokeWidth="2" />
        <line x1="90" y1="25" x2="90" y2="73" stroke="#CBD5E1" strokeWidth="2" />

        {/* Rear Access Ladder */}
        <line x1="20" y1="28" x2="20" y2="72" stroke="#334155" strokeWidth="1.5" />
        <line x1="18" y1="36" x2="22" y2="36" stroke="#334155" strokeWidth="1.2" />
        <line x1="18" y1="46" x2="22" y2="46" stroke="#334155" strokeWidth="1.2" />
        <line x1="18" y1="56" x2="22" y2="56" stroke="#334155" strokeWidth="1.2" />

        {/* Hazard Safety Diamond Placard (Flammable / Liquid) */}
        <g transform="translate(68, 44) rotate(45)">
          <rect x="-6" y="-6" width="12" height="12" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
        </g>
        <text x="63" y="47" fill="#FFFFFF" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">3</text>

        {/* Tanker Badge */}
        <rect x="36" y="54" width="62" height="12" rx="2" fill="#0C4A6E" />
        <text x="40" y="62.5" fill="#BAE6FD" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
          🛢️ LIQUID TANKER
        </text>

        {/* Wheels */}
        <g>
          <circle cx="48" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="48" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="78" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="78" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="160" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="160" cy="85" r="6" fill="#94A3B8" />
        </g>
      </svg>
    );
  }

  // 5A. 20 FEET LONG CONTAINER / 20 KAKI KONTENA (Compact Standard 20ft TEU, 2 Tandem Axles, Dense Heavy Cargo)
  if (is20Ft) {
    return (
      <svg
        viewBox="0 0 200 110"
        className={`w-full h-auto drop-shadow-md ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="100" cy="100" rx="90" ry="6" fill="#000000" opacity="0.12" />

        {/* Shorter Compact 20ft Skeletal Chassis */}
        <rect x="52" y="74" width="128" height="7" rx="2" fill="#1E293B" />

        {/* Heavy Prime Mover Tractor Cab with Roof Wind Deflector */}
        <path d="M136 28L156 46H136V28Z" fill="#0369A1" stroke="#075985" strokeWidth="1" />
        <path
          d="M136 46H172C176 46 181 50 184 56L191 68V81H136V46Z"
          fill="#0284C7"
          stroke="#0369A1"
          strokeWidth="2"
        />
        {/* Sleeper cab side window & windshield */}
        <path
          d="M162 50H142V67H187L179 54C177 51 174 50 170 50H162Z"
          fill="#BAE6FD"
          opacity="0.9"
        />
        <circle cx="188" cy="74" r="3" fill="#FDE047" />

        {/* Fifth Wheel Coupling Pin */}
        <rect x="130" y="72" width="8" height="4" fill="#0F172A" />

        {/* COMPACT 20FT ISO SHIPPING CONTAINER BODY (Distinctly Shorter Length, Rich Ocean Blue) */}
        <rect
          x="54"
          y="24"
          width="76"
          height="50"
          rx="2"
          fill="#0284C7"
          stroke="#075985"
          strokeWidth="2"
        />
        {/* Corrugated Vertical Panels for 20ft */}
        {[62, 70, 78, 86, 94, 102, 110, 118, 124].map((x) => (
          <line key={x} x1={x} y1="25" x2={x} y2="73" stroke="#38BDF8" strokeWidth="2.2" />
        ))}
        {/* Top & Bottom Structural Steel Rails */}
        <rect x="54" y="24" width="76" height="4" fill="#0C4A6E" />
        <rect x="54" y="70" width="76" height="4" fill="#0C4A6E" />

        {/* Heavy Corner Castings & Twist-Locks */}
        <rect x="54" y="24" width="6" height="6" fill="#FDE047" stroke="#854D0E" strokeWidth="0.8" />
        <rect x="54" y="68" width="6" height="6" fill="#FDE047" stroke="#854D0E" strokeWidth="0.8" />
        <rect x="124" y="24" width="6" height="6" fill="#FDE047" stroke="#854D0E" strokeWidth="0.8" />
        <rect x="124" y="68" width="6" height="6" fill="#FDE047" stroke="#854D0E" strokeWidth="0.8" />

        {/* 20FT Badge & Dimensions Label */}
        <rect x="62" y="34" width="60" height="17" rx="2" fill="#0F172A" opacity="0.92" />
        <text x="65" y="44" fill="#38BDF8" fontSize="7" fontWeight="black" fontFamily="monospace">
          📦 20 FEET / 20尺
        </text>
        <text x="65" y="48.5" fill="#FEF08A" fontSize="4.5" fontFamily="monospace">
          1x 20FT TEU • 24,000 KG
        </text>

        {/* Rear Door Dual Lock Rods (Left end) */}
        <rect x="54" y="27" width="3" height="43" fill="#0F172A" />

        {/* 2-Axle Trailer Wheels for 20FT */}
        <g>
          <circle cx="68" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="68" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="98" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="98" cy="85" r="6" fill="#94A3B8" />
        </g>
        {/* Tractor Drive & Front Steer Wheel */}
        <g>
          <circle cx="136" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="136" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="168" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="168" cy="85" r="6" fill="#94A3B8" />
        </g>
      </svg>
    );
  }

  // 5B. 40 FEET LONG CONTAINER / 40 KAKI KONTENA (Extra-Long 12.2m High Cube FEU, 3 Heavy Bogie Axles)
  if (is40Ft || isContainer) {
    return (
      <svg
        viewBox="0 0 200 110"
        className={`w-full h-auto drop-shadow-md ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="100" cy="100" rx="94" ry="6" fill="#000000" opacity="0.14" />

        {/* Extra-Long Full-Length 40ft Skeletal Chassis */}
        <rect x="12" y="74" width="170" height="7" rx="2" fill="#1E293B" />

        {/* Heavy Prime Mover Tractor Cab with Tall Aerodynamic Deflector */}
        <path d="M142 22L164 44H142V22Z" fill="#1E3A8A" stroke="#172554" strokeWidth="1.2" />
        <path
          d="M142 44H176C180 44 184 48 187 55L194 67V81H142V44Z"
          fill="#1E40AF"
          stroke="#172554"
          strokeWidth="2"
        />
        {/* Sleeper cab side window & windshield */}
        <path
          d="M168 48H148V66H190L183 53C181 50 178 48 174 48H168Z"
          fill="#BAE6FD"
          opacity="0.9"
        />
        <circle cx="191" cy="74" r="3" fill="#FDE047" />

        {/* Fifth Wheel Coupling Pin */}
        <rect x="136" y="72" width="8" height="4" fill="#0F172A" />

        {/* FULL 40FT EXTRA-LONG HIGH CUBE CONTAINER BODY (Spans all the way from x=14 to x=138, Deep Navy / Evergreen) */}
        <rect
          x="14"
          y="20"
          width="124"
          height="54"
          rx="2"
          fill="#065F46"
          stroke="#064E3B"
          strokeWidth="2"
        />
        {/* 40ft Corrugated Vertical Panels Across Entire Length */}
        {[22, 30, 38, 46, 54, 62, 70, 78, 86, 94, 102, 110, 118, 126, 132].map((x) => (
          <line key={x} x1={x} y1="21" x2={x} y2="73" stroke="#10B981" strokeWidth="2.4" />
        ))}
        {/* Top & Bottom Heavy Structural Steel Rails */}
        <rect x="14" y="20" width="124" height="4" fill="#064E3B" />
        <rect x="14" y="70" width="124" height="4" fill="#064E3B" />

        {/* 4 Corner Castings & Twist-Locks */}
        <rect x="14" y="20" width="6" height="6" fill="#FDE047" stroke="#854D0E" strokeWidth="0.8" />
        <rect x="14" y="68" width="6" height="6" fill="#FDE047" stroke="#854D0E" strokeWidth="0.8" />
        <rect x="132" y="20" width="6" height="6" fill="#FDE047" stroke="#854D0E" strokeWidth="0.8" />
        <rect x="132" y="68" width="6" height="6" fill="#FDE047" stroke="#854D0E" strokeWidth="0.8" />

        {/* 40FT High Cube Badge & Specifications */}
        <rect x="30" y="32" width="82" height="18" rx="2.5" fill="#0F172A" opacity="0.94" />
        <text x="34" y="43" fill="#34D399" fontSize="7.5" fontWeight="black" fontFamily="monospace">
          📦 40 FEET HC / 40尺大柜
        </text>
        <text x="34" y="47.5" fill="#FEF08A" fontSize="4.5" fontFamily="monospace">
          1x 40FT FEU • 12.2 METERS • 76.4 CBM
        </text>

        {/* Rear Door Dual Heavy Lock Rods */}
        <rect x="14" y="23" width="3.5" height="47" fill="#0F172A" />

        {/* Tri-Axle (3 Gandar) Heavy Rear Bogie Wheels for 40FT Trailer */}
        <g>
          <circle cx="28" cy="85" r="13" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="28" cy="85" r="5.5" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="56" cy="85" r="13" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="56" cy="85" r="5.5" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="84" cy="85" r="13" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="84" cy="85" r="5.5" fill="#94A3B8" />
        </g>

        {/* Tractor Drive & Front Steer Wheel */}
        <g>
          <circle cx="146" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="146" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="176" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="176" cy="85" r="6" fill="#94A3B8" />
        </g>
      </svg>
    );
  }

  // 1. CANVAS / KANVAS (Heavy tarpaulin cover over steel cage with tied ropes)
  if (isCanvas) {
    return (
      <svg
        viewBox="0 0 200 110"
        className={`w-full h-auto drop-shadow-md ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ground shadow */}
        <ellipse cx="100" cy="100" rx="90" ry="6" fill="#000000" opacity="0.12" />

        {/* Chassis */}
        <rect x="18" y="74" width="160" height="7" rx="2" fill="#1E293B" />
        <rect x="30" y="80" width="30" height="6" rx="1" fill="#475569" />

        {/* Cab (Front) */}
        <path
          d="M132 46H168C172 46 177 50 180 56L188 68V81H132V46Z"
          fill="#0284C7"
          stroke="#0369A1"
          strokeWidth="2"
        />
        {/* Windshield */}
        <path
          d="M158 50H138V67H183L175 54C173 51 170 50 166 50H158Z"
          fill="#BAE6FD"
          opacity="0.9"
        />
        {/* Cab Door Line & Handle */}
        <line x1="152" y1="52" x2="152" y2="78" stroke="#0369A1" strokeWidth="1.5" />
        <rect x="146" y="65" width="4" height="2" rx="0.5" fill="#0F172A" />
        {/* Headlight */}
        <circle cx="185" cy="74" r="3" fill="#FDE047" />

        {/* CANVAS BODY (Orange / Hunter Green waterproof tarpaulin with tension folds) */}
        <path
          d="M20 25C20 23 22 21 24 21H130V75H20V25Z"
          fill="#EA580C"
          stroke="#9A3412"
          strokeWidth="2"
        />
        {/* Tarpaulin ribbing / steel frame supports */}
        <line x1="42" y1="21" x2="42" y2="75" stroke="#C2410C" strokeWidth="2.5" />
        <line x1="64" y1="21" x2="64" y2="75" stroke="#C2410C" strokeWidth="2.5" />
        <line x1="86" y1="21" x2="86" y2="75" stroke="#C2410C" strokeWidth="2.5" />
        <line x1="108" y1="21" x2="108" y2="75" stroke="#C2410C" strokeWidth="2.5" />

        {/* Canvas tension wrinkles / texture */}
        <path d="M22 35Q32 38 42 35Q53 38 64 35Q75 38 86 35Q97 38 108 35Q119 38 128 35" stroke="#FED7AA" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M22 55Q32 58 42 55Q53 58 64 55Q75 58 86 55Q97 58 108 55Q119 58 128 55" stroke="#FED7AA" strokeWidth="1.5" fill="none" opacity="0.7" />

        {/* Canvas Eyelets & Tied Ropes at bottom */}
        {[28, 40, 52, 64, 76, 88, 100, 112, 124].map((x) => (
          <g key={x}>
            <circle cx={x} cy="71" r="1.8" fill="#FEF08A" stroke="#854D0E" strokeWidth="0.8" />
            <line x1={x} y1="72.8" x2={x + 3} y2="76" stroke="#FEF08A" strokeWidth="1.2" />
          </g>
        ))}

        {/* Canvas Badge label */}
        <rect x="25" y="26" width="46" height="12" rx="2" fill="#7C2D12" opacity="0.85" />
        <text x="29" y="35" fill="#FFFFFF" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
          🎪 KANVAS
        </text>

        {/* Rear Mudguard & Wheels */}
        <g>
          <circle cx="48" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="48" cy="85" r="6" fill="#94A3B8" />
          <circle cx="48" cy="85" r="3" fill="#0F172A" />
        </g>
        <g>
          <circle cx="78" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="78" cy="85" r="6" fill="#94A3B8" />
          <circle cx="78" cy="85" r="3" fill="#0F172A" />
        </g>

        {/* Front Wheel */}
        <g>
          <circle cx="160" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="160" cy="85" r="6" fill="#94A3B8" />
          <circle cx="160" cy="85" r="3" fill="#0F172A" />
        </g>
      </svg>
    );
  }

  // 2. CLOSED BOX (Kotak Tertutup Aluminium / 100% Anti-Theft & Waterproof Box)
  if (isClosed) {
    return (
      <svg
        viewBox="0 0 200 110"
        className={`w-full h-auto drop-shadow-md ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ground shadow */}
        <ellipse cx="100" cy="100" rx="90" ry="6" fill="#000000" opacity="0.12" />

        {/* Chassis */}
        <rect x="18" y="74" width="160" height="7" rx="2" fill="#1E293B" />

        {/* Aerodynamic Wind Deflector above cab */}
        <path d="M130 30L145 46H130V30Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />

        {/* Cab (Front) */}
        <path
          d="M132 46H168C172 46 177 50 180 56L188 68V81H132V46Z"
          fill="#2563EB"
          stroke="#1D4ED8"
          strokeWidth="2"
        />
        {/* Windshield */}
        <path
          d="M158 50H138V67H183L175 54C173 51 170 50 166 50H158Z"
          fill="#BAE6FD"
          opacity="0.9"
        />
        {/* Headlight */}
        <circle cx="185" cy="74" r="3" fill="#FDE047" />

        {/* CLOSED BOX CONTAINER (Clean white/silver aluminium panels with vertical corrugated seams) */}
        <rect
          x="20"
          y="20"
          width="110"
          height="55"
          rx="3"
          fill="#F8FAFC"
          stroke="#475569"
          strokeWidth="2"
        />
        {/* Aluminium vertical corrugation grooves */}
        {[32, 44, 56, 68, 80, 92, 104, 116].map((x) => (
          <line key={x} x1={x} y1="21" x2={x} y2="74" stroke="#E2E8F0" strokeWidth="2" />
        ))}
        {/* Top/Bottom edge extrusion trim */}
        <rect x="20" y="20" width="110" height="4" fill="#64748B" />
        <rect x="20" y="71" width="110" height="4" fill="#64748B" />

        {/* Rear Door Hinges & Dual Locking Rods on left side */}
        <rect x="20" y="22" width="6" height="51" fill="#334155" />
        <circle cx="23" cy="30" r="1.5" fill="#E2E8F0" />
        <circle cx="23" cy="46" r="1.5" fill="#E2E8F0" />
        <circle cx="23" cy="62" r="1.5" fill="#E2E8F0" />

        {/* Closed Box Logo / Security Emblem */}
        <rect x="42" y="32" width="65" height="18" rx="3" fill="#1E3A8A" />
        <text x="47" y="44" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
          🔒 CLOSED BOX
        </text>
        <text x="47" y="48" fill="#93C5FD" fontSize="5.5" fontFamily="sans-serif">
          100% KALIS AIR & KUNCI
        </text>

        {/* Wheels */}
        <g>
          <circle cx="48" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="48" cy="85" r="6" fill="#94A3B8" />
          <circle cx="48" cy="85" r="3" fill="#0F172A" />
        </g>
        <g>
          <circle cx="78" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="78" cy="85" r="6" fill="#94A3B8" />
          <circle cx="78" cy="85" r="3" fill="#0F172A" />
        </g>
        <g>
          <circle cx="160" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="160" cy="85" r="6" fill="#94A3B8" />
          <circle cx="160" cy="85" r="3" fill="#0F172A" />
        </g>
      </svg>
    );
  }

  // 3. OPEN CARGO / LORI TERBUKA (Drop-side wooden/steel flatbed)
  if (isOpen) {
    return (
      <svg
        viewBox="0 0 200 110"
        className={`w-full h-auto drop-shadow-md ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="100" cy="100" rx="90" ry="6" fill="#000000" opacity="0.12" />
        <rect x="18" y="74" width="160" height="7" rx="2" fill="#1E293B" />
        {/* Cab */}
        <path d="M132 46H168C172 46 177 50 180 56L188 68V81H132V46Z" fill="#16A34A" stroke="#15803D" strokeWidth="2" />
        <path d="M158 50H138V67H183L175 54C173 51 170 50 166 50H158Z" fill="#BAE6FD" opacity="0.9" />
        <circle cx="185" cy="74" r="3" fill="#FDE047" />

        {/* Headboard Behind Cab */}
        <rect x="127" y="32" width="5" height="43" fill="#78350F" stroke="#451A03" strokeWidth="1" />

        {/* Open Cargo Bed (Wood Plank Texture) */}
        <rect x="20" y="52" width="107" height="23" rx="1" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
        <line x1="20" y1="59" x2="127" y2="59" stroke="#78350F" strokeWidth="1.2" />
        <line x1="20" y1="67" x2="127" y2="67" stroke="#78350F" strokeWidth="1.2" />

        {/* Drop Gate Latches */}
        {[30, 60, 90, 120].map((x) => (
          <rect key={x} x={x} y="52" width="3" height="23" fill="#334155" />
        ))}

        {/* Cargo on bed (Machinery / crates outline) */}
        <rect x="35" y="36" width="30" height="16" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
        <line x1="35" y1="36" x2="65" y2="52" stroke="#475569" strokeWidth="1" />
        <rect x="72" y="30" width="35" height="22" fill="#CBD5E1" stroke="#64748B" strokeWidth="1" />

        {/* Wheels */}
        <g>
          <circle cx="50" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="50" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="80" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="80" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="160" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="160" cy="85" r="6" fill="#94A3B8" />
        </g>
      </svg>
    );
  }

  // 4. CURTAIN SIDER (Tautliner with sliding curtain)
  if (isCurtain) {
    return (
      <svg
        viewBox="0 0 200 110"
        className={`w-full h-auto drop-shadow-md ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="100" cy="100" rx="90" ry="6" fill="#000000" opacity="0.12" />
        <rect x="18" y="74" width="160" height="7" rx="2" fill="#1E293B" />
        <path d="M132 46H168C172 46 177 50 180 56L188 68V81H132V46Z" fill="#9333EA" stroke="#7E22CE" strokeWidth="2" />
        <path d="M158 50H138V67H183L175 54C173 51 170 50 166 50H158Z" fill="#BAE6FD" opacity="0.9" />
        <circle cx="185" cy="74" r="3" fill="#FDE047" />

        {/* Curtain Body (Deep Violet Tarpaulin with vertical tension straps) */}
        <rect x="20" y="22" width="110" height="53" rx="2" fill="#7E22CE" stroke="#581C87" strokeWidth="2" />
        {[30, 42, 54, 66, 78, 90, 102, 114].map((x) => (
          <g key={x}>
            <line x1={x} y1="23" x2={x} y2="73" stroke="#A855F7" strokeWidth="1.5" />
            <rect x={x - 1.5} y="68" width="3" height="4" fill="#FDE047" />
          </g>
        ))}
        <rect x="35" y="32" width="60" height="14" rx="2" fill="#3B0764" opacity="0.9" />
        <text x="40" y="42" fill="#FFFFFF" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
          ⚡ CURTAIN SIDER
        </text>

        <g>
          <circle cx="50" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="50" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="80" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="80" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="160" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="160" cy="85" r="6" fill="#94A3B8" />
        </g>
      </svg>
    );
  }

  // 5. REFRIGERATED (Cold chain with rooftop compressor)
  if (isReefer) {
    return (
      <svg
        viewBox="0 0 200 110"
        className={`w-full h-auto drop-shadow-md ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="100" cy="100" rx="90" ry="6" fill="#000000" opacity="0.12" />
        <rect x="18" y="74" width="160" height="7" rx="2" fill="#1E293B" />
        {/* Cab */}
        <path d="M132 46H168C172 46 177 50 180 56L188 68V81H132V46Z" fill="#0D9488" stroke="#0F766E" strokeWidth="2" />
        <path d="M158 50H138V67H183L175 54C173 51 170 50 166 50H158Z" fill="#BAE6FD" opacity="0.9" />

        {/* Rooftop Refrigeration Chiller Unit */}
        <rect x="110" y="14" width="22" height="15" rx="3" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
        <line x1="113" y1="18" x2="129" y2="18" stroke="#0284C7" strokeWidth="1.2" />
        <line x1="113" y1="22" x2="129" y2="22" stroke="#0284C7" strokeWidth="1.2" />

        {/* Insulated Cold Box */}
        <rect x="20" y="20" width="110" height="55" rx="3" fill="#F0FDFA" stroke="#0D9488" strokeWidth="2" />
        <text x="35" y="45" fill="#0F766E" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
          🧊 CHILLER & FREEZER
        </text>
        <text x="45" y="56" fill="#14B8A6" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
          -18°C COLD CHAIN
        </text>

        <g>
          <circle cx="50" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="50" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="80" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="80" cy="85" r="6" fill="#94A3B8" />
        </g>
        <g>
          <circle cx="160" cy="85" r="14" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="160" cy="85" r="6" fill="#94A3B8" />
        </g>
      </svg>
    );
  }

  // 6. PICKUP 4X4 / 1 TON UTILITY (Authentic rugged 4WD dual-cab utility truck with high ground clearance, off-road all-terrain tyres, sports roll bar, side steps, and open cargo tub)
  return (
    <svg
      viewBox="0 0 200 110"
      className={`w-full h-auto drop-shadow-md ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground contact shadow */}
      <ellipse cx="100" cy="98" rx="88" ry="6" fill="#000000" opacity="0.14" />

      {/* High-Clearance 4x4 Box Ladder Chassis Frame */}
      <rect x="22" y="70" width="158" height="6" rx="2" fill="#0F172A" />
      {/* Heavy 4x4 Front Skid Plate / Sump Guard */}
      <path d="M170 73L184 68L186 74L172 76Z" fill="#64748B" stroke="#334155" strokeWidth="1" />

      {/* Front Bullbar / Rugged Bumper */}
      <path d="M174 58H184C188 58 190 62 190 66V75H172V58Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
      <circle cx="186" cy="64" r="3" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.8" />
      {/* Front LED Fog Light */}
      <circle cx="183" cy="71" r="1.8" fill="#FFFFFF" />

      {/* Modern 4x4 Dual-Cab Truck Body (Front Bonnet + Cab) */}
      <path
        d="M86 42H134L150 48L174 54V74H86V42Z"
        fill="#0284C7"
        stroke="#0369A1"
        strokeWidth="2"
      />
      {/* Dual Cab Aerodynamic Roof */}
      <path
        d="M88 42H132C135 42 138 44 140 48L152 64H88V42Z"
        fill="#0369A1"
      />
      {/* Front Windshield (Slanted) */}
      <path
        d="M130 44L148 62H124V44H130Z"
        fill="#E0F2FE"
        stroke="#38BDF8"
        strokeWidth="1"
        opacity="0.95"
      />
      {/* Front Door Window */}
      <rect x="110" y="45" width="12" height="17" rx="1.5" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="0.8" opacity="0.9" />
      {/* Rear Passenger Door Window */}
      <rect x="92" y="45" width="15" height="17" rx="1.5" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="0.8" opacity="0.9" />

      {/* Chrome Door Handles & Body Side Moulding */}
      <rect x="113" y="64" width="6" height="2" rx="0.5" fill="#E2E8F0" />
      <rect x="95" y="64" width="6" height="2" rx="0.5" fill="#E2E8F0" />
      <line x1="88" y1="67" x2="170" y2="67" stroke="#0369A1" strokeWidth="1.5" />

      {/* Heavy-Duty 4x4 Tubular Sports Roll Bar (Behind Cab over Cargo Bed) */}
      <path
        d="M84 41H90V71H84V41Z"
        fill="#1E293B"
        stroke="#0F172A"
        strokeWidth="1.2"
      />
      <path
        d="M86 42L66 70H72L90 44Z"
        fill="#334155"
      />

      {/* Open Rear Cargo Tub / Bed (Integrated Dual-Cab Cargo Box with drop tailgate) */}
      <path
        d="M20 54H84V74H20V54Z"
        fill="#0284C7"
        stroke="#0369A1"
        strokeWidth="2"
      />
      {/* Cargo Bed Inner Black Protective Spray-On Bedliner */}
      <rect x="23" y="52" width="60" height="3" fill="#1E293B" />
      {/* Rear Tailgate Handle */}
      <rect x="20" y="58" width="4" height="14" fill="#0F172A" />
      {/* Rear Tail Lamp (Red vertical cluster) */}
      <rect x="22" y="56" width="3" height="12" rx="1" fill="#DC2626" stroke="#991B1B" strokeWidth="0.8" />

      {/* 4X4 OFF-ROAD Decal on Cargo Bed Flank */}
      <rect x="36" y="59" width="36" height="11" rx="2" fill="#0F172A" opacity="0.9" />
      <text x="40" y="67" fill="#FDE047" fontSize="7" fontWeight="black" fontFamily="sans-serif">
        4X4 TURBO
      </text>

      {/* Rugged Off-Road Side Steps (Rock Sliders under cab) */}
      <rect x="90" y="73" width="48" height="3.5" rx="1.5" fill="#334155" stroke="#1E293B" strokeWidth="1" />
      <line x1="94" y1="75" x2="134" y2="75" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 2" />

      {/* High-Clearance Flared Wheel Arches */}
      <path d="M40 74C40 64 62 64 62 74" stroke="#0F172A" strokeWidth="4" fill="none" />
      <path d="M142 74C142 64 164 64 164 74" stroke="#0F172A" strokeWidth="4" fill="none" />

      {/* Big Rugged All-Terrain (A/T) Deep-Tread Tyres (Rear & Front) */}
      {/* Rear Wheel (Deep tread + chunky alloys) */}
      <g>
        <circle cx="51" cy="80" r="17" fill="#0F172A" stroke="#334155" strokeWidth="2.5" />
        {/* Aggressive tyre tread notches */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 51 + 14.5 * Math.cos(rad);
          const y1 = 80 + 14.5 * Math.sin(rad);
          const x2 = 51 + 17.5 * Math.cos(rad);
          const y2 = 80 + 17.5 * Math.sin(rad);
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth="2" />;
        })}
        {/* Silver Off-Road Alloy Rim */}
        <circle cx="51" cy="80" r="10" fill="#475569" stroke="#E2E8F0" strokeWidth="2" />
        <circle cx="51" cy="80" r="4.5" fill="#0F172A" />
      </g>

      {/* Front Wheel (Deep tread + chunky alloys) */}
      <g>
        <circle cx="153" cy="80" r="17" fill="#0F172A" stroke="#334155" strokeWidth="2.5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 153 + 14.5 * Math.cos(rad);
          const y1 = 80 + 14.5 * Math.sin(rad);
          const x2 = 153 + 17.5 * Math.cos(rad);
          const y2 = 80 + 17.5 * Math.sin(rad);
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth="2" />;
        })}
        <circle cx="153" cy="80" r="10" fill="#475569" stroke="#E2E8F0" strokeWidth="2" />
        <circle cx="153" cy="80" r="4.5" fill="#0F172A" />
      </g>
    </svg>
  );
};

export const LorryBodySelector: React.FC<LorryBodySelectorProps> = ({
  currentLang,
  selectedBodyType,
  onSelectBodyType,
  options,
}) => {
  const [showAllTypesModal, setShowAllTypesModal] = useState<boolean>(false);

  // Derive active meta
  const norm = selectedBodyType.toLowerCase();
  const isLowLoader = norm.includes('low loader') || norm.includes('lowloader') || norm.includes('tunda rendah') || norm.includes('低平板');
  const is20Ft = (norm.includes('20') && (norm.includes('feet') || norm.includes('kaki') || norm.includes('尺') || norm.includes('ft')));
  const is40Ft = (norm.includes('40') && (norm.includes('feet') || norm.includes('kaki') || norm.includes('尺') || norm.includes('ft')));
  const activeKey = isLowLoader
    ? 'lowloader'
    : norm.includes('towing') || norm.includes('tunda') || norm.includes('拖车')
    ? 'towing'
    : norm.includes('crane') || norm.includes('kren') || norm.includes('吊车')
    ? 'crane'
    : norm.includes('tipper') || norm.includes('自卸') || norm.includes('angkat')
    ? 'tipper'
    : norm.includes('tanker') || norm.includes('tangki') || norm.includes('罐车')
    ? 'tanker'
    : is20Ft
    ? 'container20'
    : is40Ft
    ? 'container40'
    : norm.includes('container') || norm.includes('kontena') || norm.includes('集装箱')
    ? 'container'
    : norm.includes('canvas') || norm.includes('kanvas') || norm.includes('帆布')
    ? 'canvas'
    : norm.includes('closed') || norm.includes('tertutup') || norm.includes('封闭')
    ? 'closed'
    : norm.includes('open') || norm.includes('terbuka') || norm.includes('开放')
    ? 'open'
    : norm.includes('curtain') || norm.includes('tirai') || norm.includes('帘布')
    ? 'curtain'
    : norm.includes('refrigerated') || norm.includes('beku') || norm.includes('冷藏')
    ? 'refrigerated'
    : 'pickup';

  const meta = LORRY_BODY_METAS[activeKey] || LORRY_BODY_METAS.container || LORRY_BODY_METAS.canvas;

  // Primary popular choices for quick 1-tap switching:
  const primaryKeys = [
    { key: 'pickup', label: 'Pickup 4x4 🛻' },
    { key: 'canvas', label: 'Kanvas 🎪' },
    { key: 'closed', label: 'Box 📦' },
    { key: 'open', label: 'Open 🚛' },
    { key: 'towing', label: 'Towing 🛻' },
    { key: 'lowloader', label: 'Low Loader 🚜' },
    { key: 'crane', label: 'Crane 🏗️' },
    { key: 'tipper', label: 'Tipper 🚜' },
    { key: 'tanker', label: 'Tanker 🛢️' },
    { key: 'container20', label: '20 Kaki 📦' },
    { key: 'container40', label: '40 Kaki 📦📦' },
  ];

  const handleQuickKeySelect = (key: string) => {
    const found = options.find((opt) => {
      const lower = opt.toLowerCase();
      if (key === 'pickup') return lower.includes('pickup') || lower.includes('皮卡') || lower.includes('4x4');
      if (key === 'lowloader') return lower.includes('low loader') || lower.includes('tunda rendah') || lower.includes('低平板');
      if (key === 'towing') return (lower.includes('towing') || lower.includes('tunda') || lower.includes('拖车')) && !lower.includes('rendah');
      if (key === 'canvas') return lower.includes('canvas') || lower.includes('kanvas');
      if (key === 'closed') return lower.includes('closed') || lower.includes('tertutup');
      if (key === 'open') return lower.includes('open') || lower.includes('terbuka');
      if (key === 'crane') return lower.includes('crane') || lower.includes('kren');
      if (key === 'tipper') return lower.includes('tipper') || lower.includes('自卸');
      if (key === 'tanker') return lower.includes('tanker') || lower.includes('tangki');
      if (key === 'container20') return lower.includes('20') && (lower.includes('feet') || lower.includes('kaki') || lower.includes('尺'));
      if (key === 'container40') return lower.includes('40') && (lower.includes('feet') || lower.includes('kaki') || lower.includes('尺'));
      if (key === 'container') return lower.includes('container') || lower.includes('kontena');
      if (key === 'curtain') return lower.includes('curtain') || lower.includes('tirai');
      return false;
    });
    if (found) {
      onSelectBodyType(found);
    }
  };

  return (
    <div className="space-y-3">
      {/* 1. Standard Select Dropdown for 100% full coverage */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <span>
              {currentLang === 'en'
                ? 'Lorry Body Type'
                : currentLang === 'zh'
                ? '罗里车身类型'
                : 'Jenis Badan Lori'}
            </span>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold border border-amber-200">
              {currentLang === 'en' ? 'Weather & Protection' : currentLang === 'zh' ? '防雨·防护' : 'Kalis Hujan & Kargo'}
            </span>
          </label>

          <button
            type="button"
            onClick={() => setShowAllTypesModal(true)}
            className="text-[11px] font-bold text-[#0D47A1] hover:text-[#1976D2] flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>
              {currentLang === 'en'
                ? 'Compare All Types'
                : currentLang === 'zh'
                ? '图文对比所有车型'
                : 'Bandingkan Semua Jenis'}
            </span>
          </button>
        </div>

        <select
          value={selectedBodyType}
          onChange={(e) => onSelectBodyType(e.target.value)}
          className="w-full px-3.5 py-3 bg-[#F8F9FE] border border-[#E0E0E0] focus:bg-white focus:border-[#FF6B00] rounded-[16px] text-xs text-[#1A1A2E] font-bold focus:outline-none transition-all shadow-xs"
        >
          {options.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Quick 1-Tap Body Type Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {primaryKeys.map((item) => {
          const isSelected = activeKey === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleQuickKeySelect(item.key)}
              className={`px-3.5 py-2 rounded-[12px] text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white shadow-btn-orange scale-[1.02]'
                  : 'bg-white hover:bg-[#F8F9FE] text-[#1A1A2E] border border-[#E0E0E0]'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Detailed Visual Illustration Showcase Card of Selected Body Type */}
      <div className="bg-gradient-to-br from-[#FFF3E0]/40 to-white border border-[#FF6B00]/30 rounded-[16px] p-3.5 sm:p-4 shadow-card-soft flex flex-col sm:flex-row items-center gap-4">
        {/* Visual Lorry Drawing */}
        <div className="w-full sm:w-44 shrink-0 bg-white rounded-[12px] p-2 border border-[#E0E0E0] shadow-xs flex flex-col items-center justify-center">
          <LorryBodyIllustration typeKey={selectedBodyType} className="w-full max-h-24" />
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B00] mt-1">
            {activeKey === 'pickup' ? 'PICKUP 4X4' : `${activeKey.toUpperCase()} LORRY`}
          </span>
        </div>

        {/* Feature Specs */}
        <div className="flex-1 w-full space-y-1.5 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-black text-xs text-[#1A1A2E]">
              {currentLang === 'en' ? meta.titleEn : currentLang === 'zh' ? meta.titleZh : meta.titleMs}
            </h4>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30">
              {currentLang === 'en' ? meta.featureBadgeEn : currentLang === 'zh' ? meta.featureBadgeZh : meta.featureBadgeMs}
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            {currentLang === 'en' ? meta.descEn : currentLang === 'zh' ? meta.descZh : meta.descMs}
          </p>

          <div className="pt-1 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <span className="font-bold text-[#1A1A2E]">
              {currentLang === 'en' ? 'Best for:' : currentLang === 'zh' ? '推荐载送:' : 'Disyorkan:'}
            </span>
            <span className="truncate text-slate-600">
              {currentLang === 'en' ? meta.recommendedForEn : currentLang === 'zh' ? meta.recommendedForZh : meta.recommendedForMs}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Compare All Lorry Body Types Modal */}
      {showAllTypesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E0E0E0] w-full max-w-2xl rounded-[20px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 bg-gradient-to-r from-[#0D47A1] to-[#1976D2] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-white" />
                <h3 className="font-black text-sm">
                  {currentLang === 'en'
                    ? 'Compare Lorry Body Types'
                    : currentLang === 'zh'
                    ? '选择罗里车身类型与外观'
                    : 'Pilih & Bandingkan Jenis Badan Lori'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAllTypesModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
              {Object.entries(LORRY_BODY_METAS).map(([key, item]) => {
                const isSelected = activeKey === key;
                return (
                  <div
                    key={key}
                    onClick={() => {
                      handleQuickKeySelect(key);
                      setShowAllTypesModal(false);
                    }}
                    className={`border-2 rounded-[16px] p-3.5 flex flex-col sm:flex-row items-center gap-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#FF6B00] bg-[#FFF3E0]/40 shadow-xs'
                        : 'border-[#E0E0E0] hover:border-[#FF6B00]/40 hover:bg-[#F8F9FE]'
                    }`}
                  >
                    <div className="w-full sm:w-36 shrink-0 bg-white rounded-[12px] p-2 border border-[#E0E0E0] flex items-center justify-center">
                      <LorryBodyIllustration typeKey={key} className="w-full max-h-20" />
                    </div>

                    <div className="flex-1 text-left space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-xs text-[#1A1A2E]">
                          {currentLang === 'en' ? item.titleEn : currentLang === 'zh' ? item.titleZh : item.titleMs}
                        </h4>
                        <span className="text-[10px] font-black text-[#0D47A1] bg-[#E3F2FD] px-2 py-0.5 rounded-full border border-[#0D47A1]/20">
                          {currentLang === 'en' ? item.featureBadgeEn : currentLang === 'zh' ? item.featureBadgeZh : item.featureBadgeMs}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {currentLang === 'en' ? item.descEn : currentLang === 'zh' ? item.descZh : item.descMs}
                      </p>
                      <div className="text-[10px] text-slate-500 font-medium">
                        💡 {currentLang === 'en' ? item.recommendedForEn : currentLang === 'zh' ? item.recommendedForZh : item.recommendedForMs}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`px-3.5 py-2 rounded-[10px] text-xs font-black shrink-0 cursor-pointer ${
                        isSelected ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9100] text-white shadow-btn-orange' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? '✓ DIPILIH' : 'PILIH'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
