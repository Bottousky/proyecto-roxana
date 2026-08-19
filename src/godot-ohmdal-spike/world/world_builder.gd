extends Node

class_name WorldBuilder

const SPEC_PATH := "res://world/ohmdal_plaza.world.json"

var spec: Dictionary = {}
var rng: RandomNumberGenerator
var _id_seed_used: int = 0

func _init(seed_value: int = -1) -> void:
	if seed_value < 0:
		seed_value = 1729
	rng = RandomNumberGenerator.new()
	rng.seed = seed_value

func load_spec(path: String = SPEC_PATH) -> Dictionary:
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		push_error("WorldSpec not found: " + path)
		return {}
	var txt := f.get_as_text()
	f.close()
	var parsed: Variant = JSON.parse_string(txt)
	if parsed == null or not parsed is Dictionary:
		push_error("WorldSpec parse error: " + path)
		return {}
	spec = parsed as Dictionary
	_seed_from_spec()
	return spec

func _seed_from_spec() -> void:
	var s_v: Variant = spec.get("seed", 1729)
	var s := int(s_v)
	if rng == null:
		rng = RandomNumberGenerator.new()
	rng.seed = s
	_id_seed_used = s

func get_seed() -> int:
	return _id_seed_used

func materialize(parent: Node2D, spec_override: Dictionary = {}) -> Node2D:
	var s: Dictionary = spec_override if not spec_override.is_empty() else spec
	if s.is_empty():
		s = load_spec()
	if parent == null:
		push_error("WorldBuilder.materialize: parent is null")
		return null
	_clear_world_children(parent)

	var env: Node2D = _make_node2d("Environment", parent)
	var lm: Node2D = _make_node2d("Landmarks", parent)
	var decor: Node2D = _make_node2d("Decor", parent)
	var chars: Node2D = _make_node2d("Characters", parent)
	var ix: Node2D = _make_node2d("Interactions", parent)
	var nav: Node2D = _make_node2d("Navigation", parent)

	_build_ground(env, s)
	_build_zones(env, s)
	_build_paths(env, s)
	_build_landmarks(lm, s)
	_build_decor(decor, env, s)
	_build_npcs(chars, s)
	_build_interactions(ix, lm, chars, s)
	_build_navigation(nav, lm, env, s)

	return parent

func _clear_world_children(parent: Node2D) -> void:
	var keep := PackedStringArray(["Player", "Camera", "WorldRoot"])
	for c in parent.get_children():
		if c.name in keep:
			continue
		c.queue_free()

func _make_node2d(n_name: String, parent: Node) -> Node2D:
	var n := Node2D.new()
	n.name = StringName(n_name)
	parent.add_child(n)
	return n

func _build_ground(env: Node2D, s: Dictionary) -> void:
	var size_d_v: Variant = s.get("size", {})
	var size_d: Dictionary = size_d_v if size_d_v is Dictionary else {}
	var ground_color: Color = WorldKit.to_color(size_d.get("ground_color", "#9bc6a3"))
	var border_color: Color = WorldKit.to_color(size_d.get("ground_border_color", "#5e8a6b"))
	var ground_size: Vector2 = WorldKit.size_from_dict(size_d)
	var g_script = preload("res://worldkit/world_kit_ground.gd")
	var g = g_script.new()
	g.name = "Ground"
	g.set_data(ground_size, ground_color, border_color)
	env.add_child(g)
	WorldKit.tag(g, WorldKit.TAG_GROUND)

func _build_zones(env: Node2D, s: Dictionary) -> void:
	var zones_v: Variant = s.get("zones", [])
	var zones: Array = zones_v if zones_v is Array else []
	var holder: Node2D = _make_node2d("Zones", env)
	WorldKit.tag(holder, "zones")
	var world_size: Vector2 = _world_size(s)
	for z_v in zones:
		var z: Dictionary = z_v
		var z_id: String = str(z.get("id", "zone"))
		var z_kind: String = str(z.get("kind", "approach"))
		var bounds_v: Variant = z.get("bounds", {})
		var bounds: Dictionary = bounds_v if bounds_v is Dictionary else {}
		var z_size: Vector2 = WorldKit.size_from_dict(bounds)
		var z_pos: Vector2 = WorldKit.from_dict(bounds)
		var zone_script = preload("res://worldkit/world_kit_zone.gd")
		var n = zone_script.new()
		n.name = StringName(z_id)
		n.position = z_pos + z_size * 0.5 - world_size * 0.5
		var c_fill: Color = _zone_color_for(z_kind)
		var c_border: Color = _zone_border_color_for(z_kind)
		n.set_data(z_size, c_fill, c_border, z_id)
		holder.add_child(n)
		WorldKit.tag(n, WorldKit.TAG_ZONE)
		_add_zone_meta(n, z)

