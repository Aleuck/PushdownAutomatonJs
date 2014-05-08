PushdownAutomatonJs
===================

A generic deterministic pushdown automaton simulator in javascript.
Also supports multiple stacks (turing complete), a single stack (context-free languages) and no stack (finite automaton).

The machine dedinition used is as followed:
M = {Σ, Q, Π, q0, F, V}
M := Machine
Σ := Alphabet
Q := States set
Π := Program function
q0 := Initial state (q0 ∈ Q)
F := Final states
V := Auxiliary alphabet

The program function for a machine with n stacks is as folow:
  Π(cq, rq, rs1, ..., rsn) = (nq, ws1, ..., wsn)

Where:
  cq := Current state
  rq := symbol read from the queue
  rsi := symbol read (popped) from the ith stack
  nq := Next state
  wsi := symbol written (pushed) to the ith stack
