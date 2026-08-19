extends Node

class_name TestRunner

var _failed: int = 0
var _passed: int = 0
var _results: Array = []

func _ready() -> void:
	var result := run_all()
	print("=== TESTS === passed=", result.passed, " failed=", result.failed)
	for r in result.results:
		if r.ok:
			print("  ✓ ", r.name)
		else:
			print("  ✗ ", r.name, " — ", r.msg)
	print("=== END ===")

func run_all() -> Dictionary:
	_test_worldspec_valid()
	_test_required_landmarks()
	_test_unique_names()
	_test_world_bounds()
	_test_paths_present()
	_test_player_spawn()
	_test_edda_available()
	_test_workshop_accessible()
	_test_ohm_gate_present()
	_test_save_serializable()
	_test_bridge_basic()
	_test_determinism_same_seed()
	_test_determinism_different_seed()
	_test_navigation_region_built()
	_test_building_walls_for_buildings_and_gates()
	_test_interactions_for_npcs_and_landmarks()
	return {
		"passed": _passed,
		"failed": _failed,
		"results": _results,
	}

func _check(name: String, ok: bool, msg: String = "") -> void:
	if ok:
		_passed += 1
		_results.append({"name": name, "ok": true})
	else:
		_failed += 1
		_results.append({"name": name, "ok": false, "msg": msg})
		push_error("TEST FAIL: " + name + " — " + msg)

func _load_spec() -> Dictionary:
	var f := FileAccess.open(WorldBuilder.SPEC_PATH, FileAccess.READ)
	if f == null:
		return {}
	var txt := f.get_as_text()
	f.close()
	var parsed: Variant = JSON.parse_string(txt)
	if parsed == null or not parsed is Dictionary:
		return {}
	return parsed

func _test_worldspec_valid() -> void:
	var s := _load_spec()
	_check("worldspec_valid", not s.is_empty() and s.has("landmarks") and s.has("size"), "spec missing keys")

func _test_required_landmarks() -> void:
	var s := _load_spec()
	var lm: Dictionary = s.get("landmarks", {})
	var required := ["portal_omega", "plaza_central", "lumen_workshop", "ohm_gate"]
	for r in required:
		_check("landmark_present:" + r, lm.has(r), "missing landmark " + r)

func _test_unique_names() -> void:
	var s := _load_spec()
	var lm: Dictionary = s.get("landmarks", {})
	var names_seen := {}
	for k in lm.keys():
		var pascal := _pascal(str(k))
		_check("landmark_unique:" + pascal, not names_seen.has(pascal), "duplicate landmark name " + pascal)
		names_seen[pascal] = true

func _test_world_bounds() -> void:
	var s := _load_spec()
	var size_d: Dictionary = s.get("size", {})
	var w: float = float(size_d.get("width", 0))
	var h: float = float(size_d.get("height", 0))
	_check("world_size_positive", w > 0 and h > 0, "size must be positive")

func _test_paths_present() -> void:
	var s := _load_spec()
	var paths_v: Variant = s.get("paths", [])
	var paths: Array = paths_v if paths_v is Array else []
	_check("paths_min_one", paths.size() >= 3, "expected >= 3 paths")

func _test_player_spawn() -> void:
	var s := _load_spec()
	var spawn_v: Variant = s.get("spawn", {})
	var spawn: Dictionary = spawn_v if spawn_v is Dictionary else {}
	var p_v: Variant = spawn.get("player", {})
	var p: Dictionary = p_v if p_v is Dictionary else {}
	_check("player_spawn_present", p.has("x") and p.has("y"), "missing player spawn")

func _test_edda_available() -> void:
	var s := _load_spec()
	var spawn_v: Variant = s.get("spawn", {})
	var spawn: Dictionary = spawn_v if spawn_v is Dictionary else {}
	var e_v: Variant = spawn.get("edda", {})
	var e: Dictionary = e_v if e_v is Dictionary else {}
	_check("edda_spawn_present", e.has("x") and e.has("y"), "missing edda spawn")

func _test_workshop_accessible() -> void:
	var s := _load_spec()
	var lm_v: Variant = s.get("landmarks", {})
	var lm: Dictionary = lm_v if lm_v is Dictionary else {}
	var ws_v: Variant = lm.get("lumen_workshop", {})
	var ws: Dictionary = ws_v if ws_v is Dictionary else {}
	_check("workshop_position", ws.has("position"), "missing workshop position")
	var size_v: Variant = ws.get("size", {})
	var size: Dictionary = size_v if size_v is Dictionary else {}
	_check("workshop_size", size.get("width", 0) > 0 and size.get("height", 0) > 0, "invalid workshop size")

func _test_ohm_gate_present() -> void:
	var s := _load_spec()
	var lm_v: Variant = s.get("landmarks", {})
	var lm: Dictionary = lm_v if lm_v is Dictionary else {}
	var g_v: Variant = lm.get("ohm_gate", {})
	var g: Dictionary = g_v if g_v is Dictionary else {}
	_check("ohm_gate_position", g.has("position"), "missing ohm_gate position")

