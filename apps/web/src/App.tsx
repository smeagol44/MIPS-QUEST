import { useRef, useState } from "react";
import { createMachine, MachineFault, type MachineEvent, type MachineSnapshot } from "@mips-quest/mips-core";
import { assemble, AssemblyError, type AssembledProgram } from "@mips-quest/mips-assembler";

const start = 0x80000000;
const beaconAddress = start + 0x100;
const maxInstructions = 32;
const defaultSource = [
  "// Change the power value and see what happens!",
  "addiu $t0, $zero, 3",
  "sw $t0, 0($s0)",
  "lw $t1, 0($s0)",
  "nop",
].join("\n");

function hex(value: number, width = 8) {
  return "0x" + (value >>> 0).toString(16).toUpperCase().padStart(width, "0");
}
function reg(value: bigint) {
  return "0x" + BigInt.asUintN(64, value).toString(16).toUpperCase().padStart(16, "0");
}
function makeMachine(words: readonly number[]) {
  const cpu = createMachine({
    memoryBase: start,
    memorySize: 0x400,
    startPc: start,
    initialRegisters: { 16: BigInt.asIntN(64, BigInt(beaconAddress)) },
  });
  cpu.loadWords(start, words);
  return cpu;
}

export function App() {
  const machine = useRef<ReturnType<typeof makeMachine> | null>(null);
  const [source, setSource] = useState(defaultSource);
  const [loadedSource, setLoadedSource] = useState(defaultSource);
  const [compiled, setCompiled] = useState<AssembledProgram>(() => assemble(defaultSource));
  if (!machine.current) machine.current = makeMachine(compiled.words);
  const [snapshot, setSnapshot] = useState<MachineSnapshot>(() => machine.current!.snapshot());
  const [events, setEvents] = useState<readonly MachineEvent[]>([]);
  const [fault, setFault] = useState("");
  const nextIndex = (snapshot.pc - start) / 4;
  const ended = nextIndex < 0 || nextIndex >= compiled.instructions.length;
  const changed = source !== loadedSource;
  const beacon = machine.current.readWord(beaconAddress);
  const powered = beacon === 3;

  function loadProgram() {
    try {
      const assembled = assemble(source, { maxInstructions });
      const fresh = makeMachine(assembled.words);
      machine.current = fresh;
      setCompiled(assembled);
      setLoadedSource(source);
      setSnapshot(fresh.snapshot());
      setEvents([]);
      setFault("");
    } catch (error) {
      setFault(error instanceof AssemblyError ? error.message : String(error));
    }
  }

  function step() {
    if (changed || ended) return;
    try {
      const result = machine.current!.step();
      setSnapshot(result.snapshot);
      setEvents(result.events);
      setFault("");
    } catch (error) {
      setSnapshot(machine.current!.snapshot());
      setFault(error instanceof MachineFault ? error.message : String(error));
    }
  }

  function run() {
    if (changed || ended) return;
    let lastEvents: readonly MachineEvent[] = [];
    try {
      // Deliberately bounded: no unbounded loops, timers or browser worker required.
      for (let count = 0; count < maxInstructions; count++) {
        const index = (machine.current!.snapshot().pc - start) / 4;
        if (index < 0 || index >= compiled.words.length) break;
        lastEvents = machine.current!.step().events;
      }
      setFault("");
    } catch (error) {
      setFault(error instanceof MachineFault ? error.message : String(error));
    } finally {
      setSnapshot(machine.current!.snapshot());
      setEvents(lastEvents);
    }
  }

  function reset() {
    setSnapshot(machine.current!.reset());
    setEvents([]);
    setFault("");
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="logo"><span className="logo-mark">M<span>.</span></span><span>MIPS <b>QUEST</b><small>THE N64 ROM-HACKING ADVENTURE</small></span></div>
        <span className="build-status"><span className="status-dot" /> MILESTONE B <span className="slash">/</span> EARLY WORKBENCH</span>
      </header>
      <main>
        <section className="hero">
          <div className="eyebrow">WELCOME TO THE MACHINE <span>/// 001</span></div>
          <h1>Learn the machine.<br /><em>Rewrite the game.</em></h1>
          <p>Write MIPS instructions, assemble them into real machine-code words, and see the simulated world respond. Every register and memory change comes from the CPU, not a scripted animation.</p>
          <div className="hero-tags"><span>EDIT REAL MIPS</span><span>64-BIT REGISTERS</span><span>BIG-ENDIAN MEMORY</span><span>6 INSTRUCTIONS</span></div>
        </section>

        <section className="workbench" aria-label="MIPS CPU assembly workbench">
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
              <div className="mission"><span className="mission-icon">◎</span><div><strong>Restore the beacon</strong><p>Put the number <code>3</code> into <code>$t0</code> and store it at <code>0($s0)</code>. Change the number and experiment!</p></div><span className={powered ? "solved" : "pending"}>{powered ? "POWERED" : "AWAITING SIGNAL"}</span></div>
            </div>
            <div className="code-panel">
              <div className="panel-heading"><span>02 / MIPS ASSEMBLER</span><span>EDITABLE SANDBOX</span></div>
              <label htmlFor="assembly-editor" className="editor-heading">SOURCE CODE · ENTER YOUR INSTRUCTIONS</label>
              <textarea id="assembly-editor" aria-label="MIPS assembly source code" className="assembly-editor" spellCheck={false} value={source} onChange={event => setSource(event.target.value)} />
              <div className="assembly-help">Try changing <code>3</code> to <code>2</code> or <code>5</code>. Click <strong>ASSEMBLE &amp; LOAD</strong>, then <strong>STEP</strong> or <strong>RUN</strong>. Only NOP, ADDIU, ORI, LUI, LW, and SW are supported so far.</div>
              <div className="controls edit-controls">
                <button onClick={loadProgram}>⚙ &nbsp; ASSEMBLE &amp; LOAD</button>
                <button className="secondary" onClick={step} disabled={changed || ended}>▷ &nbsp; STEP</button>
                <button className="secondary" onClick={run} disabled={changed || ended}>▶ &nbsp; RUN</button>
                <button className="secondary" onClick={reset}>↺ &nbsp; RESET</button>
              </div>
              <div className={"notice " + (fault ? "error" : changed ? "warning" : "")} role="status">
                {fault || (changed ? "Source changed. Assemble & Load before executing the new code." : ended ? "Program reached its end. Reset or assemble another program." : "Ready: step through instructions or run the bounded program.")}
              </div>
              <div className="panel-heading"><span>03 / ASSEMBLED INSTRUCTIONS</span><span>{compiled.words.length} WORDS</span></div>
              <div className="code-lines">
                {compiled.instructions.map((line, i) => <div key={i} className={"code-line " + (!changed && nextIndex === i ? "current" : "")}>
                  <span className="line-num">{String(line.line).padStart(2, "0")}</span><code>{line.source}</code><span className="address">{hex(line.word)}</span>
                </div>)}
                {!changed && ended && <div className="end-marker">— END OF PROGRAM —</div>}
              </div>
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
        <footer><span>EARLY EXPERIMENTAL WORKBENCH · NOT YET A COMPLETE PLAYABLE MISSION</span><a href="https://github.com/smeagol44/MIPS-QUEST">VIEW SOURCE ↗</a></footer>
      </main>
    </div>
  );
}