func _world_size(s: Dictionary) -> Vector2:
	var size_v: Variant = s.get("size", {})
	var size_d: Dictionary = size_v if size_v is Dictionary else {}
	return WorldKit.size_from_dict(size_d)

func _zone_color_for(kind: String) -> Color:
	match kind:
		"approach":
			return Color(0.6, 0.75, 0.55, 0.18)
		"garden":
			return Color(0.45, 0.7, 0.5, 0.22)
		"yard":
			return Color(0.85, 0.78, 0.55, 0.18)
		"plaza":
			return Color(0.85, 0.75, 0.55, 0.18)
		_:
			return Color(0.6, 0.6, 0.6, 0.15)

func _zone_border_color_for(kind: String) -> Color:
	match kind:
		"approach":
			return Color(0.35, 0.55, 0.35, 0.6)
		"garden":
			return Color(0.25, 0.5, 0.3, 0.6)
		"yard":
			return Color(0.6, 0.5, 0.25, 0.6)
		"plaza":
			return Color(0.6, 0.5, 0.25, 0.6)
		_:
			return Color(0.4, 0.4, 0.4, 0.6)

func _add_zone_meta(n: Node, zd: Dictionary) -> void:
	n.set_meta("zone_kind", str(zd.get("kind", "")))
	n.set_meta("zone_tags", str(zd.get("tags", [])))
	n.set_meta("zone_id", str(zd.get("id", "")))

func _build_paths(env: Node2D, s: Dictionary) -> void:
	var paths_v: Variant = s.get("paths", [])
	var paths: Array = paths_v if paths_v is Array else []
	var holder: Node2D = _make_node2d("Paths", env)
	WorldKit.tag(holder, "paths")
	for p_v in paths:
		var p: Dictionary = p_v
		var pid: String = str(p.get("id", "path"))
		var width: float = float(p.get("width", 100.0))
		var fill_color: Color = WorldKit.to_color(p.get("color", "#c4ad7b"))
		var border_color: Color = fill_color.darkened(0.2)
		var waypoints: PackedVector2Array = _path_waypoints(p, s)
		var path_script = preload("res://worldkit/world_kit_path.gd")
		var n = path_script.new()
		n.name = StringName(pid)
		n.set_data(waypoints, width, fill_color, border_color)
		holder.add_child(n)
		WorldKit.tag(n, WorldKit.TAG_PATH)
		n.set_meta("path_id", pid)
		n.set_meta("path_kind", str(p.get("kind", "axis")))

func _path_waypoints(p: Dictionary, s: Dictionary) -> PackedVector2Array:
	var pts := PackedVector2Array()
	var via_v: Variant = p.get("via", [])
	var via: Array = via_v if via_v is Array else []
	for v in via:
		pts.append(WorldKit.from_dict(v))
	if pts.size() < 2:
		var from_id: String = str(p.get("from", ""))
		var to_id: String = str(p.get("to", ""))
		var lm_v: Variant = s.get("landmarks", {})
		var landmarks: Dictionary = lm_v if lm_v is Dictionary else {}
		var from_lm_v: Variant = landmarks.get(from_id, {})
		var to_lm_v: Variant = landmarks.get(to_id, {})
		var from_pos: Vector2 = WorldKit.from_dict((from_lm_v as Dictionary).get("position", {}))
		var to_pos: Vector2 = WorldKit.from_dict((to_lm_v as Dictionary).get("position", {}))
		pts = PackedVector2Array([from_pos, to_pos])
	return pts

