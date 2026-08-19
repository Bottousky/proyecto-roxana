extends Node

var _enabled: bool = false
var _host_ready: bool = false

signal event_to_web(event_name: String, payload: Dictionary)
signal command_from_web(command: String, payload: Dictionary)

func _ready() -> void:
	_detect_environment()
	process_mode = Node.PROCESS_MODE_ALWAYS

func _detect_environment() -> void:
	if OS.has_feature("web"):
		_enabled = true
		var avail := _js_available()
		if not avail:
			_enabled = false
			push_warning("JavaScriptBridge eval unavailable; running web build without bridge.")
	else:
		_enabled = false

func _js_available() -> bool:
	if not ClassDB.class_exists("JavaScriptBridge"):
		return false
	var script_text := "if (typeof window === 'undefined') { return false; } return true;"
	var out: Variant = JavaScriptBridge.eval(script_text, true)
	return out == true

func is_web() -> bool:
	return _enabled

func set_host_ready(ready: bool) -> void:
	_host_ready = ready
	if ready:
		emit_event("game.ready", {
			"world": GameState.current_world,
			"scene": GameState.current_scene,
			"discoveries": GameState.discoveries.duplicate(true),
			"flags": GameState.flags.duplicate(true),
		})

func emit_event(event_name: String, payload: Dictionary) -> void:
	event_to_web.emit(event_name, payload)
	_deliver_to_web(event_name, payload)

func _deliver_to_web(event_name: String, payload: Dictionary) -> void:
	if not _enabled:
		return
	if not ClassDB.class_exists("JavaScriptBridge"):
		return
	var json := JSON.stringify({"event": event_name, "payload": payload})
	JavaScriptBridge.eval("window.dispatchEvent(new CustomEvent('roxana:event', {detail: %s}));" % json, true)

func receive_command(command: String, payload: Dictionary) -> void:
	command_from_web.emit(command, payload)
	match command:
		"pause":
			pause_game()
		"resume":
			resume_game()
		"load_state":
			_apply_load_state(payload)
		"set_flag":
			var n := str(payload.get("name", ""))
			var v := bool(payload.get("value", true))
			GameState.set_flag(n, v)
		"teleport":
			var p = payload.get("position", {})
			if p is Dictionary:
				_teleport_player(Vector2(float(p.get("x", 0.0)), float(p.get("y", 0.0))))
		"request_snapshot":
			emit_event("game.snapshot", GameState.to_dict())

func pause_game() -> void:
	GameState.paused = true
	get_tree().paused = true
	emit_event("game.paused", {})

func resume_game() -> void:
	GameState.paused = false
	get_tree().paused = false
	emit_event("game.resumed", {})

func _apply_load_state(payload: Dictionary) -> void:
	var state_d = payload.get("state", payload)
	GameState.from_dict(state_d)
	var p = state_d.get("player_position", {})
	if p is Dictionary:
		_teleport_player(Vector2(float(p.get("x", 0.0)), float(p.get("y", 0.0))))
	emit_event("game.state_loaded", GameState.to_dict())

func _teleport_player(pos: Vector2) -> void:
	var player := get_tree().get_first_node_in_group("player")
	if player:
		player.global_position = pos
		emit_event("player.position.changed", {"x": pos.x, "y": pos.y})

func eval_js(code: String) -> void:
	if not _enabled:
		return
	if not ClassDB.class_exists("JavaScriptBridge"):
		return
	JavaScriptBridge.eval(code, true)