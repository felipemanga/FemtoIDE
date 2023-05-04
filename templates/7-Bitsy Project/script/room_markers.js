function RoomMarkerTool(markerCanvas1, markerCanvas2) {
	var selectedRoom = null;

	var markerList = [];
	var curMarker = null;

	markerCanvas1.width = width * scale; // TODO : globals?
	markerCanvas1.height = width * scale;
	var markerCtx1 = markerCanvas1.getContext("2d");

	markerCanvas2.width = width * scale; // TODO : globals?
	markerCanvas2.height = width * scale;
	var markerCtx2 = markerCanvas2.getContext("2d");

	var placementMode = PlacementMode.None;

	// UpdatePlacementButtons();

	function SelectMarker(marker) {
		console.log("SELECT MARKER!!! " + marker);

		curMarker = marker;

		// if (curMarker != null) {
		// 	curMarker.OnSelect(); // TODO : on-deselect also???
		// }

		placementMode = PlacementMode.None;

		RenderMarkerSelection();
	}

	this.AddExit = function() { // TODO : make destination select smarter
		if (selectedRoom == null) {
			return;
		}

		var roomIds = Object.keys(room);
		var roomIndex = roomIds.indexOf(selectedRoom);
		if (roomIds.length > 1) {
			roomIndex++;
			if (roomIndex >= roomIds.length) {
				roomIndex = 0;
			}
		}
		var nextRoomId = roomIds[roomIndex];

		// console.log(room);
		var newExit = {
			x : 2,
			y : 2,
			dest : { // start with valid destination so you can't accidentally uncreate exits
				room : nextRoomId,
				x : 13,
				y : 13
			},
			transition_effect : null,
			// TODO : vNext
			// script_id : null,
		}
		room[selectedRoom].exits.push( newExit );

		var newReturn = {
			x : newExit.dest.x,
			y : newExit.dest.y,
			dest : {
				room : selectedRoom,
				x : newExit.x,
				y : newExit.y
			},
			transition_effect : null,
			// TODO : vNext
			// script_id : null,
		}
		room[newExit.dest.room].exits.push( newReturn );

		markerList = GatherMarkerList();
		SelectMarker(markerList.find(function(m) { return m.type == MarkerType.Exit && m.exit == newExit; }));
		refreshGameData();
	};

	this.AddEnding = function() {
		if (selectedRoom == null) {
			return;
		}

		var newEnding = {
			x : 2,
			y : 2,
			id : nextEndingId(),
		};
		room[selectedRoom].endings.push( newEnding );
		ending[ newEnding.id ] = localization.GetStringOrFallback("default_end_dlg", "The end");

		markerList = GatherMarkerList();
		SelectMarker(markerList.find(function(m) { return m.type == MarkerType.Ending && m.ending == newEnding; }));
		refreshGameData();
	}

	// TODO : vNext
	// this.AddEffect = function() {
	// 	var newEffect = {
	// 		x : 2,
	// 		y : 2,
	// 		id : nextScriptHexId(),
	// 	};
	// 	room[selectedRoom].effects.push( newEffect );
	// 	script[ newEffect.id ] = { type: ScriptType.Script, source: "" }; // TODO : default effect?

	// 	markerList = GatherMarkerList();
	// 	SelectMarker(markerList.find(function(m) { return m.type == MarkerType.Effect && m.effect == newEffect; }));
	// 	refreshGameData();
	// }

	this.Clear = function() {
		selectedRoom = null;
		markerList = [];
		curMarker = null;
	}

	this.SetRoom = function(roomId) {
		selectedRoom = roomId;

		if (selectedRoom === null) {
			SelectMarker(null); // no markers in non-existent rooms
		}

		ResetMarkerList();
	}

	this.Refresh = function() { // TODO: rename "Reset"???
		SelectMarker(null);
		ResetMarkerList();
	}

	this.RefreshKeepSelection = function() {
		// ok this is hacky but if we assume marker ordering hasn't changed... this works
		// !!! be careful only to use this when that will be true
		var tempMarkerIndex = markerList.indexOf(curMarker);

		SelectMarker(null);
		ResetMarkerList();

		if (tempMarkerIndex >= 0 && tempMarkerIndex < markerList.length) {
			SelectMarker(markerList[tempMarkerIndex]);
		}
	}

	function ResetMarkerList() { // TODO : account for when it doesn't exist in parent room either!
		markerList = GatherMarkerList();

		if (curMarker != null) {
			// check for marker that duplicates carry-over marker
			var duplicate = markerList.find(function(marker) {
				return curMarker.Match(marker);
			});
			if (duplicate != undefined && duplicate != null) {
				// if there is a duplicate.. replace it with the carry-over marker
				markerList[markerList.indexOf(duplicate)] = curMarker;
			}
			SelectMarker(curMarker); // refresh UI and so on
		}
		else {
			if (markerList.length > 0) {
				// fallback selected exit
				SelectMarker(markerList[0]);
			}
		}
	}

	function RenderMarkerSelection() { // TODO - break this up???
		console.log('render marker');

		var markersSelect = document.getElementById("markersSelect");
		var noMarkerMessage = document.getElementById("noMarkerMessage");
		markersSelect.style.display = "none";
		noMarkerMessage.style.display = "none";

		var markerControl1 = document.getElementById("markerControl1");
		var markerControl2 = document.getElementById("markerControl2");
		markerControl1.style.visibility = "hidden";
		markerControl2.style.visibility = "hidden";

		if (curMarker != null) {
			markersSelect.style.display = "flex";
			var w = tilesize * scale;
			if (curMarker.MarkerCount() == 2) {
				markerControl1.style.visibility = "visible";
				markerControl2.style.visibility = "visible";

				var startPos = curMarker.GetMarkerPos(0);
				var endPos = curMarker.GetMarkerPos(1);

				if (room[startPos.room] != undefined) {
					drawRoom( room[startPos.room], markerCtx1 );

					markerCtx1.globalAlpha = 1.0;
					markerCtx1.fillStyle = getContrastingColor(room[startPos.room].pal);
					markerCtx1.fillRect((startPos.x * w) - (w * 0.5), (startPos.y * w) - (w * 0.5), w * 2, w * 2);
				}

				if (room[endPos.room] != undefined) {
					drawRoom( room[endPos.room], markerCtx2 );

					markerCtx2.globalAlpha = 1.0;
					markerCtx2.fillStyle = getContrastingColor(room[endPos.room].pal);
					markerCtx2.fillRect(endPos.x * w, endPos.y * w, w, w);
					markerCtx2.fillRect((endPos.x * w) - (w * 0.5), (endPos.y * w) - (w * 0.5), w * 2, w * 2);
				}
			}
			else if (curMarker.MarkerCount() == 1) {
				markerControl1.style.visibility = "visible";

				var markerPos = curMarker.GetMarkerPos(0);

				if (room[markerPos.room] != undefined) {
					drawRoom( room[markerPos.room], markerCtx1 );

					markerCtx1.globalAlpha = 1.0;
					markerCtx1.fillStyle = getContrastingColor(room[markerPos.room].pal);
					markerCtx1.fillRect((markerPos.x * w) - (w * 0.5), (markerPos.y * w) - (w * 0.5), w * 2, w * 2);
				}
			}

			UpdateMarkerNames();
		}
		else {
			noMarkerMessage.style.display = "inline-block";
		}

		UpdateMarkerOptions();
		UpdatePlacementButtons();
		UpdateExitDirectionUI();
	}

	function UpdateMarkerNames() {
		var markerName1 = document.getElementById("markerName1");
		var markerName2 = document.getElementById("markerName2");

		if (curMarker.type == MarkerType.Exit) {
			if (curMarker.linkState == LinkState.TwoWay) {
				markerName1.innerText = localization.GetStringOrFallback("exit_label", "exit");
				markerName2.innerText = localization.GetStringOrFallback("exit_return_label", "return exit");
			}
			else if (curMarker.linkState == LinkState.OneWayOriginal) {
				markerName1.innerText = localization.GetStringOrFallback("exit_label", "exit");
				markerName2.innerText = localization.GetStringOrFallback("destination_label", "destination");
			}
			else if (curMarker.linkState == LinkState.OneWaySwapped) {
				markerName1.innerText = localization.GetStringOrFallback("destination_label", "destination");
				markerName2.innerText = localization.GetStringOrFallback("exit_label", "exit");
			}
		}
		else if (curMarker.type == MarkerType.Ending) {
			markerName1.innerText = localization.GetStringOrFallback("ending_label", "ending");
		}
		// TODO : vNext
		// else if (curMarker.type == MarkerType.Effect) {
		// 	markerName1.innerText = "effect"; // TODO localize
		// }
	}

	function UpdateMarkerOptions() {
		var exitOptions = document.getElementById("exitOptions");
		exitOptions.style.display = "none";

		var endingOptions = document.getElementById("endingOptions");
		endingOptions.style.display = "none";

		// var effectOptions = document.getElementById("effectOptions");
		// effectOptions.style.display = "none";

		if (curMarker != null) {
			if (curMarker.type == MarkerType.Exit) {
				exitOptions.style.display = "block";

				var exitOptionsSelect = document.getElementsByName("exit options select");
				var exitOptionsSelectValue = null;
				for(var i = 0; i < exitOptionsSelect.length; i++){
					if(exitOptionsSelect[i].checked){
						exitOptionsSelectValue = exitOptionsSelect[i].value;
					}
				}

				UpdateExitOptions(exitOptionsSelectValue);
			}
			else if (curMarker.type == MarkerType.Ending) {
				endingOptions.style.display = "block";
				var endingText = document.getElementById("endingText");
				var endingSource = ending[curMarker.ending.id];
				var endingStr = scriptUtils.RemoveDialogBlockFormat(endingSource);
				endingText.value = endingStr;
			}
			// TODO : vNext
			// else if (curMarker.type == MarkerType.Effect) {
			// 	effectOptions.style.display = "block";
			// 	var effectText = document.getElementById("effectText");
			// 	var effectSource = script[curMarker.effect.id].source;
			// 	var effectStr = scriptUtils.RemoveDialogBlockFormat(effectSource);
			// 	effectText.value = effectStr;
			// }
		}
	}

	this.SetExitOptionsVisibility = function(visible) {
		document.getElementById("exitOptionsInner").style.display = visible ? "block" : "none";
		document.getElementById("showExitOptionsCheckIcon").innerText = visible ? "expand_more" : "expand_less";

		if (visible) {
			var exitOptionsSelect = document.getElementsByName("exit options select");
			var exitOptionsSelectValue = null;
			for(var i = 0; i < exitOptionsSelect.length; i++){
				exitOptionsSelect[i].checked = exitOptionsSelect[i].value === "exit1";
			}
			UpdateExitOptions("exit1");
		}
	}

	var curExitOptionsSelectId = null; // hacky but don't judge me
	function UpdateExitOptions(exitSelectId) {
		curExitOptionsSelectId = exitSelectId;

		document.getElementById("exitOptionsRadio").style.display = curMarker.hasReturn ? "flex" : "none";

		// console.log("EXIT OPTIONS " + curExitOptionsSelectId);
		var exit = (curExitOptionsSelectId === "exit2" && curMarker.hasReturn) ? curMarker.return : curMarker.exit;

		var transitionId = exit.transition_effect;
		if (transitionId == null) {
			transitionId = "none";
		}
		// console.log("transitionId " + transitionId);

		var transitionSelect = document.getElementById("exitTransitionEffectSelect");
		for (var i = 0; i < transitionSelect.options.length; i++) {
			transitionSelect.options[i].selected = (transitionSelect.options[i].value === transitionId);
		}
	}
	this.UpdateExitOptions = UpdateExitOptions;

	this.ChangeExitTransitionEffect = function(effectId) {
		var exit = (curExitOptionsSelectId === "exit2" && curMarker.hasReturn) ? curMarker.return : curMarker.exit;
		exit.transition_effect = effectId === "none" ? null : effectId;
		refreshGameData();
	}

	this.RemoveMarker = function() {
		if (curMarker == null) {
			return;
		}

		curMarker.Remove();

		markerList = GatherMarkerList();
		SelectMarker(markerList.length > 0 ? markerList[0] : null);
		refreshGameData();
	}

	this.IsPlacingMarker = function () {
		return placementMode != PlacementMode.None;
	}

	this.GetSelectedMarker = function() {
		return curMarker;
	}

	this.TrySelectMarkerAtLocation = function(x,y) {
		if (placementMode != PlacementMode.None) {
			return false;
		}

		var foundMarker = FindMarkerAtLocation(x,y);
		if (foundMarker != null) {
			SelectMarker(foundMarker);
		}

		return foundMarker != null;
	}

	this.IsMarkerAtLocation = function(x,y) {
		return FindMarkerAtLocation(x,y) != null;
	}

	function FindMarkerAtLocation(x,y) {
		console.log(markerList);
		for (var i = 0; i < markerList.length; i++) {
			var marker = markerList[i];
			if (marker.IsAtLocation(selectedRoom,x,y)) {
				return marker;
			}
		}
		return null;
	}

	this.TogglePlacingFirstMarker = function(isPlacing) {
		if (isPlacing) {
			placementMode = PlacementMode.FirstMarker;
		}
		else {
			placementMode = PlacementMode.None;
		}
		UpdatePlacementButtons();
	}

	this.TogglePlacingSecondMarker = function(isPlacing) {
		if (isPlacing) {
			placementMode = PlacementMode.SecondMarker;
		}
		else {
			placementMode = PlacementMode.None;
		}
		UpdatePlacementButtons();
	}

	this.SelectMarkerRoom1 = function() {
		// hacky global method!!
		if (curMarker != null && curMarker.MarkerCount() >= 1) {
			selectRoom(curMarker.GetMarkerPos(0).room);

			// if (curMarker.type == MarkerType.Exit) {
			// 	UpdateExitOptions("exit1");
			// }
		}
	}

	this.SelectMarkerRoom2 = function() {
		// hacky global method!!
		if (curMarker != null && curMarker.MarkerCount() >= 2) {
			selectRoom(curMarker.GetMarkerPos(1).room);

			// if (curMarker.type == MarkerType.Exit) {
			// 	UpdateExitOptions("exit2");
			// }
		}
	}

	function GetPosString(markerPos) {
		var roomName = room[markerPos.room] != undefined ? room[markerPos.room].name : undefined;
		if (roomName == undefined || roomName == null) {
			roomName = localization.GetStringOrFallback("room_tool_name", "room") + " " + markerPos.room;
		}
		return roomName + " (" + markerPos.x + "," + markerPos.y + ")";
	}

	function UpdatePlacementButtons() {
		if (curMarker == null) {
			return;
		}

		var markerPos1 = curMarker.GetMarkerPos(0);
		var markerPos2 = curMarker.GetMarkerPos(1);

		// hackily relies on global UI names oh well D:
		if (placementMode == PlacementMode.FirstMarker) {
			document.getElementById("toggleMoveMarker1").checked = true;
			document.getElementById("textMoveMarker1").innerText = localization.GetStringOrFallback("marker_moving", "moving");
			document.getElementById("cancelMoveMarker1").style.display = "inline";
			document.getElementById("textMoveMessage1").style.display = "inline";
			document.getElementById("textMarkerPos1").style.display = "none";
		}
		else {
			// var markerPos1 = curMarker.GetMarkerPos(0);
			document.getElementById("toggleMoveMarker1").checked = false;
			document.getElementById("textMoveMarker1").innerText = localization.GetStringOrFallback("marker_move", "move");
			document.getElementById("cancelMoveMarker1").style.display = "none";
			document.getElementById("textMoveMessage1").style.display = "none";
			document.getElementById("textMarkerPos1").style.display = "inline";
		}

		if (placementMode == PlacementMode.SecondMarker) {
			document.getElementById("toggleMoveMarker2").checked = true;
			document.getElementById("textMoveMarker2").innerText = localization.GetStringOrFallback("marker_moving", "moving");
			document.getElementById("cancelMoveMarker2").style.display = "inline";
			document.getElementById("textMoveMessage2").style.display = "inline";
			document.getElementById("textMarkerPos2").style.display = "none";
		}
		else {
			document.getElementById("toggleMoveMarker2").checked = false;
			document.getElementById("textMoveMarker2").innerText = localization.GetStringOrFallback("marker_move", "move");
			document.getElementById("cancelMoveMarker2").style.display = "none";
			document.getElementById("textMoveMessage2").style.display = "none";
			document.getElementById("textMarkerPos2").style.display = "inline";
		}

		document.getElementById("textMarkerPos1").innerText = GetPosString(markerPos1);
		document.getElementById("textMarkerPos2").innerText = GetPosString(markerPos2);

		// TODO : this behaves oddly... change??
		// if (placementMode == PlacementMode.None) {
		// 	document.body.style.cursor = "pointer";
		// }
		// else {
		// 	document.body.style.cursor = "crosshair";
		// }
	}

	this.PlaceMarker = function(x,y) {
		if (curMarker != null) {
			curMarker.PlaceMarker(placementMode,selectedRoom,x,y);
			refreshGameData();
			ResetMarkerList();
		}

		placementMode = PlacementMode.None;
		UpdatePlacementButtons();
	}

	this.PrevMarker = function() {
		if (markerList.length > 0) {
			if (curMarker != null) {
				var index = markerList.indexOf(curMarker);
				if (index != -1) {
					index--;
					if (index < 0) {
						index = markerList.length - 1;
					}

					SelectMarker(markerList[index]);
				}
				else {
					SelectMarker(markerList[0]);
				}
			}
			else {
				SelectMarker(markerList[0]);
			}
		}
		else {
			SelectMarker(null);
		}
	}

	this.NextMarker = function() {
		if (markerList.length > 0) {
			if (curMarker != null) {
				var index = markerList.indexOf(curMarker);
				if (index != -1) {
					index++;
					if (index >= markerList.length) {
						index = 0;
					}

					SelectMarker(markerList[index]);
				}
				else {
					SelectMarker(markerList[0]);
				}
			}
			else {
				SelectMarker(markerList[0]);
			}
		}
		else {
			SelectMarker(null);
		}
	}

	function GatherMarkerList()
	{
		console.log("GATHER EXITS!!");

		var markerList = [];

		if (selectedRoom != null) {
			var findReturnExit = function(parentRoom, startExit) {
				var returnExit = null;
				if (room[startExit.dest.room] != undefined) {
					for (var j in room[startExit.dest.room].exits) {
						var otherExit = room[startExit.dest.room].exits[j];
						if (otherExit.dest.room === parentRoom &&
							otherExit.dest.x == startExit.x && otherExit.dest.y == startExit.y) {
								returnExit = otherExit;
						}
					}
				}
				return returnExit;
			}

			for (var i in room[selectedRoom].exits) {
				var localExit = room[selectedRoom].exits[i];
				var returnExit = findReturnExit(selectedRoom, localExit);

				if (returnExit != null) {
					var alreadyExistingExitInfo = markerList.find(function(e) { return e.exit == returnExit; });
					if (alreadyExistingExitInfo != null && alreadyExistingExitInfo != undefined) {
						continue; // avoid duplicates when both parts of a paired exit are in the same room
					}
				}

				markerList.push(
					new ExitMarker(
						selectedRoom,
						room[selectedRoom].exits[i],
						returnExit != null,
						returnExit,
						returnExit ? LinkState.TwoWay : LinkState.OneWayOriginal)
					);
			}

			for (var r in room) {
				if (r != selectedRoom) {
					for (var i in room[r].exits) {
						var exit = room[r].exits[i];
						if (exit.dest.room === selectedRoom && findReturnExit(r,exit) == null) {

							markerList.push(
								new ExitMarker(
									r,
									exit,
									false,
									null,
									LinkState.OneWayOriginal)
								);
						}
					}
				}
			}

			for (var e in room[selectedRoom].endings) {
				var ending = room[selectedRoom].endings[e];

				markerList.push(
					new EndingMarker(
						selectedRoom,
						ending)
					);
			}

			// TODO : vNext
			// for (var e in room[selectedRoom].effects) {
			// 	var effect = room[selectedRoom].effects[e];

			// 	markerList.push(
			// 		new EffectMarker(
			// 			selectedRoom,
			// 			effect)
			// 		);
			// }
		}

		return markerList;
	}

	var dragMarker = null;

	this.StartDrag = function(x,y) {
		dragMarker = FindMarkerAtLocation(x,y);

		if (dragMarker != null) {
			dragMarker.StartDrag(selectedRoom,x,y);
		}
	}

	this.ContinueDrag = function(x,y) {
		if (dragMarker == null) {
			return;
		}

		dragMarker.ContinueDrag(selectedRoom,x,y);

		refreshGameData();
		RenderMarkerSelection();
	}

	this.EndDrag = function() {
		if (dragMarker != null) {
			dragMarker.EndDrag();
			dragMarker = null;
			refreshGameData();
			RenderMarkerSelection();
		}
	}

	this.IsDraggingMarker = function() {
		return dragMarker != null;
	}

	this.GetMarkerList = function() {
		// ResetMarkerList(); // make sure we are up to date!
		return markerList;
	}

	this.ChangeExitLink = function() {
		if (curMarker != null && curMarker.type == MarkerType.Exit) {
			curMarker.ChangeLink();

			refreshGameData();
			RenderMarkerSelection();
		}
	}

	function UpdateExitDirectionUI() {
		//hacky globals again
		if (curMarker == null || curMarker.type != MarkerType.Exit) {
			document.getElementById("markerLinkControl").style.visibility = "hidden";
			document.getElementById("exitDirectionBackIcon").style.visibility = "hidden";
			document.getElementById("exitDirectionForwardIcon").style.visibility = "hidden";
		}
		else {
			document.getElementById("markerLinkControl").style.visibility = "visible";
			if (curMarker.linkState == LinkState.TwoWay) {
				document.getElementById("exitDirectionBackIcon").style.visibility = "visible";
				document.getElementById("exitDirectionForwardIcon").style.visibility = "visible";
			}
			else if (curMarker.linkState == LinkState.OneWayOriginal) {
				document.getElementById("exitDirectionBackIcon").style.visibility = "hidden";
				document.getElementById("exitDirectionForwardIcon").style.visibility = "visible";
			}
			else if (curMarker.linkState == LinkState.OneWaySwapped) {
				document.getElementById("exitDirectionBackIcon").style.visibility = "visible";
				document.getElementById("exitDirectionForwardIcon").style.visibility = "hidden";
			}
		}
	}

	this.ChangeEndingText = function(text) {
		if (curMarker != null && curMarker.type == MarkerType.Ending) {
			ending[curMarker.ending.id] = scriptUtils.EnsureDialogBlockFormat(text);
			refreshGameData();
		}
	}

	// TDODO : vNext
	// this.ChangeEffectText = function(text) {
	// 	if (curMarker != null && curMarker.type == MarkerType.Effect) {
	// 		script[curMarker.effect.id].source = scriptUtils.EnsureDialogBlockFormat(text);
	// 		refreshGameData();
	// 	}
	// }

	events.Listen("palette_change", function(event) {
		RenderMarkerSelection();
	});

} // RoomMarkerTool()

