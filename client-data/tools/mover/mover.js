/**
 *						  WHITEBOPHIR
 *********************************************************
 * @licstart  The following is the entire license notice for the 
 *	JavaScript code in this page.
 *
 * Copyright (C) 2013  Ophir LOJKINE
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend
 */

(function mover() { //Code isolation
	var selected = null;
	var last_sent = 0;


	function startMoving(x, y, evt) {
		//Prevent the press from being interpreted by the browser
		evt.preventDefault();
		if (!evt.target || !Tools.drawingArea.contains(evt.target)) return;
		var tmatrix = get_translate_matrix(evt.target);
		selected = { elem: evt.target, x: x - tmatrix.e, y: y - tmatrix.f };
	}

	function move(x, y) {
		if (!selected) return;
		var deltax = x - selected.x;
		var deltay = y - selected.y;
		var msg = { type: "update", id: selected.elem.id, deltax: deltax, deltay: deltay };
		var now = performance.now();
		if (now - last_sent > 70) {
			last_sent = now;
			Tools.drawAndSend(msg);
		} else {
			draw(msg);
		}
	}

	function stopMoving(x, y) {
		move(x, y);
		selected = null;
	}

	function get_translate_matrix(elem) {
		// Returns the first translate or transform matrix or makes one
		var translate = null;
		for (var i = 0; i < elem.transform.baseVal.numberOfItems; ++i) {
			var baseVal = elem.transform.baseVal[i];
			// quick tests showed that even if one changes only the fields e and f or uses createSVGTransformFromMatrix
			// the brower may add a SVG_TRANSFORM_MATRIX instead of a SVG_TRANSFORM_TRANSLATE
			if (baseVal.type === SVGTransform.SVG_TRANSFORM_TRANSLATE || baseVal.type === SVGTransform.SVG_TRANSFORM_MATRIX) {
				translate = baseVal;
				break;
			}
		}
		if (translate == null) {
			translate = elem.transform.baseVal.createSVGTransformFromMatrix(Tools.svg.createSVGMatrix());
			elem.transform.baseVal.appendItem(translate);
		}
		return translate.matrix;
	}

	function draw(data) {
		switch (data.type) {
			case "update":
				var elem = Tools.svg.getElementById(data.id);
				if (!elem) throw new Error("Mover: Tried to move an element that does not exist.");
				var tmatrix = get_translate_matrix(elem);
				tmatrix.e = data.deltax || 0;
				tmatrix.f = data.deltay || 0;
				break;

			default:
				throw new Error("Mover: 'move' instruction with unknown type. ", data);
		}
	}

	var moverTool = { //The new tool
		"name": "Mover",
		"shortcut": "m",
		"listeners": {
			"press": startMoving,
			"move": move,
			"release": stopMoving,
		},
		"draw": draw,
		"icon": "tools/mover/icon_one.svg",
		"mouseCursor": "move",
		"showMarker": true,
	};
	Tools.add(moverTool);
})(); //End of code isolation
