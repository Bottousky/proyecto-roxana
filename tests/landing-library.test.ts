import assert from 'node:assert/strict';
import { LIBRARY_ARTICLES, getLibraryArticle } from '../src/landing/library.ts';
import {
  WORLD_ACTIVITIES,
  getWorldActivity,
  checkActivityAnswer,
} from '../src/landing/worldActivities.ts';

// Invalid or stale client input must never be awarded a successful practice.
assert.equal(checkActivityAnswer('missing', 'retorno', 'cerrar'), null);
assert.equal(checkActivityAnswer('ohmdal', 'missing', 'cerrar'), null);
assert.equal(checkActivityAnswer('ohmdal', 'retorno', 'missing'), null);
assert.equal(checkActivityAnswer('ohmdal', 'retorno', '__proto__'), null);
assert.equal(getLibraryArticle('missing'), undefined);

assert.equal(
  new Set(LIBRARY_ARTICLES.map((article) => article.id)).size,
  LIBRARY_ARTICLES.length,
);
assert.equal(
  new Set(WORLD_ACTIVITIES.map((activity) => activity.world)).size,
  4,
);
for (const article of LIBRARY_ARTICLES) {
  assert.equal(getLibraryArticle(article.id), article);
  assert(
    article.sections.length >= 2,
    `${article.id}: reading needs a coherent structure`,
  );
  assert(
    article.sections.every((section) =>
      section.paragraphs.every(
        (paragraph) => typeof paragraph === 'string' && paragraph.length > 0,
      ),
    ),
  );
}

for (const activity of WORLD_ACTIVITIES) {
  assert.equal(getWorldActivity(activity.world), activity);
  assert.equal(
    new Set(activity.challenges.map((challenge) => challenge.id)).size,
    activity.challenges.length,
  );
  for (const challenge of activity.challenges) {
    assert.equal(
      new Set(challenge.choices.map((choice) => choice.id)).size,
      challenge.choices.length,
    );
    assert.equal(
      challenge.choices.filter(
        (choice) => choice.id === challenge.correctChoiceId,
      ).length,
      1,
    );
    for (const choice of challenge.choices) {
      const result = checkActivityAnswer(activity.id, challenge.id, choice.id);
      assert(result);
      assert.equal(result.correct, choice.id === challenge.correctChoiceId);
      assert(
        result.outcome.length > 0,
        'An unsuccessful operation still explains an observable consequence',
      );
      const values = challenge.visual?.results[choice.id];
      assert(
        values?.length,
        'Every operation has a renderable resulting state',
      );
      assert(values.every((value) => Number.isFinite(value.value)));
    }
  }
}

// Validate the mathematical relationships that the UI will display, independently
// of which choice is labelled successful in the content.
const resistance = getWorldActivity('ohmdal')!.challenges.find(
  (item) => item.id === 'regular',
)!.visual!;
for (const values of Object.values(resistance.results)) {
  const r = values.find((value) => value.unit === 'Ω')!.value;
  const i = values.find((value) => value.unit === 'A')!.value;
  assert.equal(
    r * i,
    6,
    'Every displayed resistive outcome obeys the same 6 V source',
  );
}
const mix = getWorldActivity('arithmos')!.challenges.find(
  (item) => item.id === 'mezcla',
)!;
for (const choice of mix.choices) {
  const [blue, gold] = mix.visual!.results[choice.id];
  const meetsTarget =
    blue.value * 3 === gold.value * 2 && blue.value + gold.value === 10;
  assert.equal(
    checkActivityAnswer('arithmos', 'mezcla', choice.id)!.correct,
    meetsTarget,
  );
}
const movement = getWorldActivity('physica')!.challenges.find(
  (item) => item.id === 'acelerar',
)!.visual!;
for (const values of Object.values(movement.results)) {
  const force = values.find((value) => value.unit === 'N')!.value;
  const acceleration = values.find((value) => value.unit === 'm/s²')!.value;
  assert.equal(
    force / 2,
    acceleration,
    'Every displayed acceleration respects the 2 kg mass',
  );
}

console.log('Landing library and practice data: passed');
