import { render } from '@testing-library/react';

import Card from './Card';
import { CardState, createCard, cardsByName } from '../gameState';

describe('card text', () => {
  function getCardElement(cardState: CardState) {
    const { baseElement } = render(<Card card={cardState} />);
    return baseElement;
  }

  it('renders damage', () => {
    const card = getCardElement(createCard({ target: 'opponent', damage: 5 }));

    expect(card.textContent).toMatchInlineSnapshot(`"5⚔️"`);
  });

  it('renders heal', () => {
    const card = getCardElement(createCard({ target: 'self', heal: 5 }));

    expect(card.textContent).toMatchInlineSnapshot(`"5❤️to self"`);
  });

  it('renders self damage', () => {
    const card = getCardElement(createCard({ target: 'self', damage: 5 }));

    expect(card.textContent).toMatchInlineSnapshot(`"5⚔️to self"`);
  });

  describe('with activations', () => {
    it('renders positive activations', () => {
      const card = getCardElement(createCard({ target: 'opponent', damage: 5, activations: 3 }));

      expect(card.textContent).toMatchInlineSnapshot(`"5⚔️3x times"`);
    });
    it('renders 0 activations', () => {
      const card = getCardElement(createCard({ target: 'opponent', damage: 5, activations: 0 }));

      expect(card.textContent).toMatchInlineSnapshot(`"5⚔️0x times"`);
    });
  });

  it('renders multiple card effects', () => {
    const card = getCardElement(
      createCard(
        { target: 'opponent', damage: 5, bleed: 2 },
        { target: 'self', dodge: 1, extraCardPlays: 1, strength: 1, activations: 2 },
      ),
    );

    expect(card.textContent).toMatchInlineSnapshot(`"5⚔️2🩸1🃏1💨1💪2x timesto self"`);
  });

  it('renders a status effect', () => {
    const card = getCardElement(createCard({ target: 'opponent', bleed: 2 }));

    expect(card.textContent).toMatchInlineSnapshot(`"2🩸"`);
  });

  it('renders trash self', () => {
    const card = getCardElement(createCard({ target: 'opponent', damage: 5, trashSelf: true }));

    expect(card.textContent).toMatchInlineSnapshot(`"5⚔️trash this card"`);
  });

  it('renders trash', () => {
    const card = getCardElement(createCard({ target: 'opponent', damage: 3, trash: 2 }));

    expect(card.textContent).toMatchInlineSnapshot(`"3⚔️2 trash"`);
  });

  it('renders conditionals', () => {
    const card = getCardElement(
      createCard({
        target: 'opponent',
        damage: 3,
        ifPlayerValue: {
          target: 'self',
          name: 'health',
          comparison: '<',
          compareToPlayerValue: {
            target: 'self',
            name: 'startingHealth',
          },
          multiplier: 0.5,
        },
      }),
    );

    expect(card.textContent).toMatchInlineSnapshot(`"3⚔️if self health < 50% self max health"`);
  });

  describe('with effect gains', () => {
    it('renders +damage for every bleed', () => {
      const card = getCardElement(
        createCard({
          target: 'opponent',
          gainEffectsList: [
            {
              effects: { damage: 1 },
              forEveryPlayerValue: { target: 'opponent', name: 'bleed' },
            },
          ],
        }),
      );

      expect(card.textContent).toMatchInlineSnapshot(`"+1⚔️ for every opponent 🩸"`);
    });

    it('renders damage and +times for every strength', () => {
      const card = getCardElement(
        createCard({
          target: 'opponent',
          damage: 2,
          gainEffectsList: [
            {
              effects: { activations: 1 },
              forEveryPlayerValue: { target: 'self', name: 'strength' },
            },
          ],
        }),
      );

      expect(card.textContent).toMatchInlineSnapshot(`"2⚔️+1x times for every self 💪"`);
    });

    it('renders double strength', () => {
      const card = getCardElement(
        createCard({
          target: 'self',
          gainEffectsList: [
            {
              effects: { strength: 1, trashSelf: true },
              forEveryPlayerValue: {
                target: 'self',
                name: 'strength',
              },
            },
          ],
        }),
      );

      expect(card.textContent).toMatchInlineSnapshot(
        `"+1💪, trash this card to self for every self 💪"`,
      );
    });

    it('renders damage X times for every health', () => {
      const card = getCardElement(
        createCard({
          target: 'opponent',
          damage: 1,
          activations: 0,
          gainEffectsList: [
            {
              effects: { activations: 1 },
              forEveryPlayerValue: { target: 'self', name: 'health' },
            },
          ],
        }),
      );

      expect(card.textContent).toMatchInlineSnapshot(`"1⚔️for every self health"`);
    });

    it('renders +dodge for every trashed card', () => {
      const card = getCardElement(
        createCard({
          target: 'self',
          gainEffectsList: [
            {
              effects: { dodge: 1 },
              forEveryPlayerValue: { target: 'self', name: 'trashedCards' },
            },
          ],
        }),
      );

      expect(card.textContent).toMatchInlineSnapshot(`"+1💨 to self for every self trashed cards"`);
    });

    it('renders +heal for every damage dealt', () => {
      const card = getCardElement(
        createCard(
          { target: 'opponent', damage: 2 },
          {
            target: 'self',
            gainEffectsList: [
              {
                effects: { heal: 1 },
                forEveryBattleStat: { name: 'damageDealt' },
              },
            ],
          },
        ),
      );

      expect(card.textContent).toMatchInlineSnapshot(`"2⚔️+1❤️ to self for every damage dealt"`);
    });

    it('renders conditionals', () => {
      const card = getCardElement(
        createCard({
          target: 'opponent',
          damage: 3,
          gainEffectsList: [
            {
              effects: { damage: 3, trashSelf: true },
              ifPlayerValue: {
                target: 'opponent',
                name: 'bleed',
                comparison: '>=',
                compareToValue: 3,
              },
            },
          ],
        }),
      );

      expect(card.textContent).toMatchInlineSnapshot(
        `"3⚔️+3⚔️, trash this card if opponent 🩸 >= 3"`,
      );
    });
  });

  it.each(Object.entries(cardsByName))(`renders %s`, (_, cardState) => {
    const card = getCardElement(cardState);

    expect(card.textContent).toMatchSnapshot();
  });
});