var MarkerType = { // TODO : I should probably find a way to get rid of this
	Exit : 0,
	Ending : 1,
	// TODO : vNext
	// Effect: 2,
};

var PlacementMode = {
	None : 0,
	FirstMarker : 1,
	SecondMarker : 2
};

// TODO if this proves useful.. move into a shared file
function InitMarkerObj(obj, parent) {
	Object.assign(obj, parent);
	obj.self = obj;
	obj.base = parent;
}

function RoomMarkerBase(parentRoom) {
	this.parentRoom = parentRoom;

	this.DrawMarker = function(ctx,x,y,w,selected) {
		ctx.fillStyle = getComplimentingColor();
		ctx.strokeStyle = getContrastingColor();

		ctx.globalAlpha = 0.7;
		ctx.fillRect(x * w, y * w, w, w);

		ctx.globalAlpha = 1.0;
		ctx.lineWidth = 2.0;
		ctx.strokeRect(x * w, y * w, w, w);

		if (selected) {
			ctx.lineWidth = 4;
			var offset = 3;
			ctx.strokeRect((x * w) - offset, (y * w) - offset, w + (offset*2), w + (offset*2));
		}
	}

	this.Draw = function(ctx,roomId,w,selected) {}

	this.IsAtLocation = function(roomId,x,y) {
		return false;
	}

	this.StartDrag = function(roomId,x,y) {}

	this.ContinueDrag = function(roomId,x,y) {}

	this.EndDrag = function() {}

	this.PlaceMarker = function(placementMode,roomId,x,y) {}

	this.MarkerCount = function() {
		return 1;
	}

	this.GetMarkerPos = function(markerIndex) {
		return null;
	}

	this.Remove = function() {}

	this.Match = function(otherMarker) {
		return false;
	}

	// this.OnSelect = function() {} // TODO
} // RoomMarkerBase()

