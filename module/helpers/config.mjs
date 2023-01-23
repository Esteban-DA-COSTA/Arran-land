export const BOILERPLATE = {};
export const ARRANFOUNDRY = {};

/**
 * The set of Ability Scores used within the sytem.
 * @type {Object}
 */
 BOILERPLATE.abilities = {
  "str": "BOILERPLATE.AbilityStr",
  "dex": "BOILERPLATE.AbilityDex",
  "con": "BOILERPLATE.AbilityCon",
  "int": "BOILERPLATE.AbilityInt",
  "wis": "BOILERPLATE.AbilityWis",
  "cha": "BOILERPLATE.AbilityCha"
};

ARRANFOUNDRY.path_type = {
    "profile": "arranFoundry.path_profile",
    "race": "arranFoundry.path_race",
    "culture": "arranFoundry.path_culture",
    "prestige": "arranFoundry.path_prestige"
}

ARRANFOUNDRY.attributes = {
    "strength": "arranFoundry.attributes.strength",
    "dexterity": "arranFoundry.attributes.dexterity",
    "constitution": "arranFoundry.attributes.constitution",
    "intelligence": "arranFoundry.attributes.intelligence",
    "wisdom": "arranFoundry.attributes.wisdom",
    "charisma": "arranFoundry.attributes.charisma"
}

ARRANFOUNDRY.race = {
    "human": "arranFoundry.race.human",
    "elf": "arranFoundry.race.elf",
    "dwarf": "arranFoundry.race.dwarf",
    "green_skin": "arranFoundry.race.green_skin",

}

ARRANFOUNDRY.culture = {
    "human": {
        "north": "arranFoundry.culture.north",
        "east": "arranFoundry.culture.east",
        "west": "arranFoundry.culture.west",
        "south": "arranFoundry.culture.south"
    },
    "elf" : {
        "white": "arranFoundry.culture.white",
        "black": "arranFoundry.culture.black",
        "blue" : "arranFoundry.culture.blue",
        "forest": "arranFoundry.culture.forest",
        "half": "arranFoundry.culture.half_elf"
    },
    "dwarf": {
        "temple": "arranFoundry.culture.temple",
        "talion": "arranFoundry.culture.talion",
        "forge": "arranFoundry.culture.forge",
        "shield": "arranFoundry.culture.shield",
        "wanderers": "arranFoundry.culture.wanderers"
    },
    "green_skin": [
        "arranFoundry.culture.orc",
        "arranFoundry.culture.ogre",
        "arranFoundry.culture.goblin",
        "arranFoundry.culture.abomination"
    ]
}

ARRANFOUNDRY.defaultModificator = [
    -4, //0
    -4,
    -4,
    -3,
    -3,
    -2,
    -2,
    -1,
    -1,
    0, //10
    0,
    +1,
    +1,
    +2,
    +2,
    +3,
    +3,
    +4,
    +4,
    +5 //20
]