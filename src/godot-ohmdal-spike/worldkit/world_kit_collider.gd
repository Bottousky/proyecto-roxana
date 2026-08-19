extends Node2D
class_name WorldKitCollider

@export var size: Vector2 = Vector2(280, 200)
@export var shape: String = "rect"

var _body: StaticBody2D

func _ready() -> void:
	_rebuild()

func set_data(p_size: Vector2, p_shape: String = "rect") -> void:
	size = p_size
	shape = p_shape
	_rebuild()

func _rebuild() -> void:
	for c in get_children():
		c.queue_free()
	_body = StaticBody2D.new()
	_body.name = "Collider"
	var col := CollisionShape2D.new()
	var sh := RectangleShape2D.new()
	sh.size = size
	col.shape = sh
	col.position = Vector2.ZERO
	_body.add_child(col)
	add_child(_body)