// NOTE: the "link state" is a UI time concept -- it is not stored in the game data
var LinkState = {
	TwoWay : 0, // two way exit
	OneWayOriginal : 1, // one way exit - in same state as when it was "gathered"
	OneWaySwapped : 2, // one way exit - swapped direction from how it was "gathered"
};

function ExitMarker(parentRoom, exit, hasReturn, returnExit, linkState) {
	InitMarkerObj( this, new RoomMarkerBase(parentRoom) );

	this.type = MarkerType.Exit;

	this.exit = exit;
	this.hasReturn = hasReturn;
	this.return = returnExit; // TODO naming?
	this.linkState = linkState;

	this.Draw = function(ctx,roomId,w,selected) {
		if (this.parentRoom === roomId) {
			this.base.DrawMarker(ctx, this.exit.x, this.exit.y, w, selected);

			if (this.hasReturn) {
				DrawTwoWayExit(ctx, this.exit.x, this.exit.y, w);
			}
			else {
				DrawExit(ctx, this.exit.x, this.exit.y, w);
			}
		}

		if (this.exit.dest.room === roomId) {
			this.base.DrawMarker(ctx, this.exit.dest.x, this.exit.dest.y, w, selected);

			if (this.hasReturn) {
				DrawTwoWayExit(ctx, this.exit.dest.x, this.exit.dest.y, w);
			}
			else {
				DrawEntrance(ctx, this.exit.dest.x, this.exit.dest.y, w);
			}
		}
	}

	function DrawExit(ctx,x,y,w) {
		ctx.fillStyle = getContrastingColor();
		ctx.strokeStyle = getContrastingColor();
		ctx.lineWidth = 2.0;
		ctx.globalAlpha = 1.0;
		var centerX = (x * w) + (w/2);
		var centerY = (y * w) + (w/2);
		ctx.beginPath();
		ctx.moveTo(centerX, centerY - (w/4));
		ctx.lineTo(centerX + (w/6), centerY + (w/12));
		ctx.lineTo(centerX - (w/6), centerY + (w/12));
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(centerX, centerY + (w/12));
		ctx.lineTo(centerX, centerY + (w/4));
		ctx.stroke();
	}

	function DrawEntrance(ctx,x,y,w) {
		ctx.strokeStyle = getContrastingColor();
		ctx.lineWidth = 2.0;
		ctx.globalAlpha = 1.0;
		var centerX = (x * w) + (w/2);
		var centerY = (y * w) + (w/2);
		ctx.beginPath();
		ctx.moveTo(centerX, centerY + (w/4));
		ctx.lineTo(centerX + (w/6), centerY - (w/12));
		ctx.lineTo(centerX - (w/6), centerY - (w/12));
		ctx.lineTo(centerX, centerY + (w/4));
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(centerX, centerY - (w/12));
		ctx.lineTo(centerX, centerY - (w/4));
		ctx.stroke();
	}

	function DrawTwoWayExit(ctx,x,y,w) {
		ctx.fillStyle = getContrastingColor();
		ctx.strokeStyle = getContrastingColor();
		ctx.lineWidth = 3.0;
		ctx.globalAlpha = 1.0;
		var centerX = (x * w) + (w/2);
		var centerY = (y * w) + (w/2);
		ctx.beginPath();
		ctx.moveTo(centerX, centerY - (w/4));
		ctx.lineTo(centerX + (w/6), centerY - (w * 0.1));
		ctx.lineTo(centerX - (w/6), centerY - (w * 0.1));
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(centerX, centerY + (w/4));
		ctx.lineTo(centerX + (w/6), centerY + (w * 0.1));
		ctx.lineTo(centerX - (w/6), centerY + (w * 0.1));
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(centerX, centerY - (w * 0.2));
		ctx.lineTo(centerX, centerY + (w * 0.2));
		ctx.stroke();
	}

	this.IsAtLocation = function(roomId,x,y) {
		var startsInThisRoom = this.parentRoom === roomId && this.exit.x == x && this.exit.y == y;
		var endsInThisRoom = this.exit.dest.room === roomId && this.exit.dest.x == x && this.exit.dest.y == y;
		return startsInThisRoom || endsInThisRoom;
	}

	var Drag = {
		None : -1,
		Exit : 0,
		Destination : 1,
	};
	var dragMode = Drag.None;

	this.StartDrag = function(roomId,x,y) {
		dragMode = Drag.None;

		if (this.parentRoom === roomId &&
				this.exit.x == x && this.exit.y == y) {
			dragMode = Drag.Exit;
		}
		else if (this.exit.dest.room === roomId &&
					this.exit.dest.x == x && this.exit.dest.y == y) {
			dragMode = Drag.Destination;
		}
	}

	this.ContinueDrag = function(roomId,x,y) {
		if (dragMode == Drag.None) {
			return;
		}

		if (dragMode == Drag.Exit) {
			this.exit.x = x;
			this.exit.y = y;
			if (this.hasReturn) {
				this.return.dest.x = x;
				this.return.dest.y = y;
			}
		}
		else if (dragMode == Drag.Destination) {
			this.exit.dest.x = x;
			this.exit.dest.y = y;
			if (this.hasReturn) {
				this.return.x = x;
				this.return.y = y;
			}
		}
	}

	this.EndDrag = function() {
		dragMode = Drag.None;
	}

	this.PlaceMarker = function(placementMode,roomId,x,y) {
		if (placementMode == PlacementMode.FirstMarker) {
			// return (change return destination)
			if (this.hasReturn) {
				this.return.dest.room = roomId;
				this.return.dest.x = x;
				this.return.dest.y = y;
			}

			// room
			if (this.parentRoom != roomId) {
				var oldExitIndex = room[this.parentRoom].exits.indexOf(this.exit);
				room[this.parentRoom].exits.splice(oldExitIndex,1);
				room[roomId].exits.push(this.exit);
				this.parentRoom = roomId;
			}

			// exit pos
			this.exit.x = x;
			this.exit.y = y;
		}
		else if (placementMode == PlacementMode.SecondMarker) {
			// return (change return origin)
			if (this.hasReturn) {
				if (this.exit.dest.room != roomId) {
					var oldReturnIndex = room[this.exit.dest.room].exits.indexOf(this.return);
					room[this.exit.dest.room].exits.splice(oldReturnIndex,1);
					room[roomId].exits.push(this.return);
				}

				this.return.x = x;
				this.return.y = y;
			}

			// room
			this.exit.dest.room = roomId;

			// destination pos
			this.exit.dest.x = x;
			this.exit.dest.y = y;
		}
	}

	this.MarkerCount = function() {
		return 2;
	}

	this.GetMarkerPos = function(markerIndex) {
		if (this.linkState == LinkState.OneWaySwapped) {
			// swap index
			markerIndex = markerIndex == 0 ? 1 : 0;
		}

		if (markerIndex == 0) {
			return {
				room : this.parentRoom,
				x : this.exit.x,
				y : this.exit.y,
			};
		}
		else if (markerIndex == 1) {
			return {
				room : this.exit.dest.room,
				x : this.exit.dest.x,
				y : this.exit.dest.y,
			};
		}

		return null;
	}

	this.Remove = function() {
		if (this.hasReturn) {
			var returnIndex = room[this.exit.dest.room].exits.indexOf(this.return);
			room[this.exit.dest.room].exits.splice(returnIndex,1);
		}
		var exitIndex = room[this.parentRoom].exits.indexOf(this.exit);
		room[this.parentRoom].exits.splice(exitIndex,1);
	}

	this.SwapExitAndEntrance = function() {
		var tempDestRoom = this.parentRoom;
		var tempDestX = this.exit.x;
		var tempDestY = this.exit.y;

		// remove exit from current parent room
		var exitIndex = room[this.parentRoom].exits.indexOf(this.exit);
		room[this.parentRoom].exits.splice(exitIndex,1);

		// add to destination room
		room[this.exit.dest.room].exits.push(this.exit);
		this.parentRoom = this.exit.dest.room;

		// swap positions
		this.exit.x = this.exit.dest.x;
		this.exit.y = this.exit.dest.y;
		this.exit.dest.room = tempDestRoom;
		this.exit.dest.x = tempDestX;
		this.exit.dest.y = tempDestY;
	}

	// hacky way to store the options of each exit as you cycle between link states
	var tempExitOptions = null;
	var tempReturnOptions = null;

	this.ChangeLink = function() {
		if (this.linkState == LinkState.TwoWay) {
			// -- get rid of return exit --
			if (this.hasReturn) {
				tempReturnOptions = { /*script_id : this.return.script_id,*/ transition_effect: this.return.transition_effect };

				var returnIndex = room[this.exit.dest.room].exits.indexOf(this.return);
				room[this.exit.dest.room].exits.splice(returnIndex,1);

				this.return = null;
				this.hasReturn = false;
			}

			this.linkState = LinkState.OneWayOriginal;
		}
		else if (this.linkState == LinkState.OneWayOriginal) {
			tempExitOptions = { /*script_id : this.exit.script_id,*/ transition_effect: this.exit.transition_effect };

			// -- swap the exit & entrance --
			this.SwapExitAndEntrance();

			if (tempReturnOptions != null) {
				// TODO : vNext
				// this.exit.script_id = tempReturnOptions.script_id;
				this.exit.transition_effect = tempReturnOptions.transition_effect;
			}

			this.linkState = LinkState.OneWaySwapped;
		}
		else if (this.linkState == LinkState.OneWaySwapped) {
			// -- create a return exit --
			this.SwapExitAndEntrance(); // swap first

			if (tempExitOptions != null) {
				// TODO : vNext
				// this.exit.script_id = tempExitOptions.script_id;
				this.exit.transition_effect = tempExitOptions.transition_effect;
			}

			var newReturn = {
				x : this.exit.dest.x,
				y : this.exit.dest.y,
				dest : {
					room : this.parentRoom,
					x : this.exit.x,
					y : this.exit.y
				},
				transition_effect : null,
				// TODO : vNext
				// script_id : null,
			}

			if (tempReturnOptions != null) {
				// TODO : vNext
				// newReturn.script_id = tempReturnOptions.script_id;
				newReturn.transition_effect = tempReturnOptions.transition_effect;
			}

			room[this.exit.dest.room].exits.push( newReturn );

			this.return = newReturn;
			this.hasReturn = true;

			this.linkState = LinkState.TwoWay;

			tempExitOptions = null;
			tempReturnOptions = null;
		}
	}

	this.Match = function(otherMarker) {
		if (otherMarker.type == MarkerType.Exit) {
			if ((this.exit == otherMarker.exit && this.return == otherMarker.return) ||
					(this.exit == otherMarker.return && this.return == otherMarker.exit)) {
				return true;
			}
		}
		return false;
	}

	// this.OnSelect = function() {} // TODO
} // ExitMarker()

