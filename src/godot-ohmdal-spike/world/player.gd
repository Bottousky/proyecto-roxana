extends CharacterBody2D
class_name Player

const SPEED := 240.0

@export var camera_path: NodePath
@export var interact_action: String = "interact"
@export var open_bitacora_action: String = "open_bitacora"

var _camera: Camera2D

func _ready() -> void:
	add_to_group("player")
	_ensure_collision()
	_ensure_visual()
	if camera_path != NodePath(""):
		_camera = get_node_or_null(camera_path) as Camera2D
	process_mode = Node.PROCESS_MODE_ALWAYS

func _ensure_collision() -> void:
	if get_node_or_null("Collider") != null:
		return
	var body := CollisionShape2D.new()
	body.name = "Collider"
	var cap := CapsuleShape2D.new()
	cap.radius = 10.0
	cap.height = 26.0
	body.shape = cap
	add_child(body)

func _ensure_visual() -> void:
	if get_node_or_null("Visual") != null:
		return
	var visual := Node2D.new()
	visual.name = "Visual"
	var shadow := Polygon2D.new()
	shadow.polygon = PackedVector2Array([Vector2(-12, -2), Vector2(12, -2), Vector2(8, 2), Vector2(-8, 2)])
	shadow.color = Color(0, 0, 0, 0.3)
	visual.add_child(shadow)
	var tunic := Polygon2D.new()
	tunic.color = Color("#5d6fa8")
	tunic.polygon = PackedVector2Array([Vector2(-9, 4), Vector2(9, 4), Vector2(7, -14), Vector2(-7, -14)])
	visual.add_child(tunic)
	var head := Polygon2D.new()
	head.color = Color("#d0c0a8")
	head.polygon = PackedVector2Array([Vector2(-7, -14), Vector2(7, -14), Vector2(6, -24), Vector2(-6, -24)])
	visual.add_child(head)
	var hat := Polygon2D.new()
	hat.color = Color("#3a4a8a")
	hat.polygon = PackedVector2Array([Vector2(-8, -24), Vector2(8, -24), Vector2(6, -32), Vector2(-6, -32)])
	visual.add_child(hat)
	add_child(visual)

func _physics_process(delta: float) -> void:
	if GameState.paused:
		velocity = Vector2.ZERO
		return
	var input := Vector2(
		Input.get_axis("ui_left", "ui_right"),
		Input.get_axis("ui_up", "ui_down")
	)
	if input.length() > 1.0:
		input = input.normalized()
	velocity = input * SPEED
	move_and_slide()
	GameState.player_position = global_position
	Bridge.emit_event("player.position.changed", {"x": global_position.x, "y": global_position.y})

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed(open_bitacora_action):
		Bridge.emit_event("ui.open_bitacora", {})
		Bridge.pause_game()
	if event.is_action_pressed(interact_action):
		_try_interact()

func _try_interact() -> void:
	var found: Area2D = null
	var best_d := INF
	for area in get_tree().get_nodes_in_group("interaction"):
		if not area is Area2D:
			continue
		var d := global_position.distance_to((area as Area2D).global_position)
		if d < best_d:
			best_d = d
			found = area
	if found and best_d < 90.0:
		var area := found as Area2D
		var iid := str(area.get("interaction_id"))
		match iid:
			"talk_edda":
				_on_talk_edda()
			"talk_lumen":
				_on_talk_lumen()
			"enter_portal":
				_on_enter_portal()
			"ohm_gate":
				_on_ohm_gate()
			"enter_lumen_workshop":
				_on_enter_lumen_workshop()

func _on_talk_edda() -> void:
	if not GameState.has_flag("edda_met"):
		GameState.set_flag("edda_met", true)
		Bridge.emit_event("discovery.unlocked", {"id": "electric_current", "label": "Corriente eléctrica"})
		Bridge.emit_event("objective.completed", {"id": "ohmdal.current.basic"})
		Bridge.emit_event("npc.talked", {"npc": "edda", "first_time": true})

func _on_talk_lumen() -> void:
	if not GameState.has_flag("lumen_met"):
		GameState.set_flag("lumen_met", true)
		Bridge.emit_event("npc.talked", {"npc": "lumen", "first_time": true})
	else:
		Bridge.emit_event("npc.talked", {"npc": "lumen", "first_time": false})

func _on_enter_portal() -> void:
	Bridge.emit_event("portal.entered", {"portal": "portal_omega"})

func _on_ohm_gate() -> void:
	if GameState.has_flag("ohm_gate_open"):
		Bridge.emit_event("ohm_gate.opened", {})
	else:
		Bridge.emit_event("ohm_gate.locked", {"reason": "ohmdal.current.basic"})

func _on_enter_lumen_workshop() -> void:
	GameState.set_flag("lumen_interior_visited", true)
	Bridge.emit_event("interior.entered", {"interior": "LumenInterior"})

func teleport_to(v: Vector2) -> void:
	global_position = v
	GameState.player_position = v
	Bridge.emit_event("player.position.changed", {"x": v.x, "y": v.y})