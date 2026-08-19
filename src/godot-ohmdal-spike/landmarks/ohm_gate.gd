extends Node2D
class_name OhmGate

@onready var beam: Polygon2D = $Beam
@onready var bars: Polygon2D = $Bars
@onready var glow: Polygon2D = $Glow
var _t: float = 0.0

func _process(delta: float) -> void:
	if GameState.paused:
		return
	_t += delta
	glow.modulate.a = 0.6 + 0.2 * sin(_t * 1.2)

func is_open() -> bool:
	return GameState.has_flag("ohm_gate_open")

func set_open(open: bool) -> void:
	bars.visible = not open
	beam.visible = open