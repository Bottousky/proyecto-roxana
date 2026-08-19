@tool
extends Node2D
class_name WorldKitPlaza

@export var size: Vector2 = Vector2(700, 360)
@export var fill_color: Color = Color("#d9c79a")
@export var border_color: Color = Color("#9b8657")
@export var border_width: float = 6.0

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
	var hw := size.x * 0.5
	var hh := size.y * 0.5
	var inset := 10.0
	var poly := Polygon2D.new()
	poly.polygon = PackedVector2Array([
		Vector2(-hw + inset, -hh + inset),
		Vector2( hw - inset, -hh + inset),
		Vector2( hw - inset,  hh - inset),
		Vector2(-hw + inset,  hh - inset),
	])
	poly.color = fill_color
	add_child(poly)

	var line := Line2D.new()
	line.default_color = border_color
	line.width = border_width
	line.points = PackedVector2Array([
		Vector2(-hw, -hh),
		Vector2( hw, -hh),
		Vector2( hw,  hh),
		Vector2(-hw,  hh),
		Vector2(-hw, -hh),
	])
	add_child(line)

	var inner := Line2D.new()
	inner.default_color = border_color
	inner.width = border_width * 0.5
	var hw2 := hw - inset * 0.5
	var hh2 := hh - inset * 0.5
	inner.points = PackedVector2Array([
		Vector2(-hw2, -hh2),
		Vector2( hw2, -hh2),
		Vector2( hw2,  hh2),
		Vector2(-hw2,  hh2),
		Vector2(-hw2, -hh2),
	])
	add_child(inner)