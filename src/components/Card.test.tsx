import { render } from '@testing-library/react';

import Card from './Card';
import { CardState, createCard } from '../gameState';

describe('card text', () => {
  function getCardElement(cardState: CardState) {
    const { baseElement } = render(<Card card={cardState} />);
    return baseElement;
  }

  it('renders damage', () => {
    const card = getCardElement(createCard({ target: 'opponent', damage: 5 }));

    expect(card.textContent).toMatchInlineSnapshot(`"5⚔️"`);
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

  it('renders trash', () => {
    const card = getCardElement(createCard({ target: 'opponent', damage: 5, trashSelf: true }));

    expect(card.textContent).toMatchInlineSnapshot(`"5⚔️trash"`);
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

      expect(card.textContent).toMatchInlineSnapshot(`"1⚔️for every self ❤️"`);
    });

    it('+dodge for every trashed card', () => {
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

      expect(card.textContent).toMatchInlineSnapshot(`"+1💨 for every self trashed cardsto self"`);
    });
  });
});
