/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning document which manages this effect
 */
 export function onManageActiveEffect(event, owner) {
  event.preventDefault();
  const a = event.currentTarget;
  const li = a.closest("li");
  const effect = owner.effects.get(a.dataset.effect_id);
  switch ( a.dataset.action ) {
    case "create":
      return owner.createEmbeddedDocuments("ActiveEffect", [{
        label: "New Effect",
        icon: "icons/svg/aura.svg",
        origin: owner.uuid,
        "duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
        disabled: li.dataset.effectType === "inactive"
      }]);
    case "edit":
      return effect.sheet.render(true);
    case "delete":
      return effect.delete();
    case "toggle":
      return effect.update({disabled: !effect.disabled});
  }
}