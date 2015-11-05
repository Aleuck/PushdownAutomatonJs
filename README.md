PushdownAutomatonJs
===================

A generic deterministic pushdown automaton simulator in javascript.
Also supports multiple stacks (turing complete), a single stack (context-free languages) and no stack (finite automaton).

Definitions
-----------

### Machine definition
<code>M = {Σ, Q, Π, q<sub>0</sub>, F, V}</code>

Where:<br>
<code>M </code> := Machine<br>
<code>Σ </code> := Alphabet<br>
<code>Q </code> := States set<br>
<code>Π </code> := Program function<br>
<code>q<sub>0</sub></code> := Initial state (<code>q<sub>0</sub> ∈ Q</code>)<br>
<code>F </code> := Final states<br>
<code>V </code> := Auxiliary alphabet<br>

### Program function definition
  <code>Π(q<sub>a</sub>, r, p<sub>1</sub>, ..., p<sub>n</sub>) = (q<sub>b</sub>, w<sub>1</sub>, ..., w<sub>n</sub>)</code>

Where:<br />
<code>q<sub>a</sub></code> := Current state (<code>q<sub>a</sub> ∈ Q</code>)
<br />
<code>q<sub>b</sub></code> := Next state (<code>q<sub>b</sub> ∈ Q</code>)
<br />
<code>r </code> := symbol read from the queue (<code>r ∈ Σ</code>)
<br />
<code>p<sub>i</sub></code> := symbol read (popped) from the i<sup>th</sup> stack (<code>r ∈ Σ</code>)
<br />
<code>w<sub>j</sub></code> := symbol written (pushed) to the j<sup>th</sup> stack (<code>w ∈ Σ ∪ V</code>)

Try it online
-------------
[Click here] (http://inf.ufrgs.br/~aleuck/)

Screenshot
----------
![Screenshot](https://dl.dropboxusercontent.com/u/11043442/screenshot-pushdown_automaton.png)
