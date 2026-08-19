extends Area2D
class_name WorldKitInteraction

@export var interaction_id: String = ""
@export var radius: float = 60.0
@export var label: String = ""
@export var one_shot: bool = false
@export var enabled: bool = true

signal triggered(interaction_id: String)
signal interacted(interaction_id: String, source: Node)

var _triggered: bool = false

func _ready() -> void:
	var col := CollisionShape2D.new()
	var cs := CircleShape2D.new()
	cs.radius = radius
	col.shape = cs
	col.position = Vector2.ZERO
	add_child(col)
	if not is_connected("body_entered", Callable(self, "_on_body_entered")):
		connect("body_entered", Callable(self, "_on_body_entered"))

func _on_body_entered(body: Node) -> void:
	if not enabled:
		return
	if _triggered and one_shot:
		return
	if not body.is_in_group("player"):
		return
	_triggered = true
	triggered.emit(interaction_id)
	interacted.emit(interaction_id, body)

func reset() -> void:
	_triggered = false

func set_enabled(v: bool) -> void:
	enabled = v
	monitoring = v
	monitorable = v