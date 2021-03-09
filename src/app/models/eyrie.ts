import { TranslateService } from '@ngx-translate/core';
import { Bot, BotName } from './bot';

export class EyrieBot extends Bot {

  public name: BotName = 'Eyrie';

  public setupPosition = 'B';
  public setupRules = [
    `Setup0`,
    `Setup1`,
    `Setup3`
  ];

  public difficultyDescriptions = {
    Easy: `Easy`,
    Normal: 'Normal',
    Challenging: `Challenging`,
    Nightmare: `Nightmare`
  };

  public rules = [
    {
      traitName: 'Poor Manual Dexterity',
      name: 'RulePoorManualDexterity',
      text: `TextPoorManualDexterity`,
      isActive: true
    },
    {
      traitName: 'Hates Surprises',
      name: 'RuleHatesSurprises',
      text: 'TextHatesSurprises',
      isActive: true
    },
    {
      traitName: 'Lords of the Forest',
      name: 'RuleLordsOfTheForest',
      text: 'TextLordsOfTheForest',
      isActive: true
    },
    {
      traitName: 'Nobility',
      name: 'RuleNobility',
      text: 'TextNobility',
      canToggle: true
    },
    {
      traitName: 'Relentless',
      name: 'RuleRelentless',
      text: 'TextRelentless',
      canToggle: true
    },
    {
      traitName: 'Swoop',
      name: 'RuleSwoop',
      text: `TextSwoop`,
      canToggle: true
    },
    {
      traitName: 'War Tax',
      name: 'RuleWarTax',
      text: `TextWarTax`,
      canToggle: true
    },
  ];

  public customData = {
    decree: {
      fox: 0,
      mouse: 0,
      bunny: 0,
      bird: 2
    },

    buildings: []
  };

  public setup(): void {
    this.customData.decree.bird = this.difficulty === 'Easy' ? 1 : 2;
  }

  public birdsong(translate: TranslateService) {
    const newRoost = !this.customData.buildings.some(Boolean);

    const base = [
      translate.instant(`SpecificBirdsong.Electric Eyrie.RevealOrder`),
      translate.instant(`SpecificBirdsong.Electric Eyrie.CraftOrder`),
      translate.instant(`SpecificBirdsong.Electric Eyrie.DecreeOrder`)
    ];

    if (newRoost) {
      base.push(translate.instant(`SpecificBirdsong.Electric Eyrie.NewRoost`));
    }

    return base;
  }

  public daylight(translate: TranslateService) {
    const actions = [];

    let mostVal = 0;
    let mostSuit = '';
    let mostSuits = [];
    ['fox', 'mouse', 'bunny', 'bird'].forEach(suit => {
      if (this.customData.decree[suit] < mostVal) { return; }

      // hold onto info if there is ever a tie
      if (this.customData.decree[suit] === mostVal) {
        mostSuits.push(suit);
        return;
      }

      mostVal = this.customData.decree[suit];
      mostSuit = suit;

      // reset if we get here
      mostSuits = [suit];
    });

    // if we have a tie for the most, we don't have a most
    if (mostSuits.length > 1) {
      mostSuit = '';
      mostVal = 0;
    }

    ['recruit', 'move', 'battle'].forEach(curAction => {
      ['fox', 'mouse', 'bunny', 'bird'].forEach(suit => {
        const totalForSuit = this.customData.decree[suit];
        if (totalForSuit === 0) { return; }

        const suitText = `**card:${suit}**`;

        switch (curAction) {
          case 'recruit': {

            const recruitText = this.hasTrait('Nobility')
              ? translate.instant('SpecificDaylight.Electric Eyrie.ExtraRecruit')
              : '';

            actions.push(translate.instant('SpecificDaylight.Electric Eyrie.Recruit', { totalForSuit, suitText, recruitText }));
            break;
          }

          case 'move': {
            actions.push(translate.instant('SpecificDaylight.Electric Eyrie.Move', { totalForSuit, suitText }));
            break;
          }

          case 'battle': {
            let extraHit = '';
            if (suit === mostSuit) { extraHit = translate.instant('SpecificDaylight.Electric Eyrie.ExtraHit'); }
            actions.push(translate.instant('SpecificDaylight.Electric Eyrie.Battle', { totalForSuit, suitText, extraHit }));
            break;
          }
        }
      });
    });

    if (actions.length === 0) {
      return [
        translate.instant('SpecificDaylight.Electric Eyrie.ExtraDecree')
      ];
    }

    if (this.hasTrait('Relentless')) {
      actions.push(translate.instant('SpecificDaylight.Electric Eyrie.ExtraRelentless'));
    }

    actions.push(translate.instant('SpecificDaylight.Electric Eyrie.ExtraBuild'));

    if (this.hasTrait('Swoop')) {
      actions.push(translate.instant('SpecificDaylight.Electric Eyrie.ExtraSwoop'));
    }

    return actions;
  }

  public evening(translate: TranslateService) {

    const score = Math.max(0, this.customData.buildings.reduce((prev, cur) => prev + (cur ? 1 : 0), 0) - 1);

    const base = [
      this.createMetaData('score', score, translate.instant('SpecificEvening.Electric Eyrie.Score', { score }))
    ];

    if (this.difficulty === 'Nightmare') {
      base.push(
        this.createMetaData('score', 1, translate.instant('SpecificEvening.Electric Eyrie.NightmareScore'))
      );
    }

    return base
  }

  public turmoil(translate: TranslateService) {
    const base = [
      this.createMetaData('text', '', translate.instant('SpecificExtra.Electric Eyrie.Purge')),
      this.createMetaData('text', '', translate.instant('SpecificExtra.Electric Eyrie.Evening'))
    ];

    const score = this.customData.decree.bird

    if (this.hasTrait('Nobility')) {
      base.unshift(
        this.createMetaData('score', score, translate.instant('SpecificExtra.Electric Eyrie.YesNobility', { score }))
      );
    } else {
      base.unshift(
        this.createMetaData('score', -score, translate.instant('SpecificExtra.Electric Eyrie.NoNobility', { score }))
      );
    }

    return base;
  }
}
