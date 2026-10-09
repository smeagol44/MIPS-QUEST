import { useRef, useState } from "react";
import { createMachine, MachineFault, type MachineEvent, type MachineSnapshot } from "@mips-quest/mips-core";

/** Fixed program for Milestone A. User-authorable assembly arrives in Milestone B. */
const program = [
  { source: "addiu $t0, $zero, 3", word: 0x24080003, help: "Put the value 3 into temporary register $t0." },
  { source: "sw    $t0, 0($s0)", word: 0xae080000, help: "Store the register value at the sandbox beacon address." },
  { source: "lw    $t1, 0($s0)", word: 0x8e090000, help: "Read that value back into another register." },
  { source: "nop", word: 0x00000000, help: "Perform no operation." },
] as const;
const start = 0x80000000;
const beaconAddress = start + 0x100;

function hex(value: number, width = 8) {
  return "0x" + (value >>> 0).toString(16).toUpperCase().padStart(width, "0");
}
function reg(value: bigint) {
  return "0x" + BigInt.asUintN(64, value).toString(16).toUpperCase().padStart(16, "0");
}
function createDemo() {
  const machine = createMachine({
    memoryBase: start,
    memorySize: 0x400,
    startPc: start,
    initialRegisters: { 16: BigInt.asIntN(64, BigInt(beaconAddress)) },
  });
  machine.loadWords(start, program.map(item => item.word));
  return machine;
}

export function App() {
  const machine = useRef<ReturnType<typeof createDemo> | null>(null);
  if (!machine.current) machine.current = createDemo();
  const [snapshot, setSnapshot] = useState<MachineSnapshot>(() => machine.current!.snapshot());
  const [events, setEvents] = useState<readonly MachineEvent[]>([]);
  const [fault, setFault] = useState("");
  const [completed, setCompleted] = useState(false);
  const instructionIndex = (snapshot.pc - start) / 4;
  const beacon = ((snapshot.memory[0x100] ?? 0) << 24)
    | ((snapshot.memory[0x101] ?? 0) << 16)
    | ((snapshot.memory[0x102] ?? 0) << 8)
    | (snapshot.memory[0x103] ?? 0);
  const powered = (beacon >>> 0) === 3;

  function step() {
    try {
      const result = machine.current!.step();
      setSnapshot(result.snapshot);
      setEvents(result.events);
      setFault("");
      if (result.snapshot.retiredInstructions >= program.length) setCompleted(true);
    } catch (error) {
      setFault(error instanceof MachineFault ? error.message : String(error));
    }
  }

  function reset() {
    setSnapshot(machine.current!.reset());
    setEvents([]);
    setFault("");
    setCompleted(false);
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="logo"><span className="logo-mark">M<span>.</span></span><span>MIPS <b>QUEST</b><small>THE N64 ROM-HACKING ADVENTURE</small></span></div>
        <span className="build-status"><span className="status-dot" /> MILESTONE A <span className="slash">/</span> FOUNDATION</span>
      </header>
      <main>
        <section className="hero">
          <div className="eyebrow">WELCOME TO THE MACHINE <span>/// 001</span></div>
          <h1>Learn the machine.<br /><em>Rewrite the game.</em></h1>
          <p>A new kind of adventure is booting up. Step into the processor, watch instructions execute, and see the world respond to real MIPS state.</p>
          <div className="hero-tags"><span>64-BIT REGISTERS</span><span>BIG-ENDIAN MEMORY</span><span>REAL INSTRUCTIONS</span></div>
        </section>

        <section className="workbench" aria-label="MIPS CPU diagnostic workbench">
          <div className="section-title"><div><div className="eyebrow">SYSTEM DIAGNOSTIC // 01</div><h2>The First Signal</h2></div><span className="chip">CPU ONLINE</span></div>
          <div className="work-grid">
            <div className="world">
              <div className="panel-heading"><span>01 / MACHINE CHAMBER</span><span>SIMULATED ENVIRONMENT</span></div>
              <div className="scene">
                <div className="star-field" aria-hidden="true">+ &nbsp; · &nbsp; + &nbsp; · &nbsp; +</div>
                <div className="floor" aria-hidden="true" />
                <div className={"beacon " + (powered ? "powered" : "")}>
                  <div className="beacon-ring"><div className="beacon-core" /></div>
                  <div className="beacon-stand" />
                </div>
                <div className="scene-label">SIGNAL BEACON <strong>{powered ? "ACTIVE" : "OFFLINE"}</strong></div>
              </div>
              <div className="mission"><span className="mission-icon">◎</span><div><strong>Restore the beacon</strong><p>Watch the CPU put <code>3</code> into a register, then store it at the beacon's memory address.</p></div><span className={powered ? "solved" : "pending"}>{powered ? "POWERED" : "AWAITING SIGNAL"}</span></div>
            </div>
            <div className="code-panel">
              <div className="panel-heading"><span>02 / INSTRUCTION STREAM</span><span>READ-ONLY DEMO</span></div>
              <div className="code-lines">
                {program.map((line, i) => <div key={i} className={"code-line " + (instructionIndex === i ? "current" : "")}>
                  <span className="line-num">{String(i + 1).padStart(2, "0")}</span><code>{line.source}</code><span className="address">{hex(start + i * 4)}</span>
                </div>)}
                {instructionIndex >= program.length && <div className="end-marker">— END OF DEMO PROGRAM —</div>}
              </div>
              <div className="instruction-hint">{instructionIndex >= 0 && instructionIndex < program.length ? program[instructionIndex]?.help : "Program reached the end of the demonstration."}</div>
              <div className="controls"><button onClick={step} disabled={instructionIndex >= program.length}>▷ &nbsp; STEP INSTRUCTION</button><button className="secondary" onClick={reset}>↺ &nbsp; RESET</button></div>
              <div className="notice" role="status">{fault || (completed ? "Program completed. Reset to experiment again." : "Run individual instructions to inspect their effects.")}</div>
            </div>
          </div>
          <div className="diagnostics">
            <div className="metric"><div>PROGRAM COUNTER</div><strong>{hex(snapshot.pc)}</strong><small>Next instruction address</small></div>
            <div className="metric"><div>REGISTER $T0</div><strong>{reg(snapshot.gpr[8]!)}</strong><small>Temporary value</small></div>
            <div className="metric"><div>REGISTER $T1</div><strong>{reg(snapshot.gpr[9]!)}</strong><small>Loaded memory value</small></div>
            <div className="metric"><div>BEACON MEMORY</div><strong>{hex(beacon)}</strong><small>{hex(beaconAddress)} · 32-bit word</small></div>
          </div>
          <div className="event-panel"><span>LAST MACHINE EVENTS</span><div>{events.length ? events.map((event, i) => <code key={i}>{event.kind === "instruction" ? event.mnemonic.toUpperCase() : event.kind.replaceAll("-", " ").toUpperCase()}</code>) : <p>Step the CPU to begin the execution trace.</p>}</div></div>
        </section>
        <footer><span>EXPERIMENTAL WORKBENCH · NOT YET A PLAYABLE MISSION</span><a href="https://github.com/smeagol44/MIPS-QUEST">VIEW SOURCE ↗</a></footer>
      </main>
    </div>
  );
}