func _build_landmarks(lm: Node2D, s: Dictionary) -> void:
	var lm_v: Variant = s.get("landmarks", {})
	var landmarks: Dictionary = lm_v if lm_v is Dictionary else {}
	for key_v in landmarks.keys():
		var key: String = str(key_v)
		var ld: Dictionary = landmarks[key]
		var kind: String = str(ld.get("kind", "landmark"))
		var lname: String = str(ld.get("name", key))
		var pos: Vector2 = WorldKit.from_dict(ld.get("position", {}))
		var size: Vector2 = WorldKit.size_from_dict(ld.get("size", {}))
		var n: Node2D
		if kind == "plaza":
			var plaza_script = preload("res://worldkit/world_kit_plaza.gd")
			n = plaza_script.new()
			var fill: Color = WorldKit.to_color(ld.get("color", "#d9c79a"))
			var border: Color = WorldKit.to_color(ld.get("border_color", "#9b8657"))
			n.set_data(size, fill, border)
			n.name = StringName(_to_pascal(key))
			lm.add_child(n)
		elif kind == "building":
			var inst: Node = load("res://landmarks/lumen_workshop.tscn").instantiate()
			n = inst as Node2D
			n.name = StringName(_to_pascal(key))
			n.position = pos
			lm.add_child(n)
		elif kind == "portal":
			var inst: Node = load("res://landmarks/portal_omega.tscn").instantiate()
			n = inst as Node2D
			n.name = StringName(_to_pascal(key))
			n.position = pos
			lm.add_child(n)
		elif kind == "gate":
			var inst: Node = load("res://landmarks/ohm_gate.tscn").instantiate()
			n = inst as Node2D
			n.name = StringName(_to_pascal(key))
			n.position = pos
			lm.add_child(n)
		elif kind == "npc_marker":
			continue
		else:
			var lm_script = preload("res://worldkit/world_kit_landmark.gd")
			n = lm_script.new()
			var fill: Color = WorldKit.to_color(ld.get("color", "#aaaaaa"))
			var accent: Color = WorldKit.to_color(ld.get("glow_color", "#ffffff"))
			n.set_data(key, lname, fill, accent, size)
			n.name = StringName(_to_pascal(key))
			lm.add_child(n)
		n.position = pos
		WorldKit.tag(n, WorldKit.TAG_LANDMARK)
		n.set_meta("landmark_id", key)
		n.set_meta("landmark_name", lname)
		n.set_meta("landmark_kind", kind)
		n.set_meta("landmark_tags", str(ld.get("tags", [])))
		n.set_meta("landmark_size", size)
		if kind == "building" or kind == "gate":
			_add_building_walls(lm, pos, size, kind)

func _add_building_walls(lm: Node2D, pos: Vector2, size: Vector2, kind: String) -> void:
	var walls_v: Node = lm.get_node_or_null("Walls")
	var walls: Node2D
	if walls_v == null:
		walls = _make_node2d("Walls", lm)
		walls.set_meta("nav_blockers", true)
	else:
		walls = walls_v as Node2D
	var wall_body := StaticBody2D.new()
	wall_body.name = StringName(_to_pascal(kind) + "_wall_" + str(int(pos.x)) + "_" + str(int(pos.y)))
	wall_body.position = pos
	var hw: float = size.x * 0.5
	var hh: float = size.y * 0.5
	var t: float = 8.0
	# Top
	var seg_top := CollisionShape2D.new()
	var rs_top := RectangleShape2D.new()
	rs_top.size = Vector2(size.x + t, t)
	seg_top.shape = rs_top
	seg_top.position = Vector2(0, -hh - t * 0.5)
	wall_body.add_child(seg_top)
	# Bottom split
	var ehalf: float = size.x * 0.18
	for sx_v in [-1, 1]:
		var sx: int = sx_v
		var seg := CollisionShape2D.new()
		var rs := RectangleShape2D.new()
		rs.size = Vector2((size.x - ehalf * 2.0) * 0.5, t)
		seg.shape = rs
		seg.position = Vector2(sx * (size.x * 0.25 + ehalf * 0.5), hh + t * 0.5)
		wall_body.add_child(seg)
	# Left
	var seg_l := CollisionShape2D.new()
	var rs_l := RectangleShape2D.new()
	rs_l.size = Vector2(t, size.y + t)
	seg_l.shape = rs_l
	seg_l.position = Vector2(-hw - t * 0.5, 0)
	wall_body.add_child(seg_l)
	# Right
	var seg_r := CollisionShape2D.new()
	var rs_r := RectangleShape2D.new()
	rs_r.size = Vector2(t, size.y + t)
	seg_r.shape = rs_r
	seg_r.position = Vector2(hw + t * 0.5, 0)
	wall_body.add_child(seg_r)
	walls.add_child(wall_body)

