extends Node

class_name SavePortable

const SAVE_VERSION := 1

static func serialize(state: Dictionary) -> String:
	var payload := {
		"version": SAVE_VERSION,
		"world": state.get("world", "ohmdal"),
		"scene": state.get("scene", "plaza"),
		"player": state.get("player_position", {"x": 0, "y": 0}),
		"flags": state.get("flags", {}),
		"discoveries": state.get("discoveries", []),
	}
	return JSON.stringify(payload)

static func parse(text: String) -> Dictionary:
	var parsed: Variant = JSON.parse_string(text)
	if parsed == null or not parsed is Dictionary:
		return {}
	var d: Dictionary = parsed
	var player_d = d.get("player", {})
	if not (player_d is Dictionary):
		player_d = {"x": 0, "y": 0}
	return {
		"world": str(d.get("world", "ohmdal")),
		"scene": str(d.get("scene", "plaza")),
		"player_position": {"x": float(player_d.get("x", 0.0)), "y": float(player_d.get("y", 0.0))},
		"flags": d.get("flags", {}),
		"discoveries": d.get("discoveries", []),
	}

static func save_to_disk(state: Dictionary) -> bool:
	var text := serialize(state)
	var path := "user://ohmdal_save.json"
	var f := FileAccess.open(path, FileAccess.WRITE)
	if f == null:
		return false
	f.store_string(text)
	f.close()
	return true

static func load_from_disk() -> Dictionary:
	var path := "user://ohmdal_save.json"
	if not FileAccess.file_exists(path):
		return {}
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		return {}
	var text := f.get_as_text()
	f.close()
	return parse(text)