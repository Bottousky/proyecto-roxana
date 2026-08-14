# Trine 4 — Notes for Physica

## Camera

- Side-scroller camera with a fixed plane of play. The plane is the
  *theatrical* plane; everything else is depth for the audience.
- Camera holds position when the player is still. Follows with a slight
  damped lerp when the player moves. There is no handheld shake; the camera
  is a steady theatre.
- Camera distance varies by zone: close for tight puzzles, far for
  spectacle (cascades, castles).

## Staging

- Puzzles are foregrounded. They always sit on the most lit, most readable
  part of the frame.
- The background is composed, not procedural: layered silhouettes that
  recede in clear planes of depth.
- Materials are stylized (hand-painted feel) but they obey real lighting.
  There is bounce, there are specular highlights, and the magic props emit
  light that lands on nearby surfaces.

## Materials palette

- Warm woods, mossy stone, golden magic, blue crystal. Each material has
  visible wear: scratches, moss, dirt. Nothing is showroom-perfect.

## Composition

- Foreground: player + puzzle + key prop.
- Midground: supporting architecture (platforms, walls, ropes).
- Background: 3–5 parallax layers that recede into atmospheric haze.

## What we steal

- The **camera discipline** (locked plane, lerp follow).
- The **staging** (foreground puzzle lit against layered depth).
- The **material wear** (rocks and stone must look old, painted, lived-in).

## What we reject

- Fantasy character art and bright primary colors.
- Mechanic-driven UI overlays.
- Cartoon proportions for the protagonist.

## Applied to Physica

- Escena 2 (cascade): use Trine's layered mountains and golden-hour light
  to make the cascade feel monumental.
- Escena 6 (inclined plane): Trine-style physical puzzle staging — the
  player sees the solution space immediately, the world is composed so the
  answer is obvious once you see it.
- Escena 8 (metropolis): Trine-style vertical depth — buildings layered
  behind each other, fog planes between them, the platform of observation
  reads as a Trine set piece.