extends Node2D
class_name Edda

@onready var label: Label = $Label

func _ready() -> void:
	add_to_group("npc")
	$Label.text = "Edda"