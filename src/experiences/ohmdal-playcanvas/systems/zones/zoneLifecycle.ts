export type OhmdalZoneId = 'plaza' | 'workshop' | 'manantial';

export interface OhmdalZoneDefinition {
  id: OhmdalZoneId;
  load?: () => void | Promise<void>;
  setActive?: (active: boolean) => void;
}

export interface OhmdalZoneSnapshot {
  id: OhmdalZoneId;
  loaded: boolean;
  active: boolean;
}

interface ZoneRecord extends OhmdalZoneSnapshot {
  definition: OhmdalZoneDefinition;
  loading: Promise<void> | null;
}

/**
 * Small runtime boundary for the three known Ohmdal zones. It intentionally
 * owns no assets and no gameplay state: callers decide when progression may
 * preload or activate a registered zone.
 */
export class OhmdalZoneLifecycle {
  private readonly records = new Map<OhmdalZoneId, ZoneRecord>();

  register(definition: OhmdalZoneDefinition): void {
    if (this.records.has(definition.id)) throw new Error(`Zone already registered: ${definition.id}`);
    this.records.set(definition.id, {
      definition,
      id: definition.id,
      loaded: false,
      active: false,
      loading: null,
    });
  }

  async initializePlaza(): Promise<void> {
    await this.activate('plaza');
  }

  async preload(id: OhmdalZoneId): Promise<void> {
    const record = this.require(id);
    if (record.loaded) return;
    if (!record.loading) {
      record.loading = Promise.resolve(record.definition.load?.()).then(() => {
        record.loaded = true;
        record.loading = null;
      });
    }
    await record.loading;
  }

  async activate(id: OhmdalZoneId): Promise<void> {
    const record = this.require(id);
    await this.preload(id);
    if (record.active) return;
    record.definition.setActive?.(true);
    record.active = true;
  }

  deactivate(id: OhmdalZoneId): void {
    const record = this.require(id);
    if (!record.active) return;
    record.definition.setActive?.(false);
    record.active = false;
  }

  snapshot(): OhmdalZoneSnapshot[] {
    return [...this.records.values()].map(({ id, loaded, active }) => ({ id, loaded, active }));
  }

  private require(id: OhmdalZoneId): ZoneRecord {
    const record = this.records.get(id);
    if (!record) throw new Error(`Unknown Ohmdal zone: ${id}`);
    return record;
  }
}
