@tool
extends Node2D
class_name WorldKitGround

@export var size: Vector2 = Vector2(1600, 1200)
@export var fill_color: Color = Color("#9bc6a3")
@export var border_color: Color = Color("#5e8a6b")
@export var border_width: float = 8.0

var _rect: Polygon2D

func _ready() -> void:
	_rebuild()

func set_data(p_size: Vector2, p_fill: Color, p_border: Color) -> void:
	size = p_size
	fill_color = p_fill
	border_color = p_border
	_rebuild()

func _rebuild() -> void:
	for c in get_children():
		c.queue_free()
	var poly := Polygon2D.new()
	var hw := size.x * 0.5
	var hh := size.y * 0.5
	poly.polygon = PackedVector2Array([
		Vector2(-hw, -hh),
		Vector2( hw, -hh),
		Vector2( hw,  hh),
		Vector2(-hw,  hh),
	])
	poly.color = fill_color
	add_child(poly)
	_rect = poly

	var border := Line2D.new()
	border.default_color = border_color
	border.width = border_width
	border.points = PackedVector2Array([
		Vector2(-hw, -hh),
		Vector2( hw, -hh),
		Vector2( hw,  hh),
		Vector2(-hw,  hh),
		Vector2(-hw, -hh),
	])
	add_child(border)