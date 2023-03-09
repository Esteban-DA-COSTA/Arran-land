import {onManageActiveEffect} from "../helpers/effects.mjs";
import {ARRANFOUNDRY} from "../helpers/config.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class BoilerplateActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["boilerplate", "sheet", "actor"],
      template: "systems/arranFoundry/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }]
    });
  }

  /** @override */
  get template() {
    return `systems/boilerplate/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    for (let [k, v] of Object.entries(context.system.abilities)) {
      v.label = game.i18n.localize(CONFIG.BOILERPLATE.abilities[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const paths = {
      "race": {},
      "culture": {},
      "prestige": {},
      "profile": []
    }
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
    };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'weapon') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

}

export class ArranFoundryCharacterActorSheet extends ActorSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["boilerplate", "sheet", "actor"],
      template: "systems/arranFoundry/templates/actor/actor-sheet.html",
      width: 740,
      height: 820,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "general" }]
    });
  }

  get template() {
    return `systems/arranFoundry/templates/actor/actor-character-sheet.html`;
  }

  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.race = ARRANFOUNDRY.race;
    context.actorCulture = ARRANFOUNDRY.culture[actorData.system.race];


    // Prepare character data and items.
    this._prepareItems(context);

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    html.find('.rollable').click(this._onRoll.bind(this));

    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    html.find('.item-delete').click(ev => {
      const dataset = ev.currentTarget.dataset;
      let item;
      if (dataset.itemId) {
        item = this.actor.items.get(dataset.itemId);
      } else {
        const li = $(ev.currentTarget).parents(".item");
        item = this.actor.items.get(li.data("itemId"));
        li.slideUp(200, () => this.render(false));
      }
      item.delete();
    });


  }

  _prepareItems(context) {
    // Initialize containers.
    const weapons = [];
    const features = [];
    const armors = [];
    const paths = {
      "race": null,
      "culture": null,
      "prestige": null,
      "profile": []
    }

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to weapons.
      switch (i.type) {
        case "weapon":
          weapons.push(i);
          break;
        case "armor":
          armors.push(i);
          break;
        case "feature":
          features.push(i);
          break;
        case "path":
          switch (i.system.path_type) {
          case "race":
            paths.race = i;
            break;
          case "culture":
            paths.culture = i;
            break;
          case "prestige":
            paths.prestige = i;
            break;
          case "profile":
            if (paths.profile.length < 3)
              paths.profile.push(i);
            break;
        }break;
      }
    }

    // Assign and return
    context.weapons = weapons;
    context.armors = armors;
    context.features = features;
    context.paths = paths;
  }

  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const data = element.dataset;

    if (data.label === "recuperation") {
      if (this.actor.system.rp.value === 0) {
        return ChatMessage.create({content: game.i18n.localize("arranFoundry.msg.no_enough_resources")})
      } else {
        this.actor.system.rp.value--;
        const roll = new Roll(data.roll, this.actor.getRollData());
        const msg = game.i18n.localize("arranFoundry.msg.recuperation");
        roll.evaluate({async: false});
        this.actor.system.hp.value += roll.total;
        // Prevent gaining more hp than maximum
        if (this.actor.system.hp.value > this.actor.system.hp.max) {
          this.actor.system.hp.value = this.actor.system.hp.max;
        }
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({actor: this.actor}),
          rollMode: game.settings.get('core', 'rollMode'),
          flavor: msg
        });
        return roll;
      }
    } else if (data.label === "attribute") {
      const roll = new Roll(data.roll, this.actor.getRollData());
      const msg = game.i18n.localize("arranFoundry.msg.make_test") + " <b>" + game.i18n.localize(`arranFoundry.attributes.${data.field}`)+"</b>";
      roll.evaluate({async: false});
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({actor: this.actor}),
        rollMode: game.settings.get('core', 'rollMode'),
        flavor: msg
      });
      return roll;
    } else if (data.label === "attack") {
      const roll = new Roll(data.roll, this.actor.getRollData());
      const msg = game.i18n.localize("arranFoundry.msg.make_test") + " <b>" + game.i18n.localize(`arranFoundry.${data.type}_attack`)+"</b>";
      roll.evaluate({async: false});
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({actor: this.actor}),
        rollMode: game.settings.get('core', 'rollMode'),
        flavor: msg
      });
    }

  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    console.log(header);
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `${game.i18n.localize("arranFoundry.ui.new")} ${game.i18n.localize(`ITEM.Type${type.capitalize()}`)}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  async _onDropItem(event, data) {
    const targetNode = event.target;
    const itemTab = targetNode.closest(".items");
    const pathTab = targetNode.closest(".paths");
    const item = await Item.implementation.fromDropData(data);
    const itemData = item.toObject();

    const context = this.getData();

    if (itemData.type !== "path" && !!itemTab) {
      super._onDropItem(event, data);
    } else if(itemData.type === "path" && !!pathTab) {
      switch (itemData.system.path_type) {
        case "race":
          if (!context.paths.race) {
            super._onDropItem(event, data);
          } else {
            alert("already one");
          }
          break;
        case "culture":
          if (!context.paths.culture) {
            super._onDropItem(event, data);
          } else {
            alert("already one");
          }
          break;
        case "prestige":
          if (context.lv >=8) {
            if (!context.paths.profile) {
              super._onDropItem(event, data);
            }
          }
          break;
        case "profile":
          if (!context.paths.profile.length < 3) {
            super._onDropItem(event, data);
          }
          break;
      }
    }
    else {
      alert("Cannot drop here");
    }
  }

}