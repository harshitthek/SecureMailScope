"use client";

export function StreamTableHeader() {
  return (
    <thead>
      <tr className="border-b border-tactical-border bg-black/70 text-[10px] font-bold uppercase tracking-wider text-tactical-dim select-none">
        <th scope="col" className="py-2 px-2.5 w-10 text-center">#</th>
        <th scope="col" className="py-2 px-2.5 min-w-[220px]">Forensic Flow Vector</th>
        <th scope="col" className="py-2 px-2.5 w-20">Protocol</th>
        <th scope="col" className="py-2 px-2.5 w-24">TLS Version</th>
        <th scope="col" className="py-2 px-2.5">Negotiated Cipher Suite</th>
        <th scope="col" className="py-2 px-2.5 w-20 text-center">PFS</th>
        <th scope="col" className="py-2 px-2.5 w-16 text-center">Score</th>
        <th scope="col" className="py-2 px-2.5 w-24 text-center">Risk State</th>
        <th scope="col" className="py-2 px-2.5 w-20 text-center">Dissect</th>
      </tr>
    </thead>
  );
}
