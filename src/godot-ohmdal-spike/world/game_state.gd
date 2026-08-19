extends Node

var flags: Dictionary = {}
var discoveries: Array = []
var current_world: String = "ohmdal"
var current_scene: String = "plaza"
var player_position: Vector2 = Vector2.ZERO
var paused: bool = false

signal flag_changed(flag_name: String, value)
signal discovery_unlocked(discovery_id: String, label: String)

func _ready() -> void:
	reset()

func reset() -> void:
	flags = {
		"edda_met": false,
		"lumen_met": false,
		"ohm_gate_open": false,
		"ohmdal_current_basic": false,
		"lumen_interior_visited": false,
	}
	discoveries = []
	paused = false

func set_flag(name: String, value: bool) -> void:
	flags[name] = value
	flag_changed.emit(name, value)
	if name == "edda_met" and value and not has_discovery("electric_current"):
		unlock_discovery("electric_current", "Corriente eléctrica")

func has_flag(name: String) -> bool:
	return bool(flags.get(name, false))

func has_discovery(id: String) -> bool:
	for d in discoveries:
		if str(d.get("id", "")) == id:
			return true
	return false

func unlock_discovery(id: String, label: String) -> void:
	if has_discovery(id):
		return
	discoveries.append({"id": id, "label": label})
	discovery_unlocked.emit(id, label)

func to_dict() -> Dictionary:
	return {
		"world": current_world,
		"scene": current_scene,
		"player_position": {"x": player_position.x, "y": player_position.y},
		"flags": flags.duplicate(true),
		"discoveries": discoveries.duplicate(true),
	}

func from_dict(d: Dictionary) -> void:
	reset()
	if d == null:
		return
	current_world = str(d.get("world", current_world))
	current_scene = str(d.get("scene", current_scene))
	var p = d.get("player_position", {})
	if p is Dictionary:
		player_position = Vector2(float(p.get("x", 0.0)), float(p.get("y", 0.0)))
	var f = d.get("flags", {})
	if f is Dictionary:
		for k in f.keys():
			flags[str(k)] = bool(f[k])
	var ds = d.get("discoveries", [])
	if ds is Array:
		discoveries = []
		for entry in ds:
			discoveries.append(entry)