func _to_pascal(s: String) -> String:
	var parts: PackedStringArray = s.split("_", false)
	var out := ""
	for p in parts:
		if p.length() > 0:
			out += p.substr(0, 1).to_upper() + p.substr(1)
	return out

func _build_decor(decor: Node2D, env: Node2D, s: Dictionary) -> void:
	var d_v: Variant = s.get("decor", {})
	var d: Dictionary = d_v if d_v is Dictionary else {}
	var lamp_count: int = int(d.get("lamp_count", 12))
	var bench_count: int = int(d.get("bench_count", 6))
	var tree_count: int = int(d.get("tree_count", 18))
	var sign_count: int = int(d.get("sign_count", 3))
	var fence_count: int = int(d.get("fence_count", 4))
	var lamp_color: Color = WorldKit.to_color(d.get("lamp_color", "#fff1b8"))
	var bench_color: Color = WorldKit.to_color(d.get("bench_color", "#8a6a4b"))
	var tree_color_dark: Color = WorldKit.to_color(d.get("tree_color_dark", "#3f6a45"))
	var tree_color_light: Color = WorldKit.to_color(d.get("tree_color_light", "#5d8a55"))
	var zones_v: Variant = s.get("zones", [])
	var zones: Array = zones_v if zones_v is Array else []
	_distribute_along_paths(decor, "Lamps", "lamp", lamp_count, 26.0, lamp_color, Color(1, 1, 0.8))
	for z_v in zones:
		var z: Dictionary = z_v
		if str(z.get("kind", "")) != "garden":
			continue
		var zid: String = str(z.get("id", ""))
		var b_v: Variant = z.get("bounds", {})
		var b: Dictionary = b_v if b_v is Dictionary else {}
		var z_pos: Vector2 = WorldKit.from_dict(b)
		var z_size: Vector2 = WorldKit.size_from_dict(b)
		var zone_h: Node2D = _make_node2d("Garden_" + zid, decor)
		WorldKit.tag(zone_h, WorldKit.TAG_DECOR)
		var n_trees: int = maxi(3, int(tree_count * 0.4))
		for i in n_trees:
			var prop_script = preload("res://worldkit/world_kit_prop.gd")
			var t = prop_script.new()
			t.name = StringName("Tree_" + str(i))
			var rx: float = rng.randf_range(8.0, z_size.x - 8.0)
			var ry: float = rng.randf_range(8.0, z_size.y - 8.0)
			t.position = z_pos + Vector2(rx, ry)
			var pal: Color = tree_color_dark if rng.randf() < 0.5 else tree_color_light
			t.set_data("tree", pal, pal.lightened(0.2), 1.0)
			zone_h.add_child(t)
	_distribute_trees_along_plaza(decor, s, tree_count * 0.3)
	var plaza_pos: Vector2 = _plaza_pos(s)
	var plaza_size: Vector2 = _plaza_size(s)
	var benches: Node2D = _make_node2d("Benches", decor)
	WorldKit.tag(benches, WorldKit.TAG_DECOR)
	for i in bench_count:
		var prop_script = preload("res://worldkit/world_kit_prop.gd")
		var t = prop_script.new()
		t.name = StringName("Bench_" + str(i))
		var angle: float = (TAU / float(bench_count)) * i
		var r: float = min(plaza_size.x, plaza_size.y) * 0.42
		t.position = plaza_pos + Vector2(cos(angle), sin(angle)) * r
		t.set_data("bench", bench_color, Color(0.5, 0.4, 0.25), 1.0)
		benches.add_child(t)
	var signs: Node2D = _make_node2d("Signs", decor)
	WorldKit.tag(signs, WorldKit.TAG_DECOR)
	for i in sign_count:
		var prop_script = preload("res://worldkit/world_kit_prop.gd")
		var t = prop_script.new()
		t.name = StringName("Sign_" + str(i))
		var ang2: float = (TAU / float(sign_count)) * i
		var r2: float = min(plaza_size.x, plaza_size.y) * 0.5 + 80
		t.position = plaza_pos + Vector2(cos(ang2), sin(ang2)) * r2
		t.set_data("sign", Color(0.85, 0.8, 0.55), Color(0.4, 0.3, 0.1), 1.0)
		signs.add_child(t)
	var fences: Node2D = _make_node2d("Fences", decor)
	WorldKit.tag(fences, WorldKit.TAG_DECOR)
	for i in fence_count:
		var prop_script = preload("res://worldkit/world_kit_prop.gd")
		var t = prop_script.new()
		t.name = StringName("Fence_" + str(i))
		var zone_idx: int = i % max(1, zones.size())
		var zf: Dictionary = zones[zone_idx] if zones.size() > 0 else {}
		var bf_v: Variant = zf.get("bounds", {})
		var bf: Dictionary = bf_v if bf_v is Dictionary else {}
		var zpos_f: Vector2 = WorldKit.from_dict(bf)
		var zsize_f: Vector2 = WorldKit.size_from_dict(bf)
		var fx: float = zpos_f.x + rng.randf_range(0.0, max(1.0, zsize_f.x))
		var fy: float = zpos_f.y + (zsize_f.y if (i % 2 == 0) else 0.0)
		t.position = Vector2(fx, fy)
		t.set_data("fence", Color(0.7, 0.55, 0.4), Color(0.5, 0.4, 0.3), 1.0)
		fences.add_child(t)

