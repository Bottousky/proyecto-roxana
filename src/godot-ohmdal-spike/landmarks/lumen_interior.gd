extends Node2D
class_name LumenInterior

@onready var flame: Polygon2D = $Lamp

var _t: float = 0.0

func _process(delta: float) -> void:
	if GameState.paused:
		return
	_t += delta
	var p := 0.8 + 0.2 * sin(_t * 4.0)
	flame.scale = Vector2(p, p)
	flame.modulate.a = 0.85 + 0.15 * sin(_t * 5.0)