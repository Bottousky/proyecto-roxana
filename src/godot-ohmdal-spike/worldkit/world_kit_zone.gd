@tool
extends Node2D
class_name WorldKitZone

@export var size: Vector2 = Vector2(400, 240)
@export var fill_color: Color = Color(0.6, 0.8, 0.5, 0.18)
@export var border_color: Color = Color(0.4, 0.6, 0.4, 0.7)
@export var label: String = ""

func _ready() -> void:
	_rebuild()

func set_data(p_size: Vector2, p_fill: Color, p_border: Color, p_label: String = "") -> void:
	size = p_size
	fill_color = p_fill
	border_color = p_border
	label = p_label
	_rebuild()

func _rebuild() -> void:
	for c in get_children():
		c.queue_free()
	var hw := size.x * 0.5
	var hh := size.y * 0.5
	var poly := Polygon2D.new()
	poly.polygon = PackedVector2Array([
		Vector2(-hw, -hh), Vector2( hw, -hh),
		Vector2( hw,  hh), Vector2(-hw,  hh)
	])
	poly.color = fill_color
	add_child(poly)
	var line := Line2D.new()
	line.default_color = border_color
	line.width = 2.0
	line.points = PackedVector2Array([
		Vector2(-hw, -hh), Vector2( hw, -hh),
		Vector2( hw,  hh), Vector2(-hw,  hh),
		Vector2(-hw, -hh)
	])
	add_child(line)
	if label != "":
		var lab := Label.new()
		lab.text = label
		lab.add_theme_color_override("font_color", Color(0.1, 0.2, 0.1, 0.7))
		lab.add_theme_font_size_override("font_size", 10)
		lab.position = Vector2(-hw + 4, -hh + 2)
		lab.size = Vector2(size.x - 8, 14)
		add_child(lab)