func _plaza_pos(s: Dictionary) -> Vector2:
	var lm_v: Variant = s.get("landmarks", {})
	var lm: Dictionary = lm_v if lm_v is Dictionary else {}
	var pl_v: Variant = lm.get("plaza_central", {})
	var pl: Dictionary = pl_v if pl_v is Dictionary else {}
	return WorldKit.from_dict(pl.get("position", {}))

func _plaza_size(s: Dictionary) -> Vector2:
	var lm_v: Variant = s.get("landmarks", {})
	var lm: Dictionary = lm_v if lm_v is Dictionary else {}
	var pl_v: Variant = lm.get("plaza_central", {})
	var pl: Dictionary = pl_v if pl_v is Dictionary else {}
	return WorldKit.size_from_dict(pl.get("size", {}))

func _distribute_along_paths(decor: Node2D, holder_name: String, kind: String, count: int, spacing: float, color: Color, accent: Color) -> void:
	var holder: Node2D = _make_node2d(holder_name, decor)
	WorldKit.tag(holder, WorldKit.TAG_DECOR)
	var idx: int = 0
	var paths_v: Node = decor.get_parent().get_node_or_null("Environment/Paths")
	if paths_v == null:
		return
	var paths: Node2D = paths_v as Node2D
	for p in paths.get_children():
		if not (p is Node2D):
			continue
		var p2 := p as Node2D
		var pts_v: Variant = p2.get("waypoints")
		if not (pts_v is PackedVector2Array):
			continue
		var pts: PackedVector2Array = pts_v
		if pts.size() < 2:
			continue
		var length: float = 0.0
		for i in range(pts.size() - 1):
			length += pts[i].distance_to(pts[i + 1])
		var n: int = maxi(2, int(length / spacing))
		for i in n:
			var t: float = (float(i) / float(max(1, n - 1))) if n > 1 else 0.5
			var pos: Vector2 = _interp(pts, t)
			var prop_script = preload("res://worldkit/world_kit_prop.gd")
			var prop = prop_script.new()
			prop.name = StringName(kind.capitalize() + "_" + str(idx))
			prop.position = pos + Vector2(rng.randf_range(-12, 12), rng.randf_range(-12, 12))
			prop.set_data(kind, color, accent, 1.0)
			holder.add_child(prop)
			idx += 1

func _interp(pts: PackedVector2Array, t: float) -> Vector2:
	if pts.size() == 1:
		return pts[0]
	var total: float = 0.0
	var lens := PackedFloat32Array()
	for i in range(pts.size() - 1):
		var l: float = pts[i].distance_to(pts[i + 1])
		lens.append(l)
		total += l
	var target: float = clamp(t, 0.0, 1.0) * total
	var acc: float = 0.0
	for i in range(pts.size() - 1):
		if acc + lens[i] >= target:
			var local_t: float = (target - acc) / max(0.001, lens[i])
			return pts[i].lerp(pts[i + 1], local_t)
		acc += lens[i]
	return pts[pts.size() - 1]

