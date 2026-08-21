import { migrateLoadedFlags, migrateLoadedRoom } from '../src/state.ts';

function equal(actual: unknown, expected: unknown, label: string): void { if (actual !== expected) throw new Error(`${label}: ${actual}`); }
const incomplete = migrateLoadedFlags({ solvedStoredSpark: true, solvedSleepingRiver: true, solvedClock: true, learnedCapacitor: true, unit4Completed: true });
equal(incomplete.solvedStoredSpark, false, 'H7 clears local RC for incomplete saves');
equal(incomplete.solvedClock, false, 'H7 clears clock RC for incomplete saves');
equal(incomplete.unit4Completed, true, 'H7 preserves prior chapters');
const complete = migrateLoadedFlags({ solvedStoredSpark: true, learnedCapacitor: true, lighthouseRestored: true, unit5Completed: true, arcOneCompleted: true });
equal(complete.solvedStoredSpark, true, 'completed saves preserve RC history');
equal(complete.lighthouseRestored, true, 'completed saves preserve final restoration');
const restoredOnly = migrateLoadedFlags({ solvedStoredSpark: true, lighthouseRestored: true });
equal(restoredOnly.solvedStoredSpark, true, 'lighthouseRestored-only keeps its historic final');
equal(restoredOnly.lighthouseRestored, true, 'lighthouseRestored-only remains restored');
equal(migrateLoadedRoom('clock_tower', incomplete), 'lighthouse_hall', 'incomplete legacy H7 relocates safely');
equal(migrateLoadedRoom('clock_tower', restoredOnly), 'clock_tower', 'restored final retains saved room');
equal(migrateLoadedRoom('hall', incomplete), 'plaza', 'old Phaser Instituto saves reopen in Plaza');
equal(migrateLoadedRoom('aula', incomplete), 'plaza', 'old Phaser aula saves reopen in Plaza');
console.log('DC save migration: OK');
