extends Node

class_name WorldKit

const COORDS := {
	"system": "godot2d_centered",
	"north_y": -1.0,
	"south_y": 1.0,
	"east_x": 1.0,
	"west_x": -1.0,
}

const TAG_LANDMARK := "landmark"
const TAG_BUILDING := "building"
const TAG_PORTAL := "portal"
const TAG_GATE := "gate"
const TAG_NPC := "npc"
const TAG_DECOR := "decor"
const TAG_ZONE := "zone"
const TAG_PATH := "path"
const TAG_GROUND := "ground"
const TAG_PLAYER := "player"

static func v(x: float, y: float) -> Vector2:
	return Vector2(x, y)

static func from_dict(d) -> Vector2:
	if d == null:
		return Vector2.ZERO
	if d is Vector2:
		return d
	return Vector2(float(d.get("x", 0.0)), float(d.get("y", 0.0)))

static func size_from_dict(d) -> Vector2:
	if d == null:
		return Vector2.ZERO
	if d is Vector2:
		return d
	return Vector2(float(d.get("width", 0.0)), float(d.get("height", 0.0)))

static func to_color(c) -> Color:
	if c == null:
		return Color.WHITE
	if c is String:
		return Color(c)
	if c is Dictionary:
		return Color(
			float(c.get("r", 1.0)),
			float(c.get("g", 1.0)),
			float(c.get("b", 1.0)),
			float(c.get("a", 1.0))
		)
	if c is Color:
		return c
	return Color.WHITE

static func tag(parent: Node, tag_name: String) -> void:
	if not parent.has_meta("wk_tags"):
		parent.set_meta("wk_tags", [])
	var tags_v: Array = parent.get_meta("wk_tags")
	if not (tag_name in tags_v):
		tags_v.append(tag_name)
	parent.set_meta("wk_tags", tags_v)

static func has_tag(parent: Node, tag_name: String) -> bool:
	if not parent.has_meta("wk_tags"):
		return false
	var tags_v: Array = parent.get_meta("wk_tags")
	return tag_name in tags_v