func _distribute_trees_along_plaza(decor: Node2D, s: Dictionary, count: float) -> void:
	var holder: Node2D = _make_node2d("PlazaTrees", decor)
	WorldKit.tag(holder, WorldKit.TAG_DECOR)
	var plaza_pos: Vector2 = _plaza_pos(s)
	var plaza_size: Vector2 = _plaza_size(s)
	for i in int(count):
		var prop_script = preload("res://worldkit/world_kit_prop.gd")
		var t = prop_script.new()
		t.name = StringName("PlazaTree_" + str(i))
		var side: int = i % 4
		var pos: Vector2 = plaza_pos
		match side:
			0: pos = plaza_pos + Vector2(-plaza_size.x * 0.5 + 18, -plaza_size.y * 0.5 + 18 + (i * 24) % int(plaza_size.y - 36))
			1: pos = plaza_pos + Vector2( plaza_size.x * 0.5 - 18, -plaza_size.y * 0.5 + 18 + (i * 24) % int(plaza_size.y - 36))
			2: pos = plaza_pos + Vector2(-plaza_size.x * 0.5 + 18 + (i * 24) % int(plaza_size.x - 36), -plaza_size.y * 0.5 + 18)
			3: pos = plaza_pos + Vector2(-plaza_size.x * 0.5 + 18 + (i * 24) % int(plaza_size.x - 36),  plaza_size.y * 0.5 - 18)
		t.position = pos
		var pal: Color = Color("#3f6a45") if rng.randf() < 0.5 else Color("#5d8a55")
		t.set_data("tree", pal, pal.lightened(0.2), 1.0)
		holder.add_child(t)

func _build_npcs(chars: Node2D, s: Dictionary) -> void:
	var spawn_v: Variant = s.get("spawn", {})
	var spawn: Dictionary = spawn_v if spawn_v is Dictionary else {}
	var edda_p_v: Variant = spawn.get("edda", {"x": 0, "y": 280})
	var edda_p: Dictionary = edda_p_v if edda_p_v is Dictionary else {"x": 0, "y": 280}
	var edda_pos: Vector2 = WorldKit.from_dict(edda_p)
	var edda_inst_v: Node = load("res://landmarks/edda.tscn").instantiate()
	var edda_inst: Node2D = edda_inst_v as Node2D
	edda_inst.name = "Edda"
	edda_inst.position = edda_pos
	chars.add_child(edda_inst)
	WorldKit.tag(edda_inst, WorldKit.TAG_NPC)
	edda_inst.set_meta("npc_id", "edda")

	var lumen_p_v: Variant = spawn.get("lumen", {"x": 580, "y": 30})
	var lumen_p: Dictionary = lumen_p_v if lumen_p_v is Dictionary else {"x": 580, "y": 30}
	var lumen_pos: Vector2 = WorldKit.from_dict(lumen_p)
	var lumen_inst_v: Node = load("res://landmarks/lumen.tscn").instantiate()
	var lumen_inst: Node2D = lumen_inst_v as Node2D
	lumen_inst.name = "Lumen"
	lumen_inst.position = lumen_pos
	chars.add_child(lumen_inst)
	WorldKit.tag(lumen_inst, WorldKit.TAG_NPC)
	lumen_inst.set_meta("npc_id", "lumen")

