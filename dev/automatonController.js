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
 
// Interface singleton (Controller)
AUTOMATON_CONTROLLER = (function (M) {
	var maxStackCount = 10,  // max number of stacks allowed
		edit = true,         // is user is editing the states // false when executing
	    stacksManagement,    // screen to choose the number of stacks
	    alphabetsManagement, // screen to set the alphabets symbols
	    statesManagement,    // screen to set the states
	    editButtons,         // div containing the buttons to show when editing the states
	    executeButtons,      // div containing the buttons to show when executing the program
	    lAlph,               // label for the symbols of the alphabet definition
	    lAuxAlph,            // label for the symbols of the auxiliar alphabet definition
	    lStates,             // label for the list of states
	    ulAlph,              // alphabet list on alphabet management
	    ulAuxAlph,           // auxiliar alphabet list on alphabet management
	    ulStates,            // list of states on states&rules management
	    ulStacks,            // list containing the input queue and all the stacks
	    iAlphSym,            // input field for the alphabet symbols
	    iAuxAlphSym,         // input field for the auxiliar alphabet symbols
	    iQueue,              // input field for the queue.
	    bAddAlphSym,         // button to add symbol on input to the alphabet
	    bAddAuxAlphSym,      // button to add symbol on input to the auxiliar alphabet
	    bAlphabetsSubmit,    // button to finish editing the alphabet
	    bExecution,          // button to switch to the execution interface
	    bStep,               // button to execute a single step of the computation.
	    bRun,                // button to execute the program till it reachs the final state (warning: possible infinte loop)
	    bEditStates,         // button to leave execution mode and resume editing the program
	    bSetQueue,           // button to set the input queue's content
	    bSave,               // button to save the program
	    bLoad;               // button to load the program

	// updateAlph (function to update the alphabet on interface during editing)
	function updateAlph() {
		var alph = M.getAlphabet(), symStrList = [];
		alph.forEach(function (s) {
			symStrList.push('<li class="symbol" title="click to remove">' + s + '</li>');
		});
		ulAlph.innerHTML = symStrList.join("\n");
		symStrList = [];
		alph.forEach(function (s) {
			symStrList.push('<span class="symbol">' + s + '</span>');
		});
		lAlph.innerHTML = symStrList.join(", ");
	}
	// updateAuxAlph (function to update the auxiliar alphabet on interface during editing)
	function updateAuxAlph() {
		var alph = M.getAuxAlphabet(), symStrList = [];
		alph.forEach(function (s) {
			symStrList.push('<li class="symbol">' + s + '</li>');
		});
		ulAuxAlph.innerHTML = symStrList.join("\n");
		symStrList = [];
		alph.forEach(function (s) {
			symStrList.push('<span class="symbol">' + s + '</span>')
		});
		lAuxAlph.innerHTML = symStrList.join(", ");
	}
	// updateStates (function to update the states on the interface during editing or execution)
	// params: [edit = true] : set as false to disable edit
	function updateStates() {
		var i, j, k, s, stack, states = M.getStates(),
		    alphabet = M.getAlphabet(),
		    sAlphabet = alphabet.concat(M.getAuxAlphabet()),
		    nStacks = M.getStackNumber(),
		    nStates = states.length,
		    queue = M.getQueue(),
		    c_state = M.getCurrentState(),
		    next_rules = ((c_state >= 0) && states[c_state].nextRules()) || [],
		    stateListHtml = [],
		    statesDefHtml = [],
		    stacksListHtml = [];
		for (i = 0; i < nStates; i += 1) {
			statesDefHtml.push("q" + i.toString(10).sub());
			// state list
			stateListHtml.push('<li class="state');
			if (c_state === i && !edit) {
				stateListHtml.push(' current');
			}
			stateListHtml.push('" id="q' + i.toString(10) + '">');
			stateListHtml.push('<h2>q' + i.toString(10).sub() + '</h2>');
			if (edit && i > 0) {
				stateListHtml.push('<button type="button" id="removestate_' + i + '" class="delete">x</button>');
			}
			stateListHtml.push('<ul class="rules"><h3>Rules</h3>');
			for (j = 0; j < states[i].rules.length; j += 1) {
				stateListHtml.push('<li');
				if (i === c_state && -1 !== next_rules.indexOf(j)) {
					stateListHtml.push(' class="next"');
				}
				stateListHtml.push('>Π(q' + i.toString(10));
				s = states[i].rules[j].X;
				if (s === EMPTY) { s = '?'; }
				if (s === ε) { s = 'ε'; }
				stateListHtml.push(', ' + (s));
				for (k = 0; k < nStacks; k += 1) {
					s = states[i].rules[j].Y[k];
					if (s === EMPTY) { s = '?'; }
					if (s === ε) { s = 'ε'; }
					stateListHtml.push(', ' + s);
				}
				stateListHtml.push(') = (q' + (states[i].rules[j].q < 0 ? 'f'.sub() : states[i].rules[j].q.toString().sub()) );
				for (k = 0; k < nStacks; k += 1) {
					s = states[i].rules[j].W[k];
					if (s === ε) { s = 'ε'; }
					stateListHtml.push(', ' + s);
				}
				stateListHtml.push(')');
				if (edit) {
					stateListHtml.push(' <button id="removerule_' + i + '_' + j + '" class="delete">x</button></li>');
				}
			}
			stateListHtml.push('</ul>');
			// New rule form
			if (edit) {
				stateListHtml.push('<div class="new_rule"><b>New rule:</b><br>');
				stateListHtml.push('Π(q' + i.toString(10).sub());
				stateListHtml.push(', <select id="q' + i.toString(10) + '_XRead">');
				stateListHtml.push('<option value="' + ε.toString(10) + '">ε</option>');
				stateListHtml.push('<option value="' + EMPTY.toString(10) + '">?</option>');
				for (j = 0; j < alphabet.length; j += 1) {
					stateListHtml.push('<option value="s' +  alphabet[j] + '">' + alphabet[j] + '</option>');
					// The 's' character in the value property is intended to tell the program
					// the programthe value is a symbol not a integer constant.
				}
				stateListHtml.push('</select>');
				for (j = 0; j < nStacks; j += 1) {
					stateListHtml.push(', <select id="q' + i.toString(10) + '_YRead_' + j.toString(10) + '">');
					stateListHtml.push('<option value="' + ε.toString(10) + '">ε</option>');
					stateListHtml.push('<option value="' + EMPTY.toString(10) + '">?</option>');
					for (k = 0; k < sAlphabet.length; k += 1) {
						stateListHtml.push('<option value="s' + sAlphabet[k] + '">' + sAlphabet[k] + '</option>');
						// The 's' character in the value property is intended to tell the program
						// the programthe value is a symbol not a integer constant.
					}
					stateListHtml.push('</select>');
				}
				stateListHtml.push(') = (<select id="q' + i.toString(10) + '_stateTo">');
				for (j = 0; j < nStates; j += 1) {
					stateListHtml.push('<option value="' + j.toString(10) + '">q' + j.toString(10).sub() + '</option>');
				}
				stateListHtml.push('<option value="' + FINAL + '">q<sub>f</sub></option></select>');
				for (j = 0; j < nStacks; j += 1) {
					stateListHtml.push(', <select id="q' + i.toString(10) + '_YWrite_' + j.toString(10) + '">');
					stateListHtml.push('<option value="' + ε.toString(10) + '">ε</option>');
					for (k = 0; k < sAlphabet.length; k += 1) {
						stateListHtml.push('<option value="s' + sAlphabet[k] + '">' + sAlphabet[k] + '</option>');
					}
					stateListHtml.push('</select>');
				}
				stateListHtml.push(')<br><button type="button" id="addrule_' + i.toString(10) + '">save rule</button></div>');
			}
			stateListHtml.push('</li>');
		}
		statesDefHtml.push("q<sub>f</sub>");
		stateListHtml.push('<li class="state');
		if (c_state === -1 && !edit) {
			stateListHtml.push(' current');
		}
		stateListHtml.push('" id="qf"><h2>q<sub>f</sub></h2></li>');
		stateListHtml.push('<li style="clear: both; float:none; display: block;"></li>');
		lStates.innerHTML  = statesDefHtml.join(", ");
		ulStates.innerHTML = stateListHtml.join("");
	}
	// updateStacks (function to update the stack&queue interface during editing and execution)
	// params: [edit = false] : set as true to enable editing the queue content
	function updateStacks() {
		var i, j, stackListHtml = [], queue = M.getQueue(), stack, nStacks = M.getStackNumber();
		stackListHtml.push('<li><h2>X</h2><ul class="queue">');
		for (i = 0; i < queue.length; i += 1) {
			stackListHtml.push('<li class="symbol">' + queue[i] + '</li>');
		}
		stackListHtml.push("</ul></li>");
		for (i = 0; i < nStacks; i += 1) {
			stack = M.getStack(i);
			stackListHtml.push('<li><h2>Y' + i.toString(10).sub() + '</h2><ul class="stack">');
			while (stack.length > 0) {
				stackListHtml.push('<li class="symbol">' + stack.pop().toString(10) + '</li>');
			}
			stackListHtml.push('</ul></li>');
		}
		// if (!edit) {
		// 	stackListHtml.push('<br><input id="input_queue" type="text" placeholder="Set input queue"> <button type="button" id="set_queue">set</button>');
		// }
		ulStacks.innerHTML = stackListHtml.join("");
	}
	function bAddAlphSym_onclick() {
		if (iAlphSym && iAlphSym.value !== "") {
			try {
				M.addToAlphabet(iAlphSym.value);
			}
			catch (e) {
				alert(e.message)
			}
			iAlphSym.value = "";
			updateAlph();
			iAlphSym.focus();
		}
	}
	function bAddAuxAlphSym_onclick() {
		var alph, symStrList = [];
		if (iAuxAlphSym && iAuxAlphSym.value !== "") {
			try {
				M.addToAuxAlphabet(iAuxAlphSym.value);
			}
			catch (e) {
				alert(e.message)
			}
			iAuxAlphSym.value = "";
			updateAuxAlph();
			iAuxAlphSym.focus();
		}
	}
	function ulAlph_onclick(e) {
		var elem, symbol;
		e = e || event;
		elem = e.target;
		// if the element is of class "symbol"
		if (-1 !== Array.prototype.indexOf.call(elem.classList, "symbol")) {
			symbol = elem.textContent;
			M.removeFromAlphabet(symbol);
			updateAlph();
		}
	}
	function ulAuxAlph_onclick(e) {
		var elem, symbol;
		e = e || event;
		elem = e.target;
		// if the element is of class "symbol"
		if (-1 !== Array.prototype.indexOf.call(elem.classList, "symbol")) {
			symbol = elem.textContent;
			M.removeFromAuxAlphabet(symbol);
			updateAuxAlph();
		}
	}
	function bStackNumber_onclick() {
		var stacksNumber = parseInt(iStacksNumber.value);
		if (isNaN(stacksNumber) || stacksNumber < 0 || stacksNumber > maxStackCount) {
			alert("The number of stacks must be a number from 0 to " + maxStackCount);
		} else {
			M.init(stacksNumber);
			switchScreen("alphabets");
		}
	}
	function bAlphabetsSubmit_onclick() {
		updateStates();
		updateStacks();
		switchScreen("states");
	}
	function bNewState_onclick() {
		M.newState();
		updateStates();
	}
	function addRule(src) {
		var i, x, y = [], w = [], dest, nStacks = M.getStackNumber()
		dest = parseInt(document.getElementById('q' + src.toString(10) + '_stateTo').value, 10);
		// get the raw symbol
		x = document.getElementById("q" + src.toString(10) + "_XRead").value;
		// symbols startinh with 's'  are strings, anything else should be a integer constant
		x = x[0] === 's' ? x.slice(1) : parseInt(x, 10);
		for (i = 0; i < nStacks; i += 1) {
			// get the raw symbol
			y[i] = document.getElementById('q' + src.toString(10) + '_YRead_' + i.toString(10)).value;
			// symbols startinh with 's'  are strings, anything else should be a integer constant
			y[i] = y[i][0] === 's' ? y[i].slice(1) : parseInt(y[i], 10);
			// get the raw symbol
			w[i] = document.getElementById('q' + src.toString(10) + '_YWrite_' + i.toString(10)).value;
			// symbols startinh with 's'  are strings, anything else should be a integer constant
			w[i] = w[i][0] === 's' ? w[i].slice(1) : parseInt(w[i], 10);
		}
		try {
			M.addStateRule(src, x, y, w, dest);
		}
		catch(e) {
			alert(e.message);
		}
		updateStates();
	}
	function removeRule(state, rule) {
		M.removeStateRule(state, rule);
		updateStates();
	}
	function removeState (state) {
		try {
			M.removeState(state);
		}
		catch (e) {
			alert(e.message);
		}
		updateStates();
	}
	function ulStates_onclick(e) {
		var i, elem, aId;
		e = e || event;
		elem = e.target;
		aId = elem.id.split("_");
		if (aId.length) { 
			switch(aId[0]) {
				case "addrule":
					addRule(parseInt(aId[1], 10));
					break;
				case "removerule":
					removeRule(parseInt(aId[1], 10), parseInt(aId[2], 10))
					break;
				case "removestate":
					removeState(parseInt(aId[1], 10));
					break;
			}
		}
	}
	function bSetQueue_onclick () {
		var q = document.getElementById("input_queue").value.split("");
		M.setQueue(q);
		updateStacks();
		updateStates();
	}
	function ulStacks_onclick (e) {
		var elem, q;
		e = e || event;
		elem = e.target;
		if (elem.id === "set_queue") {
			bSetQueue_onclick();
		}
	}
	function bExecution_onclick () {
		edit = false;
		updateStates();
		updateStacks();
		switchScreen('execution');
	}
	function bStep_onclick() {
		var s, c = M.getCurrentState();
		if (c >= 0) {
			s = M.step();
		} else {
			M.resetExec();
		}
		updateStates();
		updateStacks();
		switch (s) {
			case FINAL:
				alert('Word accepted / Computation complete');
				M.resetExec();
				updateStates();
				updateStacks();
				break;
			case REJECT:
				alert('Word rejected / Computation failed');
				M.resetExec();
				updateStates();
				updateStacks();
				break;
		}
	}
	function bRun_onclick () {
		if (confirm("If your program fall into a infinte loop, your browser might crash, are you sure?")) {
			if (M.run()) {
				alert('Word accepted / Computation complete');
			} else {
				alert('Word rejected / Computation failed');
			}
			M.resetExec();
			updateStates();
			updateStacks();
		}
	}
	function bEditStates_onclick () {
		edit = true;
		// update the states
		updateStates();
		// update the stacks
		updateStacks();
		switchScreen("states")
	}
	function bSave_onclick () {
		var saveData = M.save();
		prompt("Copy the program data below and paste to a text file:", saveData);
	}
	function bLoad_onclick() {
		var data = prompt("Paste the program data below:");
		try {
			M.restore(data);
		}
		catch (e) {
			alert(e.message);
			M.init();
			updateAlph();
			updateAuxAlph();
			updateStates();
			updateStacks();
			switchScreen("stacks");
			return;
		}
		edit = false;
		updateAlph();
		updateAuxAlph();
		updateStates();
		updateStacks();
		switchScreen("execution");
	}
	function switchScreen(screen) {
		bSave.disabled = true;
		bRun.disabled = true;
		bStep.disabled = true;
		bNewState.disabled = true;
		bExecution.disabled = true;
		bEditStates.disabled = true;
		stacksManagement.style.display    = "none";
		alphabetsManagement.style.display = "none";
		statesManagement.style.display    = "none";
		//editButtons.style.display         = "none";
		//executeButtons.style.display      = "none";
		switch (screen) {
			case "stacks":
				stacksManagement.style.display    = "block";
				break;
			case "alphabets":
				alphabetsManagement.style.display = "block";
				break;
			case "states":
				//ulStates.onclick = ulStates_onclick;
				bSave.disabled = false;
				bExecution.disabled = false;
				bNewState.disabled = false;
				//editButtons.style.display         = "block";
				statesManagement.style.display    = "block";
				break;
			case "execution":
				//ulStates.onclick = null;
				bSave.disabled = false;
				bEditStates.disabled = false;
				bRun.disabled = false;
				bStep.disabled = false;
				//executeButtons.style.display      = "block";
				statesManagement.style.display    = "block";
				break;
		}
	}
	return {
		init: function () {
			// GET SCREEN INTERFACE ELEMENTS
			stacksManagement    = document.getElementById("stacks_management");
			alphabetsManagement = document.getElementById("alphabets_management");
			statesManagement    = document.getElementById("states_management");
			// GET I/O INTERFACE ELEMENTS
			lAlph            = document.getElementById("alphabet");
			lAuxAlph         = document.getElementById("aux_alphabet");
			lStates          = document.getElementById("states");
			ulAlph           = document.getElementById("alphabet_list");
			ulAuxAlph        = document.getElementById("aux_alphabet_list");
			iAlphSym         = document.getElementById("input_alphabet_symbol");
			iAuxAlphSym      = document.getElementById("input_aux_alphabet_symbol");
			iStacksNumber    = document.getElementById("stacks_number");
			bAddAlphSym      = document.getElementById("add_alphabet");
			bAddAuxAlphSym   = document.getElementById("add_aux_alphabet");
			bStacksNumber    = document.getElementById("set_stacks_number");
			bAlphabetsSubmit = document.getElementById("alphabets_submit");
			bNewState        = document.getElementById("new_state");
			ulStates         = document.getElementById("state_list");
			ulStacks         = document.getElementById("queuestacks_list");
			bExecution       = document.getElementById("goto_execution");
			bStep            = document.getElementById("run_step");
			bRun             = document.getElementById("run_all");
			editButtons      = document.getElementById("edit_buttons");
			executeButtons   = document.getElementById("execute_buttons");
			bEditStates      = document.getElementById("edit_states");
			bSave            = document.getElementById("save");
			bLoad            = document.getElementById("load");
			// SET INTERFACE HANDLERS
			switchScreen("stacks");
			bAddAlphSym.onclick      = bAddAlphSym_onclick;
			bAddAuxAlphSym.onclick   = bAddAuxAlphSym_onclick;
			ulAlph.onclick           = ulAlph_onclick;
			ulAuxAlph.onclick        = ulAuxAlph_onclick;
			bStacksNumber.onclick    = bStackNumber_onclick;
			bAlphabetsSubmit.onclick = bAlphabetsSubmit_onclick;
			bNewState.onclick        = bNewState_onclick;
			ulStates.onclick         = ulStates_onclick;
			ulStacks.onclick         = ulStacks_onclick;
			bExecution.onclick       = bExecution_onclick;
			bStep.onclick            = bStep_onclick;
			bRun.onclick             = bRun_onclick;
			bEditStates.onclick      = bEditStates_onclick;
			bSave.onclick            = bSave_onclick;
			bLoad.onclick             = bLoad_onclick;
		}
	};
}(AUTOMATON_MODEL));