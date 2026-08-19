@tool
extends Node2D
class_name WorldKitPath

@export var waypoints: PackedVector2Array = PackedVector2Array()
@export var width: float = 100.0
@export var fill_color: Color = Color("#c4ad7b")
@export var border_color: Color = Color("#8a7345")
@export var border_width: float = 3.0

var _poly: Polygon2D
var _line: Line2D

func _ready() -> void:
	_rebuild()

func set_data(p_waypoints: PackedVector2Array, p_width: float, p_fill: Color, p_border: Color) -> void:
	waypoints = p_waypoints
	width = p_width
	fill_color = p_fill
	border_color = p_border
	_rebuild()

func _rebuild() -> void:
	for c in get_children():
		c.queue_free()
	if waypoints.size() < 2:
		return
	var ribbon := _build_ribbon(waypoints, width * 0.5)
	var poly := Polygon2D.new()
	poly.polygon = ribbon
	poly.color = fill_color
	add_child(poly)
	_poly = poly

	var line := Line2D.new()
	line.default_color = border_color
	line.width = border_width
	line.points = waypoints
	add_child(line)
	_line = line

static func _build_ribbon(points: PackedVector2Array, half_w: float) -> PackedVector2Array:
	var left := PackedVector2Array()
	var right := PackedVector2Array()
	for i in points.size():
		var p := points[i]
		var dir := Vector2.ZERO
		if i == 0 and points.size() >= 2:
			dir = (points[1] - p).normalized()
		elif i == points.size() - 1 and points.size() >= 2:
			dir = (p - points[i - 1]).normalized()
		else:
			dir = (points[i + 1] - points[i - 1]).normalized()
		var normal := Vector2(-dir.y, dir.x)
		left.append(p + normal * half_w)
		right.append(p - normal * half_w)
	var ribbon := PackedVector2Array()
	for p in left:
		ribbon.append(p)
	for i in range(right.size() - 1, -1, -1):
		ribbon.append(right[i])
	return ribbon