export const SPRING_WATERWORKS_FOOTPRINTS = Object.freeze([
  ...[-16.1, -13.6, -11.1, -8.6, -6.1, -3.6, 3.2, 7.82].map((x, i) =>
    Object.freeze({ id: `spring-aqueduct-pier-${i}`, x, z: -12.6, w: 1.05, d: 1.10 })),
  Object.freeze({ id: 'spring-source-rock', x: -17.25, z: -12.6, w: 2.3, d: 2.4 }),
  Object.freeze({ id: 'spring-flume-support', x: 7.82, z: -9.4, w: .8, d: .75 }),
  Object.freeze({ id: 'spring-wheel-bearing', x: 7.82, z: -6.6, w: .75, d: .65 }),
  Object.freeze({ id: 'spring-wheel-basin', label: 'Agua de la rueda', x: 7.82, z: -5.58, w: 4.8, d: 1.4 }),
]);

export const LIGHTHOUSE_ISLET_RADIUS = 4.3;
