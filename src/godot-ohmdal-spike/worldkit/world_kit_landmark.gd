@tool
extends Node2D
class_name WorldKitLandmark

@export var landmark_id: String = ""
@export var display_name: String = ""
@export var fill_color: Color = Color.WHITE
@export var accent_color: Color = Color.WHITE
@export var size: Vector2 = Vector2(160, 100)

func _ready() -> void:
	_rebuild()

func set_data(p_id: String, p_name: String, p_fill: Color, p_accent: Color, p_size: Vector2) -> void:
	landmark_id = p_id
	display_name = p_name
	fill_color = p_fill
	accent_color = p_accent
	size = p_size
	_rebuild()

func _rebuild() -> void:
	for c in get_children():
		c.queue_free()
	var hw := size.x * 0.5
	var hh := size.y * 0.5
	var arch := Polygon2D.new()
	arch.polygon = PackedVector2Array([
		Vector2(-hw, hh),
		Vector2( hw, hh),
		Vector2( hw, -hh * 0.5),
		Vector2( hw * 0.6, -hh),
		Vector2(-hw * 0.6, -hh),
		Vector2(-hw, -hh * 0.5),
	])
	arch.color = fill_color
	add_child(arch)

	var inner := Polygon2D.new()
	inner.polygon = PackedVector2Array([
		Vector2(-hw * 0.45, hh * 0.6),
		Vector2( hw * 0.45, hh * 0.6),
		Vector2( hw * 0.4, -hh * 0.3),
		Vector2( hw * 0.25, -hh * 0.7),
		Vector2(-hw * 0.25, -hh * 0.7),
		Vector2(-hw * 0.4, -hh * 0.3),
	])
	inner.color = accent_color
	add_child(inner)

	var beam := Polygon2D.new()
	beam.polygon = PackedVector2Array([
		Vector2(-hw * 0.08, -hh * 0.3),
		Vector2( hw * 0.08, -hh * 0.3),
		Vector2( hw * 0.08, hh * 0.9),
		Vector2(-hw * 0.08, hh * 0.9),
	])
	beam.color = Color(1, 1, 1, 0.6)
	add_child(beam)

	var label := Label.new()
	label.text = display_name
	label.add_theme_color_override("font_color", Color(0, 0, 0, 0.7))
	label.add_theme_font_size_override("font_size", 12)
	label.position = Vector2(-60, hh + 6)
	label.size = Vector2(120, 16)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(label)