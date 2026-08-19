extends Node2D
class_name LumenWorkshop

@onready var smoke: Polygon2D = $Smoke
var _t: float = 0.0

func _process(delta: float) -> void:
	if GameState.paused:
		return
	_t += delta
	smoke.position.y = -10.0 + sin(_t * 1.4) * 4.0
	smoke.modulate.a = 0.5 + 0.15 * sin(_t * 2.0)