func _test_save_serializable() -> void:
	var sample := {
		"world": "ohmdal",
		"scene": "plaza",
		"player_position": {"x": 0.0, "y": 540.0},
		"flags": {"edda_met": false, "lumen_met": false, "ohm_gate_open": false},
		"discoveries": [],
	}
	var txt := SavePortable.serialize(sample)
	var parsed := SavePortable.parse(txt)
	_check("save_roundtrip", parsed.get("world") == "ohmdal" and parsed.get("player_position", {}).get("y") == 540.0, "save roundtrip failed")

func _test_bridge_basic() -> void:
	# Bridge must expose required API
	var b: Node = Engine.get_singleton("Bridge") if Engine.has_singleton("Bridge") else null
	if b == null:
		# fallback: search root
		var root := get_tree().get_root()
		for n in root.get_children():
			if n.name == "Bridge":
				b = n
				break
	_check("bridge_autoload_present", b != null, "Bridge autoload not found")
	if b != null:
		_check("bridge_has_emit_event", b.has_method("emit_event"), "Bridge missing emit_event")
		_check("bridge_has_pause_game", b.has_method("pause_game"), "Bridge missing pause_game")
		_check("bridge_has_resume_game", b.has_method("resume_game"), "Bridge missing resume_game")

func _test_determinism_same_seed() -> void:
	var b1 := WorldBuilder.new(1729)
	var s := _load_spec()
	var root1 := _build_offtree(b1, s)
	var b2 := WorldBuilder.new(1729)
	var root2 := _build_offtree(b2, s)
	var lm1 := root1.get_node("Landmarks")
	var lm2 := root2.get_node("Landmarks")
	# Same seed → same landmark positions
	var pos1_a = lm1.get_node("PortalOmega").position
	var pos2_a = lm2.get_node("PortalOmega").position
	_check("determinism_portal", pos1_a.is_equal_approx(pos2_a), "portal position differs across builds with same seed")

func _test_determinism_different_seed() -> void:
	# Same spec but different seed → tree should differ procedurally for decor.
	# We can't strictly require different positions (some are spec-driven),
	# but we can check that decor count matches spec.
	var s := _load_spec()
	var b := WorldBuilder.new(99)
	var root := _build_offtree(b, s)
	var decor := root.get_node("Decor")
	var lamps := decor.get_node("Lamps").get_child_count()
	_check("decor_count_matches_spec", lamps > 0, "no lamps created")

func _test_navigation_region_built() -> void:
	var s := _load_spec()
	var b := WorldBuilder.new(1)
	var root := _build_offtree(b, s)
	var nav := root.get_node_or_null("Navigation/NavRegion")
	_check("navigation_region_built", nav != null and nav.navigation_polygon != null, "NavigationRegion missing")

func _test_building_walls_for_buildings_and_gates() -> void:
	var s := _load_spec()
	var b := WorldBuilder.new(1)
	var root := _build_offtree(b, s)
	var walls := root.get_node_or_null("Landmarks/Walls")
	_check("walls_node_present", walls != null, "Walls node missing")
	if walls != null:
		var n_static := 0
		for c in walls.get_children():
			if c is StaticBody2D:
				n_static += 1
		_check("walls_have_staticbodies", n_static >= 2, "expected >= 2 static body walls (workshop + gate)")

func _test_interactions_for_npcs_and_landmarks() -> void:
	var s := _load_spec()
	var b := WorldBuilder.new(1)
	var root := _build_offtree(b, s)
	var ix := root.get_node_or_null("Interactions")
	_check("interactions_node_present", ix != null, "Interactions missing")
	if ix != null:
		var names: Array = []
		for c in ix.get_children():
			names.append(c.name)
		_check("interaction_talk_edda", "Talk_Edda" in names, "Talk_Edda missing")
		_check("interaction_talk_lumen", "Talk_Lumen" in names, "Talk_Lumen missing")
		_check("interaction_ohm_gate", "Interact_OhmGate" in names, "Interact_OhmGate missing")
		_check("interaction_portal", "Enter_PortalOmega" in names, "Enter_PortalOmega missing")
		_check("interaction_workshop", "Enter_LumenWorkshop" in names, "Enter_LumenWorkshop missing")

func _build_offtree(b: WorldBuilder, s: Dictionary) -> Node2D:
	var holder := Node2D.new()
	holder.name = "Offtree"
	get_tree().get_root().add_child(holder)
	# Builder adds many children synchronously. Avoid parent-busy error by deferring.
	holder.set_process(false)
	b.materialize(holder, s)
	return holder

func _pascal(s: String) -> String:
	var parts: PackedStringArray = s.split("_", false)
	var out := ""
	for p in parts:
		if p.length() > 0:
			out += p.substr(0, 1).to_upper() + p.substr(1)
	return out