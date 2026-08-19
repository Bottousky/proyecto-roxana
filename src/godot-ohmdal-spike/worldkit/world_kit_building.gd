@tool
extends Node2D
class_name WorldKitBuilding

@export var size: Vector2 = Vector2(280, 200)
@export var fill_color: Color = Color("#caa97a")
@export var roof_color: Color = Color("#7a4a2c")
@export var wall_thickness: float = 8.0
@export var entrance_size: float = 60.0
@export var entrance_side: String = "south"

func _ready() -> void:
	_rebuild()

func set_data(p_size: Vector2, p_fill: Color, p_roof: Color, p_entrance_side: String = "south") -> void:
	size = p_size
	fill_color = p_fill
	roof_color = p_roof
	entrance_side = p_entrance_side
	_rebuild()

func _rebuild() -> void:
	for c in get_children():
		c.queue_free()
	var hw := size.x * 0.5
	var hh := size.y * 0.5

	var body := Polygon2D.new()
	body.polygon = PackedVector2Array([
		Vector2(-hw, -hh),
		Vector2( hw, -hh),
		Vector2( hw,  hh),
		Vector2(-hw,  hh),
	])
	body.color = fill_color
	add_child(body)

	var roof_h := hh * 0.45
	var roof_poly := Polygon2D.new()
	roof_poly.polygon = PackedVector2Array([
		Vector2(-hw - 12, -hh),
		Vector2( hw + 12, -hh),
		Vector2( hw - 18, -hh - roof_h),
		Vector2(-hw + 18, -hh - roof_h),
	])
	roof_poly.color = roof_color
	add_child(roof_poly)

	var outline := Line2D.new()
	outline.default_color = Color(0, 0, 0, 0.5)
	outline.width = wall_thickness * 0.4
	outline.points = PackedVector2Array([
		Vector2(-hw, -hh),
		Vector2( hw, -hh),
		Vector2( hw,  hh),
		Vector2(-hw,  hh),
		Vector2(-hw, -hh),
	])
	add_child(outline)

	_add_entrance_sign(hw, hh)

func _add_entrance_sign(hw: float, hh: float) -> void:
	var ehalf := entrance_size * 0.5
	var center := Vector2.ZERO
	match entrance_side:
		"south":
			center = Vector2(0, hh - 6)
		"north":
			center = Vector2(0, -hh + 6)
		"east":
			center = Vector2(hw - 6, 0)
		"west":
			center = Vector2(-hw + 6, 0)
	var gap := Polygon2D.new()
	gap.polygon = PackedVector2Array([
		center + Vector2(-ehalf, -6),
		center + Vector2( ehalf, -6),
		center + Vector2( ehalf,  6),
		center + Vector2(-ehalf,  6),
	])
	gap.color = Color(0, 0, 0, 0.0)
	add_child(gap)

	var marker := Line2D.new()
	marker.default_color = Color(1, 0.85, 0.4)
	marker.width = 3.0
	marker.points = PackedVector2Array([
		center + Vector2(-ehalf, -6),
		center + Vector2(-ehalf,  6),
		center + Vector2( ehalf,  6),
		center + Vector2( ehalf, -6),
	])
	add_child(marker)