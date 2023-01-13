import {ARRANFOUNDRY} from "../helpers/config.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ArranFoundryItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["boilerplate", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/arranFoundry/templates/item";

    return `${path}/item-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
  }
}

export class ArranFoundrySpellItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["boilerplate", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/arranFoundry/templates/item";

    return `${path}/item-spell-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
  }
}

export class ArranFoundryWeaponItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["boilerplate", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/arranFoundry/templates/item";
    return `${path}/item-weapon-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
    html.find("#attack_button").click(this.rollAttack.bind(this))
  }

  async rollAttack(event) {
    event.preventDefault();

    const element = event.currentTarget;

    const data = element.dataset;
    // Check that there is a formula to attack
    if (!data.roll && data.roll === "") {
      await ChatMessage.create({content: "<b>No rolling damage information</b>"});
      // chatLog.postOne(chat, {notify: true});
      return;
    }
    console.log(this.actor);
    const roll = new Roll(data.roll);
    roll.evaluate({async: false});
    roll.toMessage({label: game.i18n.localize("arranFoundry.attack"), flavor: game.i18n.localize("arranFoundry.damage")}).then((msg) => {
      console.log(msg);

    });

    chat.rolls = [roll];
    chat.sound = "sounds/dice.wav";
    chat.type = 5;
    chat.content = roll.result;
    console.log("chat");

    console.log(chat);
    // chatLog.postOne(chat, {notify: true})

  }

}

export class ArranFoundryPathItemSheet extends ItemSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["boilerplate", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  get template() {
    return "systems/arranFoundry/templates/item/item-path-sheet.html";
  }

  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.path_type = ARRANFOUNDRY.path_type;
    context.flags = itemData.flags;

    console.log(itemData.system);

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
  }

  _updateObject(event, formData) {

    // Get the object data
    const itemData = this.object;

    // create the final form Data
    let newFormData = {};
    newFormData.system = {};

    newFormData.img = formData.img;
    newFormData.name = formData.name;
    newFormData.system.path_type = formData.path_type;
    newFormData.system.skills = [];

    // For each skill, map the input value
    itemData.system.skills.forEach((skill, index) => {
      newFormData.system.skills.push({
        name: formData.skill_name[index],
        description: formData.skill_description[index],
        isAcquired: formData.skill_isAcquired[index],
        level: [index+1]
      });
    })
    this.item.update(newFormData);
    return Promise.resolve();
  }
}