function EndingMarker(parentRoom, ending) {
	InitMarkerObj( this, new RoomMarkerBase(parentRoom) );

	this.type = MarkerType.Ending;

	this.ending = ending;

	this.Draw = function(ctx,roomId,w,selected) {
		if (this.parentRoom === roomId) {
			this.base.DrawMarker(ctx, this.ending.x, this.ending.y, w, selected);
			DrawEnding(ctx, this.ending.x, this.ending.y, w);
		}
	}

	function DrawEnding(ctx,x,y,w) {
		ctx.strokeStyle = getContrastingColor();
		ctx.lineWidth = 2.0;
		ctx.globalAlpha = 1.0;

		ctx.beginPath();
		ctx.moveTo((x * w) + (w * 0.3), (y * w) + (w * 0.3));
		ctx.lineTo((x * w) + (w * 0.7), (y * w) + (w * 0.7));
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo((x * w) + (w * 0.3), (y * w) + (w * 0.7));
		ctx.lineTo((x * w) + (w * 0.7), (y * w) + (w * 0.3));
		ctx.stroke();
	}

	this.IsAtLocation = function(roomId,x,y) {
		return this.parentRoom === roomId && this.ending.x == x && this.ending.y == y;
	}

	var isDragging = false;

	this.StartDrag = function(roomId,x,y) {
		isDragging = this.IsAtLocation(roomId,x,y);
	}

	this.ContinueDrag = function(roomId,x,y) {
		if (isDragging) {
			this.ending.x = x;
			this.ending.y = y;
		}
	}

	this.EndDrag = function() {
		isDragging = false;
	}

	this.PlaceMarker = function(placementMode,roomId,x,y) {
		if (placementMode != PlacementMode.None) {
			this.ending.x = x;
			this.ending.y = y;
			if (roomId != this.parentRoom) {
				this.Remove();
				room[roomId].endings.push(this.ending);
				this.parentRoom = roomId;
			}
		}
	}

	this.GetMarkerPos = function(markerIndex) {
		return {
			room : this.parentRoom,
			x : this.ending.x,
			y : this.ending.y,
		};
	}

	this.Remove = function() {
		delete dialog[this.ending.id];
		var endingIndex = room[this.parentRoom].endings.indexOf(this.ending);
		room[this.parentRoom].endings.splice(endingIndex,1);
	}

	this.Match = function(otherMarker) {
		return this.type == otherMarker.type && this.ending == otherMarker.ending;
	}

	// this.OnSelect = function() {} // TODO
} // EndingMarker()


