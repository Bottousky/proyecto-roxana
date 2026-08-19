extends Node2D
class_name PortalOmega

@onready var body: Polygon2D = $Body
@onready var swirl: Polygon2D = $Swirl
@onready var halo: Polygon2D = $Halo
@onready var label: Label = $Label

var _t: float = 0.0

func _process(delta: float) -> void:
	if GameState.paused:
		return
	_t += delta
	var pulse := 0.85 + 0.15 * sin(_t * 2.0)
	swirl.scale = Vector2(pulse, pulse)
	halo.modulate.a = 0.4 + 0.2 * sin(_t * 3.0)