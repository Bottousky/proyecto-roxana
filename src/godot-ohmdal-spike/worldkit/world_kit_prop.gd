@tool
extends Node2D
class_name WorldKitProp

@export_enum("lamp", "tree", "bench", "sign", "fence") var kind: String = "lamp"
@export var prop_scale: float = 1.0
@export var color: Color = Color.WHITE
@export var accent_color: Color = Color.WHITE

func _ready() -> void:
	_rebuild()

func set_data(p_kind: String, p_color: Color, p_accent: Color, p_scale: float = 1.0) -> void:
	kind = p_kind
	color = p_color
	accent_color = p_accent
	prop_scale = p_scale
	_rebuild()

func _rebuild() -> void:
	for c in get_children():
		c.queue_free()
	match kind:
		"lamp":
			_build_lamp()
		"tree":
			_build_tree()
		"bench":
			_build_bench()
		"sign":
			_build_sign()
		"fence":
			_build_fence()

func _build_lamp() -> void:
	var post := Polygon2D.new()
	post.polygon = PackedVector2Array([
		Vector2(-2, 0), Vector2(2, 0), Vector2(2, 28), Vector2(-2, 28)
	])
	post.color = Color(0.2, 0.2, 0.22)
	add_child(post)
	var head := Polygon2D.new()
	head.polygon = PackedVector2Array([
		Vector2(-8, 28), Vector2(8, 28), Vector2(6, 36), Vector2(-6, 36)
	])
	head.color = color
	add_child(head)
	var glow := Polygon2D.new()
	glow.polygon = PackedVector2Array([
		Vector2(-5, 36), Vector2(5, 36), Vector2(3, 42), Vector2(-3, 42)
	])
	glow.color = accent_color
	add_child(glow)
	prop_scale = 1.0

func _build_tree() -> void:
	var trunk := Polygon2D.new()
	trunk.polygon = PackedVector2Array([
		Vector2(-3, 0), Vector2(3, 0), Vector2(2, -10), Vector2(-2, -10)
	])
	trunk.color = Color(0.35, 0.22, 0.14)
	add_child(trunk)
	var canopy := Polygon2D.new()
	canopy.polygon = PackedVector2Array([
		Vector2(0, -42),
		Vector2(14, -34), Vector2(20, -18), Vector2(18, -2),
		Vector2(8, 4),
		Vector2(-8, 4), Vector2(-18, -2), Vector2(-20, -18),
		Vector2(-14, -34),
	])
	canopy.color = color
	add_child(canopy)
	var shine := Polygon2D.new()
	shine.polygon = PackedVector2Array([
		Vector2(-6, -36), Vector2(-2, -40), Vector2(4, -34)
	])
	shine.color = accent_color
	add_child(shine)

func _build_bench() -> void:
	var seat := Polygon2D.new()
	seat.polygon = PackedVector2Array([
		Vector2(-18, 0), Vector2(18, 0), Vector2(18, 6), Vector2(-18, 6)
	])
	seat.color = color
	add_child(seat)
	for sx in [-14, 14]:
		var leg := Polygon2D.new()
		leg.polygon = PackedVector2Array([
			Vector2(sx - 2, 6), Vector2(sx + 2, 6), Vector2(sx + 2, 12), Vector2(sx - 2, 12)
		])
		leg.color = accent_color
		add_child(leg)

func _build_sign() -> void:
	var post := Polygon2D.new()
	post.polygon = PackedVector2Array([
		Vector2(-2, 0), Vector2(2, 0), Vector2(2, 28), Vector2(-2, 28)
	])
	post.color = Color(0.3, 0.25, 0.2)
	add_child(post)
	var board := Polygon2D.new()
	board.polygon = PackedVector2Array([
		Vector2(-16, 28), Vector2(16, 28), Vector2(16, 44), Vector2(-16, 44)
	])
	board.color = color
	add_child(board)
	var dot := Polygon2D.new()
	dot.polygon = PackedVector2Array([
		Vector2(-2, 32), Vector2(2, 32), Vector2(2, 40), Vector2(-2, 40)
	])
	dot.color = accent_color
	add_child(dot)

func _build_fence() -> void:
	for i in range(-3, 4):
		var post := Polygon2D.new()
		post.polygon = PackedVector2Array([
			Vector2(i * 10 - 1, -16), Vector2(i * 10 + 1, -16),
			Vector2(i * 10 + 1, 4), Vector2(i * 10 - 1, 4)
		])
		post.color = color
		add_child(post)
	var rail := Polygon2D.new()
	rail.polygon = PackedVector2Array([
		Vector2(-32, -8), Vector2(32, -8), Vector2(32, -4), Vector2(-32, -4)
	])
	rail.color = accent_color
	add_child(rail)
	var rail2 := Polygon2D.new()
	rail2.polygon = PackedVector2Array([
		Vector2(-32, 0), Vector2(32, 0), Vector2(32, 4), Vector2(-32, 4)
	])
	rail2.color = accent_color
	add_child(rail2)