func _build_interactions(ix: Node2D, lm: Node2D, chars: Node2D, s: Dictionary) -> void:
	var edda_v: Node = chars.get_node_or_null("Edda")
	if edda_v != null:
		var edda_n: Node2D = edda_v as Node2D
		var ix_script = preload("res://worldkit/world_kit_interaction.gd")
		var ix_e = ix_script.new()
		ix_e.name = "Talk_Edda"
		ix_e.interaction_id = "talk_edda"
		ix_e.radius = 80.0
		ix_e.one_shot = false
		ix_e.position = edda_n.position
		ix.add_child(ix_e)
		WorldKit.tag(ix_e, "interaction")
	var lumen_v: Node = chars.get_node_or_null("Lumen")
	if lumen_v != null:
		var lumen_n: Node2D = lumen_v as Node2D
		var ix_script = preload("res://worldkit/world_kit_interaction.gd")
		var ix_l = ix_script.new()
		ix_l.name = "Talk_Lumen"
		ix_l.interaction_id = "talk_lumen"
		ix_l.radius = 80.0
		ix_l.one_shot = false
		ix_l.position = lumen_n.position
		ix.add_child(ix_l)
		WorldKit.tag(ix_l, "interaction")
	var portal_v: Node = lm.get_node_or_null("PortalOmega")
	if portal_v != null:
		var portal: Node2D = portal_v as Node2D
		var ix_script = preload("res://worldkit/world_kit_interaction.gd")
		var ix_p = ix_script.new()
		ix_p.name = "Enter_PortalOmega"
		ix_p.interaction_id = "enter_portal"
		ix_p.radius = 70.0
		ix_p.position = portal.position
		ix.add_child(ix_p)
		WorldKit.tag(ix_p, "interaction")
	var gate_v: Node = lm.get_node_or_null("OhmGate")
	if gate_v != null:
		var gate: Node2D = gate_v as Node2D
		var ix_script = preload("res://worldkit/world_kit_interaction.gd")
		var ix_g = ix_script.new()
		ix_g.name = "Interact_OhmGate"
		ix_g.interaction_id = "ohm_gate"
		ix_g.radius = 100.0
		ix_g.position = gate.position
		ix.add_child(ix_g)
		WorldKit.tag(ix_g, "interaction")
	var workshop_v: Node = lm.get_node_or_null("LumenWorkshop")
	if workshop_v != null:
		var lm_v: Variant = s.get("landmarks", {})
		var lm_dict: Dictionary = lm_v if lm_v is Dictionary else {}
		var ws_v: Variant = lm_dict.get("lumen_workshop", {})
		var ws: Dictionary = ws_v if ws_v is Dictionary else {}
		var w_pos: Vector2 = WorldKit.from_dict(ws.get("position", {}))
		var w_size: Vector2 = WorldKit.size_from_dict(ws.get("size", {}))
		var ix_script = preload("res://worldkit/world_kit_interaction.gd")
		var ix_w = ix_script.new()
		ix_w.name = "Enter_LumenWorkshop"
		ix_w.interaction_id = "enter_lumen_workshop"
		ix_w.radius = 70.0
		ix_w.position = w_pos + Vector2(0, w_size.y * 0.5 + 16)
		ix.add_child(ix_w)
		WorldKit.tag(ix_w, "interaction")

func _build_navigation(nav: Node2D, lm: Node2D, env: Node2D, s: Dictionary) -> void:
	var walls_v: Node = lm.get_node_or_null("Walls")
	var nav_region := NavigationRegion2D.new()
	nav_region.name = "NavRegion"
	var nav_poly := NavigationPolygon.new()
	var size_d_v: Variant = s.get("size", {})
	var size_d: Dictionary = size_d_v if size_d_v is Dictionary else {}
	var w: float = float(size_d.get("width", 1600))
	var h: float = float(size_d.get("height", 1200))
	var outline := PackedVector2Array([
		Vector2(-w * 0.5, -h * 0.5),
		Vector2( w * 0.5, -h * 0.5),
		Vector2( w * 0.5,  h * 0.5),
		Vector2(-w * 0.5,  h * 0.5),
	])
	nav_poly.add_outline(outline)
	if walls_v != null:
		var walls: Node2D = walls_v as Node2D
		for w_node_v in walls.get_children():
			var w_node: Node = w_node_v
			if not (w_node is StaticBody2D):
				continue
			var sb: StaticBody2D = w_node
			var p: Vector2 = sb.position
			var bbx: Vector2 = _estimate_wall_bbox(sb)
			var inset: float = -4.0
			var hole := PackedVector2Array([
				p + Vector2(-bbx.x * 0.5 + inset, -bbx.y * 0.5 + inset),
				p + Vector2( bbx.x * 0.5 - inset, -bbx.y * 0.5 + inset),
				p + Vector2( bbx.x * 0.5 - inset,  bbx.y * 0.5 - inset),
				p + Vector2(-bbx.x * 0.5 + inset,  bbx.y * 0.5 - inset),
			])
			nav_poly.add_outline(hole)
	nav_region.navigation_polygon = nav_poly
	nav.add_child(nav_region)

