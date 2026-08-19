extends Node2D
class_name LumenNPC

@onready var label: Label = $Label

func _ready() -> void:
	add_to_group("npc")
	$Label.text = "Maese Lumen"