extends Marker2D
class_name WorldKitSpawn

@export var spawn_id: String = ""
@export var spawn_kind: String = "player"

func _ready() -> void:
	if spawn_id != "":
		name = StringName(spawn_id)