// Import document classes.
import {ArranFoundryActor, BoilerplateActor} from "./documents/actor.mjs";
import { BoilerplateItem } from "./documents/item.mjs";
// Import sheet classes.
import {ArranFoundryCharacterActorSheet, BoilerplateActorSheet} from "./sheets/actor-sheet.mjs";
import {
  ArranFoundryArmorItemSheet,
  ArranFoundryItemSheet, ArranFoundryPathItemSheet, ArranFoundrySpellItemSheet, ArranFoundryWeaponItemSheet,

} from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { BOILERPLATE } from "./helpers/config.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.boilerplate = {
    BoilerplateActor,
    BoilerplateItem,
    rollItemMacro
  };

  game.arranFoundry = {
    ArranFoundryActor
  }

  // Add custom constants for configuration.
  CONFIG.BOILERPLATE = BOILERPLATE;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "@initiative.total",
    decimals: 0
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = ArranFoundryActor;
  CONFIG.Item.documentClass = BoilerplateItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("arranFoundry", BoilerplateActorSheet, { makeDefault: true });
  Actors.registerSheet("arranFoundry", ArranFoundryCharacterActorSheet, { label: game.i18n.localize("arranFoundry.config.character_sheet"), type: ["character"], makeDefault: true })
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("arranFoundry", ArranFoundryItemSheet, { label: game.i18n.localize("arranFoundry.config.default_sheet"), makeDefault: true });
  Items.registerSheet("arranFoundry", ArranFoundryPathItemSheet, { label: game.i18n.localize("arranFoundry.config.path_sheet"), type: ["path"], makeDefault: true })
  Items.registerSheet("arranFoundry", ArranFoundryWeaponItemSheet, { label: game.i18n.localize("arranFoundry.config.weapon_sheet"), type: ["weapon"], makeDefault: true })
  Items.registerSheet("arranFoundry", ArranFoundrySpellItemSheet, { label: game.i18n.localize("arranFoundry.config.spell_sheet"), type: ["spell"], makeDefault: true })
  Items.registerSheet("arranFoundry", ArranFoundryArmorItemSheet, { label: game.i18n.localize("arranFoundry.config.armor_sheet"), type: ["armor"], makeDefault: true })

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.boilerplate.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "boilerplate.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }

    // Trigger the item roll
    item.roll();
  });
}