export class HealthDiceDialog extends FormApplication {
    constructor(actor) {
        super();
        this.actor = actor;
        console.log(this.actor);
        console.log('actor hd', this.actor.system.hd)
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['form'],
            popOut: true,
            template: `systems/arranFoundry/templates/dialogs/health_dice_dialog.html`,
            id: 'healthDiceDialog',
            title: 'Set health dice'
        });
    }

    getData() {
        return {
            hd: this.actor.system.hd
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

    async _updateObject(event, formData) {
        this.actor.system.hd = formData.hd;
        this.render();
    }

}

window.HealthDiceDialog = HealthDiceDialog;
