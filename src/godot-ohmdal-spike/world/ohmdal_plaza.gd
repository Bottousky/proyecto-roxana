extends Node2D

const SPEC_PATH := "res://world/ohmdal_plaza.world.json"

@onready var world_node: Node2D = $World
@onready var player: Player = $Player
@onready var camera: Camera2D = $Camera

var builder: WorldBuilder
var _t: float = 0.0

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	builder = WorldBuilder.new()
	var spec: Dictionary = builder.load_spec(SPEC_PATH)
	if spec.is_empty():
		push_error("Empty WorldSpec; aborting build")
		return
	builder.materialize(world_node, spec)
	var conn: Dictionary = builder.validate_connectivity(world_node)
	print("[Ohmdal] connectivity:", conn)
	_place_player_from_spec(spec)
	_wire_signals()
	_emit_ready_to_web()
	_schedule_bridge_heartbeat()

func _place_player_from_spec(spec: Dictionary) -> void:
	var spawn_v: Variant = spec.get("spawn", {})
	var spawn_d: Dictionary = spawn_v if spawn_v is Dictionary else {}
	var p_v: Variant = spawn_d.get("player", {"x": 0, "y": 540})
	var p_d: Dictionary = p_v if p_v is Dictionary else {}
	player.global_position = Vector2(float(p_d.get("x", 0.0)), float(p_d.get("y", 0.0)))
	camera.global_position = player.global_position

func _wire_signals() -> void:
	var chars := world_node.get_node_or_null("Characters")
	if chars == null:
		return
	var edda := chars.get_node_or_null("Edda")
	var lumen := chars.get_node_or_null("Lumen")
	# Nothing special to wire; interactions handled by player proximity.

func _emit_ready_to_web() -> void:
	Bridge.emit_event("world.loaded", {
		"world": GameState.current_world,
		"scene": GameState.current_scene,
		"landmarks": builder.list_landmarks(world_node),
		"connectivity_ok": builder.validate_connectivity(world_node).ok,
		"seed": builder.get_seed(),
	})

func _process(delta: float) -> void:
	if GameState.paused:
		return
	_t += delta
	if _t >= 1.0:
		_t = 0.0
		Bridge.emit_event("heartbeat", {
			"player": {"x": player.global_position.x, "y": player.global_position.y},
			"discoveries": GameState.discoveries.duplicate(true),
		})

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("rebuild_world"):
		rebuild()

func rebuild() -> void:
	if builder == null:
		builder = WorldBuilder.new()
	var spec: Dictionary = builder.load_spec(SPEC_PATH)
	builder.materialize(world_node, spec)
	_place_player_from_spec(spec)
	print("[Ohmdal] rebuilt from spec; seed=", builder.get_seed())

func _schedule_bridge_heartbeat() -> void:
	# Used only to push initial state to host; web side will receive game.ready soon after.
	Bridge.set_host_ready(true)