// TODO : vNext
// // TODO : feels like I can find a way to share more logic with EndingMarker
// function EffectMarker(parentRoom, effect) {
// 	InitMarkerObj( this, new RoomMarkerBase(parentRoom) );

// 	this.type = MarkerType.Effect;

// 	this.effect = effect;

// 	this.Draw = function(ctx,roomId,w,selected) {
// 		if (this.parentRoom === roomId) {
// 			this.base.DrawMarker(ctx, this.effect.x, this.effect.y, w, selected);
// 			// TODO - specialize??
// 		}
// 	}

// 	this.GetMarkerPos = function(markerIndex) {
// 		return {
// 			room: this.parentRoom,
// 			x: this.effect.x,
// 			y: this.effect.y,
// 		};
// 	}

// 	this.IsAtLocation = function(roomId,x,y) {
// 		return this.parentRoom === roomId && this.effect.x == x && this.effect.y == y;
// 	}

// 	var isDragging = false;

// 	this.StartDrag = function(roomId,x,y) {
// 		isDragging = this.IsAtLocation(roomId,x,y);
// 	}

// 	this.ContinueDrag = function(roomId,x,y) {
// 		if (isDragging) {
// 			this.effect.x = x;
// 			this.effect.y = y;
// 		}
// 	}

// 	this.EndDrag = function() {
// 		isDragging = false;
// 	}

// 	this.Remove = function() {
// 		delete script[this.effect.id];
// 		var effectIndex = room[this.parentRoom].effects.indexOf(this.effect);
// 		room[this.parentRoom].effects.splice(effectIndex,1);
// 	}

// 	this.PlaceMarker = function(placementMode,roomId,x,y) {
// 		if (placementMode != PlacementMode.None) {
// 			this.effect.x = x;
// 			this.effect.y = y;
// 			if (roomId != this.parentRoom) {
// 				this.Remove();
// 				room[roomId].effects.push(this.effect);
// 				this.parentRoom = roomId;
// 			}
// 		}
// 	}

// 	this.Match = function(otherMarker) {
// 		return this.type == otherMarker.type && this.effect == otherMarker.effect;
// 	}
// }