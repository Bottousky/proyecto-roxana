@tool
extends Node2D
class_name WorldKitNPC

@export var npc_id: String = ""
@export var display_name: String = ""
@export var body_color: Color = Color("#d0c0a8")
@export var tunic_color: Color = Color("#5d6fa8")
@export var hair_color: Color = Color("#3b2a1a")
@export var facing: String = "south"
@export var height: float = 36.0

func _ready() -> void:
	_rebuild()

func set_data(p_id: String, p_name: String, p_tunic: Color, p_body: Color, p_hair: Color, p_facing: String = "south") -> void:
	npc_id = p_id
	display_name = p_name
	tunic_color = p_tunic
	body_color = p_body
	hair_color = p_hair
	facing = p_facing
	_rebuild()

func _rebuild() -> void:
	for c in get_children():
		c.queue_free()
	var shadow := Polygon2D.new()
	shadow.polygon = PackedVector2Array([
		Vector2(-12, -2), Vector2(12, -2), Vector2(8, 2), Vector2(-8, 2)
	])
	shadow.color = Color(0, 0, 0, 0.25)
	add_child(shadow)

	var tunic := Polygon2D.new()
	tunic.polygon = PackedVector2Array([
		Vector2(-10, 4), Vector2(10, 4), Vector2(8, -16), Vector2(-8, -16)
	])
	tunic.color = tunic_color
	add_child(tunic)

	var head := Polygon2D.new()
	head.polygon = PackedVector2Array([
		Vector2(-8, -16), Vector2(8, -16), Vector2(7, -28), Vector2(-7, -28)
	])
	head.color = body_color
	add_child(head)

	var hair := Polygon2D.new()
	hair.polygon = PackedVector2Array([
		Vector2(-9, -28), Vector2(9, -28), Vector2(7, -36), Vector2(-7, -36)
	])
	hair.color = hair_color
	add_child(hair)

	var mark := Label.new()
	mark.text = display_name
	mark.add_theme_color_override("font_color", Color(0, 0, 0, 0.7))
	mark.add_theme_font_size_override("font_size", 11)
	mark.position = Vector2(-28, -52)
	mark.size = Vector2(56, 14)
	mark.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(mark)