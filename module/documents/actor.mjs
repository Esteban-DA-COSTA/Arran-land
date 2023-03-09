import {ARRANFOUNDRY} from "../helpers/config.mjs";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class BoilerplateActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.boilerplate || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(systemData.abilities)) {
      // Calculate the modifier using d20 rules.
      ability.mod = Math.floor((ability.value - 10) / 2);
    }
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    systemData.xp = (systemData.cr * systemData.cr) * 100;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.level) {
      data.lvl = data.level.value ?? 1;
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

}

export class ArranFoundryActor extends Actor {

  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
  }


  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);

    return data;
  }

  _prepareCharacterData(actorData) {
    console.log(actorData);
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, attribute] of Object.entries(systemData.attributes)) {
      // Calculate the modifier using d20 rules.
      const finalMod = attribute.custom + ARRANFOUNDRY.defaultModificator[attribute.value - 1];
      attribute.mod = finalMod; // -1 to map the value to the array index
    }

    // Initiative
    systemData.initiative.base = 10 + systemData.level + systemData.attributes.dexterity.mod;
    systemData.initiative.total = systemData.initiative.base + systemData.initiative.divers

    // Attacks
    systemData.attacks.melee.base = systemData.level + systemData.attributes.strength.mod + 0
    systemData.attacks.melee.total = systemData.attacks.melee.base + systemData.attacks.melee.divers

    systemData.attacks.range.base = systemData.level + systemData.attributes.dexterity.mod + 0
    systemData.attacks.range.total = systemData.attacks.range.base + systemData.attacks.range.divers

    systemData.attacks.magic.base = systemData.level + systemData.attributes.intelligence.mod + 0
    systemData.attacks.magic.total = systemData.attacks.magic.base + systemData.attacks.magic.divers

    // Defense
    systemData.defense.base = 10 + systemData.attributes.dexterity.mod
    systemData.defense.total = systemData.defense.base // TODO add armor
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    console.log(data);

    // Add level for easier access, or fall back to 0.
    if (data.level) {
      data.lvl = data.level.value ?? 1;
    }
  }

}