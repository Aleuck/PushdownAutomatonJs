/* This file is part of PushdownAutomatonJs
 *
 * PushdownAutomatonJs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * PushdownAutomatonJs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with PushdownAutomatonJs.  If not, see <http://www.gnu.org/licenses/>.
 */
// CONSTANTS
var ε = -1,      // read/write nothing
    EMPTY = -2,  // read empty
    FINAL = -1,  // final state id
    REJECT = -2; // reject "state" id (when it stops not in the final state).
// Automaton singleton (Model)
var AUTOMATON_MODEL = (function () {
	// Private variables.
	var Σ, V, X, Y, nStacks, Q = 0, q, prev_q;
	// Σ      := alphabet
	// V      := auxiliar alphabet
	// X      := queue
	// Y      := array of stacks
	// Q      := states
	// F      := array of final states indexes
	// q      := current state
	// prev_q := last state beforing stopping
	function save() {
		var i, j, save = {};
		save.stacks = nStacks;
		save.alphabet = Σ.slice(0);
		save.aux_alphabet = V.slice(0);
		save.states = [];
		for (i = 0; i < Q.length; i += 1) {
			save.states[i] = {};
			for (j in Q[i]) {
				if (Q[i].hasOwnProperty(j)) {
					save.states[i][j] = Q[i][j];
				}
			}
		};
		return JSON.stringify(save);
	}
	function restore(json) {
		var i, errors = [], save;
		try {
			save = JSON.parse(json);
		}
		catch (e) {
			throw new Error("Specified program is not valid.");
			return;
		}
		AUTOMATON_MODEL.init(save.stacks);
		q = 0;
		save.alphabet.forEach(addToAlphabet);
		save.aux_alphabet.forEach(addToAuxAlphabet);
		for (i = 0; i < save.states.length; i += 1) {
			Q[i] = new State();
			Q[i].id = i;
		}
		for (i = 0; i < save.states.length; i += 1) {
			save.states[i].rules.forEach(function (rule) {
				try {
					Q[i].addRule(rule.q, rule.X, rule.Y, rule.W);
				}
				catch (e) {
					errors.push(e.message)
				}
			});
		}
		if (errors.length > 0) {
			throw new Error(errors.join("\n"));
			return;
		}
	}
	function runAll() {
		if (q < 0) q = 0;
		while (q >= 0 && q < Q.length) {
			prev_q = q;
			q = Q[q].execute();
		}
		return (q === -1);
	}
	function step() {
		if (q >= 0 && q < Q.length) {
			prev_q = q;
			q = Q[q].execute();
		} else {
			q = 0;
		}
		return q;
	}
	function resetExec() {
			var i;
			q = 0; 
			X = [];
			Y = [];
			for (i = 0; i < nStacks; i += 1) {
				Y[i] = [];
			}
		}
	// State Constructor
	function State() {
		this.rules = [];
	}
	State.prototype = {
		id: 0,
		rules: null,
		execute: function () {
			var r, rulesToFollow;
			// filter all the rules for rules that match the current state.
			rulesToFollow = this.rules.filter(function (rule) {
				var i, sX, sY = [], follow = true; // assume the rule can be applied
				// Getting the first symbol in the queue and in each stack
				if (X.length === 0) {
					sX = EMPTY;
				} else {
					sX = X[0];
				}
				sY = [];
				for (i = 0; i < Y.length; i += 1) {
					if (Y[i].length === 0) {
						sY[i] = EMPTY;
					} else {
						sY[i] = Y[i][(Y[i].length - 1)]; // get last
					}
				}
				// Comparing the symbols to check if there is a rule that does not match
				if (rule.X !== ε && rule.X !== sX) {
					// queue symbol does not mach -> can't apply rule
					follow = false;
				}
				for (i = 0; i < rule.Y.length; i += 1) {
					if (rule.Y[i] !== ε && rule.Y[i] !== sY[i]) {
						// stack symbol does not match -> can't apply rule
						follow = false;
					}
				}
				return follow;
			});
			if (rulesToFollow.length === 0) {
				// no rule matches, reject the word
				return REJECT;
			}
			if (rulesToFollow.length === 1) {
				// 1 rule match, execute it:
				r = rulesToFollow[0];
				if (r.X !== ε && r.X !== EMPTY) {
					// reading (removing) symbol read from the queue
					X = X.slice(1);
				}
				for (i = 0; i < Y.length; i += 1) {
					if (r.Y[i] !== ε && r.Y[i] !== EMPTY) {
						// reading (removing) the symbol read from the stack
						Y[i].pop();
					}
					if (r.W[i] !== ε) {
						// writing (pushing) symbol to the stack
						Y[i].push(r.W[i]);
					}
				}
				// return destination state
				return r.q;
			}
			// more than 1 rule matches, throw error
			throw new Error("Ambiguous rules on q" + this.id.toString(10));
			return REJECT;
		},
		addRule: function (q, x, y, w) {
			var i, e_rule, n_rule, ruleIdx = this.rules.length, ruleIsAmbiguous = true;
			if (q > Q.length) throw new Error("undefined state");
			this.rules[ruleIdx] = { 'q': q, 'X': x || ε, 'Y': [], 'W': [] };
			n_rule = this.rules[ruleIdx];
			for (i = 0; i < Y.length; i += 1) {
				n_rule.Y[i] = (y && y[i]) || ε;
				n_rule.W[i] = (w && w[i]) || ε;
			}
			for (i = 0; i < ruleIdx; i += 1) {
				e_rule = this.rules[i];
				if (e_rule.X !== ε && n_rule.X !== ε && e_rule.X !== n_rule.X) continue;
				if (function () {
					var i, ambiguity = true;
					for (i = 0; i < e_rule.Y.length; i += 1) {
						if (e_rule.Y[i] !== ε && n_rule.Y[i] !== ε && n_rule.Y[i] !== e_rule.Y[i]) {
							ambiguity = false;
							continue;
						}
					}
					return ambiguity;
				}()) {
					this.rules.pop();
					throw new Error("Ambiguous rules on q" + this.id.toString(10));
					return;
				}
			}
		}
	};
	function removeState (index) {
		var i, j;
		for (i = 0; i < Q.length; i += 1) {
			if (i !== index) {
				for (j = 0; j < Q[i].rules.length; j += 1) {
					if (Q[i].rules[j].q === index) {
						throw new Error("You can't delete a state while there are other states with rules pointing to it.");
						return;
					}
				}
			}
		}
		for (i = 0; i < Q.length; i += 1) {
			if (i !== index) {
				for (j = 0; j < Q[i].rules.length; j += 1) {
					if (Q[i].rules[j].q > index) {
						Q[i].rules[j].q -= 1;
					}
				}
			}
		}
		Q = Q.slice(0,index).concat(Q.slice(index + 1));
		for (i = 0; i < Q.length; i += 1) {
			Q[i].id = i;
		}
	}
	// Alphabet Management
	function addToAlphabet(symbol) {
		if ("string" !== typeof symbol) {
			throw new Error("Expecting string instead of " + (typeof symbol));
			return;
		}
		if (-1 !== V.indexOf(symbol)) {
			throw new Error("Can't add symbol to Σ: V already contains the given symbol.");
			return;
		}
		if ("" !== symbol && -1 === Σ.indexOf(symbol)) {
			Σ.push(symbol);
		}
	}
	function addToAuxAlphabet(symbol) {
		if ("string" !== typeof symbol) {
			throw new Error("Expecting string instead of " + (typeof symbol));
			return;
		}
		if (-1 !== Σ.indexOf(symbol)) {
			throw new Error("Can't add symbol to V: Σ already contains the given symbol.");
			return;
		}
		if (-1 === V.indexOf(symbol)) {
			V.push(symbol);
		}
	}
	function removeFromAlphabet(symbol) {
		var aux;
		if ("string" !== typeof symbol) {
			throw new Error("Expecting string instead of " + (typeof symbol));
			return;
		}
		var index = Σ.indexOf(symbol);
		if (-1 !== index) {
			aux = Σ.slice(0, index).concat(Σ.slice(index + 1));
			Σ = aux;
		}
	}
	function removeFromAuxAlphabet(symbol) {
		var aux;
		if ("string" !== typeof symbol) {
			throw new Error("Expecting string instead of " + (typeof symbol));
			return;
		}
		var index = V.indexOf(symbol);
		if (-1 !== index) {
			aux = V.slice(0, index).concat(V.slice(index + 1));
			V = aux;
		}
	}
	// Queue
	function setQueue(q) {
		X = [];
		// check each symbol if it is on the alphabet before adding it to the X
		q.forEach(function (symbol) {
			if (-1 !== Σ.indexOf(symbol)) {
				X.push(symbol);
			}
		});
	}
	// Public methods
	return {
		init: function (numberOfStacks) {
			var i;
			Σ = [];
			V = [];
			Q = []; // STATES
			//q0 = new State();
			Q[0] = new State();
			Q[0].id = 0;
			q = 0;
			F = [];
			X = []; // QUEUE
			Y = []; // STACKS
			if ("number" !== typeof numberOfStacks) {
				numberOfStacks = 2;
			}
			nStacks = numberOfStacks;
			for (i = 0; i < nStacks; i += 1) {
				Y[i] = [];
			}
		},
		setQueue: setQueue,
		getQueue: function () { return X.slice(0); }, // .slice(0) will create a copy of the array
		getAlphabet: function () { return Σ.slice(0); },
		getAuxAlphabet: function () { return V.slice(0); },
		getStack: function (index) { return Y[index].slice(0); },
		addToAlphabet: addToAlphabet,
		addToAuxAlphabet: addToAuxAlphabet,
		removeFromAlphabet: removeFromAlphabet,
		removeFromAuxAlphabet: removeFromAuxAlphabet,
		getStackNumber: function() { return Y.length; },
		newState: function () {
			var id = Q.length;
			var newState = new State();
			newState.id = id;
			Q[id] = newState;
			return newState;
		},
		removeState: removeState,
		getStates: function() { return Q.slice(0); },
		/* setStateRules
		 * s: source state
		 * x: read from x
		 * y: (array) read from Y
		 * w: (array) write to Y
		 * d: destination state
		 */
		addStateRule: function (s, x, y, w, d) {
			if (Q[s]) Q[s].addRule(d, x, y, w);
		},
		removeStateRule: function (state, index) {
			if (Q[state] && Q[state].rules[index]) {
				Q[state].rules = Q[state].rules.slice(0, index).concat(Q[state].rules.slice(index + 1));
			}
		},
		getCurrentState: function () { return q; },
		getPreviousState: function () { return prev_q; },
		resetExec: resetExec,
		step: step,
		run: runAll,
		save: save,
		restore: restore
	};
}());