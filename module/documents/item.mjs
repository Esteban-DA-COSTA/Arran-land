/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class BoilerplateItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
  getRollData() {
    // If present, return the actor's roll data.
    console.log("toto");
    if (this.type === "weapon") {
      console.log(this.system.mod);
      let formula = `${this.system.damage}[${game.i18n.localize('arranFoundry.damage')}]`;
      if ( this.actor ) {
        formula +="+"
        switch (this.system.mod) {
          case 'strength':
            formula += `${this.actor.system.attributes.strength.mod}[mod: ${game.i18n.localize('arranFoundry.attributes.strength')}]`
            break;
          case 'dexterity':
            formula += `${this.actor.system.attributes.dexterity.mod}[mod: ${game.i18n.localize('arranFoundry.attributes.dexterity')}]`
            break;
          case 'intelligence':
            formula += `${this.actor.system.attributes.intelligence.mod}[mod: ${game.i18n.localize('arranFoundry.attributes.intelligence')}]`
            break;
        }
      }
      return formula;
    }

    const rollData = this.actor.getRollData();
    // Grab the item's system data as well.
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `${game.i18n.localize('arranFoundry.msg.attack_with')} <b>${item.name}</b>`;

    // If there's no roll data, send a chat message.
    // Otherwise, create a roll and send a chat message from it.
    // Retrieve roll data.
    const rollData = this.getRollData();

    // Invoke the roll and submit it to chat.
    const roll = new Roll(rollData, rollData);
    // If you need to store the value first, uncomment the next line.
    roll.toMessage({
      speaker: speaker,
      rollMode: rollMode,
      flavor: label,
    });
    return roll;
  }
}