func _estimate_wall_bbox(wall: StaticBody2D) -> Vector2:
	var maxx: float = 0.0
	var maxy: float = 0.0
	for c in wall.get_children():
		if not (c is CollisionShape2D):
			continue
		var cs: CollisionShape2D = c
		var shp: Shape2D = cs.shape
		if shp is RectangleShape2D:
			var rs: RectangleShape2D = shp
			var s: Vector2 = rs.size
			var cp: Vector2 = cs.position
			var half: Vector2 = Vector2(absf(s.x * 0.5) + absf(cp.x), absf(s.y * 0.5) + absf(cp.y))
			if half.x * 2.0 > maxx:
				maxx = half.x * 2.0
			if half.y * 2.0 > maxy:
				maxy = half.y * 2.0
	return Vector2(maxx + 16.0, maxy + 16.0)

func find_landmark(parent: Node2D, key: String) -> Node2D:
	var lm_v: Node = parent.get_node_or_null("Landmarks")
	if lm_v == null:
		return null
	var lm: Node2D = lm_v as Node2D
	var node_v: Node = lm.get_node_or_null(_to_pascal(key))
	if node_v == null:
		return null
	return node_v as Node2D

func list_landmarks(parent: Node2D) -> Array:
	var lm_v: Node = parent.get_node_or_null("Landmarks")
	if lm_v == null:
		return []
	var lm: Node2D = lm_v as Node2D
	var out: Array = []
	for c in lm.get_children():
		if c.name == "Walls":
			continue
		out.append({"name": c.name, "id": c.get_meta("landmark_id", c.name), "kind": c.get_meta("landmark_kind", ""), "position": [c.position.x, c.position.y]})
	return out

func validate_connectivity(parent: Node2D) -> Dictionary:
	var result: Dictionary = {"ok": true, "routes": []}
	var portal_v: Node2D = find_landmark(parent, "portal_omega")
	var plaza_v: Node2D = find_landmark(parent, "plaza_central")
	var workshop_v: Node2D = find_landmark(parent, "lumen_workshop")
	var gate_v: Node2D = find_landmark(parent, "ohm_gate")
	if portal_v == null or plaza_v == null or workshop_v == null or gate_v == null:
		result["ok"] = false
		result["error"] = "missing landmark"
		return result
	var routes: Array = [
		{"from": "PortalOmega", "to": "PlazaCentral", "a": portal_v.position, "b": plaza_v.position},
		{"from": "PlazaCentral", "to": "LumenWorkshop", "a": plaza_v.position, "b": workshop_v.position},
		{"from": "PlazaCentral", "to": "OhmGate", "a": plaza_v.position, "b": gate_v.position},
	]
	for r_v in routes:
		var r: Dictionary = r_v
		var a_v: Vector2 = r.a
		var b_v: Vector2 = r.b
		var mid: Vector2 = (a_v + b_v) * 0.5
		var blocked: bool = _is_blocked(parent, mid)
		r["mid_blocked"] = blocked
		result.routes.append(r)
		if blocked:
			result["ok"] = false
	return result

func _is_blocked(parent: Node2D, p: Vector2) -> bool:
	var lm_v: Node = parent.get_node_or_null("Landmarks")
	if lm_v == null:
		return false
	var lm: Node2D = lm_v as Node2D
	var walls_v: Node = lm.get_node_or_null("Walls")
	if walls_v == null:
		return false
	var walls: Node2D = walls_v as Node2D
	for w in walls.get_children():
		if not (w is StaticBody2D):
			continue
		var sb: StaticBody2D = w
		for c in sb.get_children():
			if not (c is CollisionShape2D):
				continue
			var cs: CollisionShape2D = c
			var shp: Shape2D = cs.shape
			if shp is RectangleShape2D:
				var rs: RectangleShape2D = shp
				var rect := Rect2(cs.global_position - rs.size * 0.5, rs.size)
				if rect.has_point(p):
					return true
	return false