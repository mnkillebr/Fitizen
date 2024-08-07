import React, { useState, useRef, useCallback } from 'react';
import { Form, useActionData, useNavigation, useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { draggable, monitorForElements, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node';
import { getAllExercises } from '~/models/exercise.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const exercises = await getAllExercises(query);
  return json({ exercises })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }
  return null
}

type Card = {
  id: string;
  name: string;
};

type DeckCard = Card & {
  notes: string;
  rating: number;
};

// Define Zod schema for form validation
const deckSchema = z.object({
  name: z.string().min(1, 'Deck name is required'),
  description: z.string().optional(),
  cards: z.array(z.object({
    id: z.string(),
    name: z.string(),
    notes: z.string().optional(),
    rating: z.number().min(1).max(5),
  })).min(5, 'At least 5 cards are required'),
});

const DeckBuilderForm = () => {
  const { exercises } = useLoaderData<typeof loader>();
  const [deckCards, setDeckCards] = useState<DeckCard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const deckRef = useRef<HTMLDivElement>(null);
  const availableRef = useRef<HTMLDivElement>(null);

  const actionData = useActionData();
  const navigation = useNavigation();

  const handleDragStart = useCallback((event) => {
    const { source } = event;
    console.log('Drag started', event);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { source, location: destination } = event;
    console.log('Drag end', event);
    if (!destination) return;

    if (source.data.droppableId === 'availableCards' && destination.data.droppableId === 'deckCards') {
      const card = exercises.find(c => c.id === source.data.cardId);
      if (card) {
        const newId = `${card.id}-${Date.now()}`;
        const newDeckCard: DeckCard = { ...card, id: newId, notes: '', rating: 0 };
        setDeckCards(prev => [...prev, newDeckCard]);
      }
    } else if (source.data.droppableId === 'deckCards' && destination.data.droppableId === 'deckCards') {
      setDeckCards(prev => {
        const newDeckCards = [...prev];
        const [reorderedItem] = newDeckCards.splice(source.index, 1);
        newDeckCards.splice(destination.index, 0, reorderedItem);
        return newDeckCards;
      });
    }
  }, [exercises]);

  const handleCardSelect = (cardId: string) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedCards(new Set(deckCards.map(card => card.id)));
  };

  const handleDeselectAll = () => {
    setSelectedCards(new Set());
  };

  const handleDeleteSelected = () => {
    setDeckCards(prev => prev.filter(card => !selectedCards.has(card.id)));
    setSelectedCards(new Set());
  };

  const filteredAvailableCards = exercises.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  React.useEffect(() => {
    if (!deckRef.current || !availableRef.current) return;

    const cleanupFns: (() => void)[] = [];

    // Set up draggable for available cards
    filteredAvailableCards.forEach((card, index) => {
      const element = availableRef.current?.children[index] as HTMLElement;
      if (element) {
        const cleanup = draggable({
          element,
          data: { cardId: card.id, droppableId: 'availableCards', index },
        });
        cleanupFns.push(cleanup);
      }
    });

    // Set up draggable for deck cards
    deckCards.forEach((card, index) => {
      const element = deckRef.current?.children[index] as HTMLElement;
      if (element) {
        const cleanup = draggable({
          element,
          data: { cardId: card.id, droppableId: 'deckCards', index },
        });
        cleanupFns.push(cleanup);
      }
    });

    // Set up drop targets
    const deckDropCleanup = dropTargetForElements({
      element: deckRef.current,
      getData: () => ({ droppableId: 'deckCards' }),
    });
    cleanupFns.push(deckDropCleanup);

    const availableDropCleanup = dropTargetForElements({
      element: availableRef.current,
      getData: () => ({ droppableId: 'availableCards' }),
    });
    cleanupFns.push(availableDropCleanup);

    // Set up drag monitor
    const monitorCleanup = monitorForElements({
      onDragStart: handleDragStart,
      onDrop: handleDragEnd,
    });
    cleanupFns.push(monitorCleanup);

    return () => {
      cleanupFns.forEach(cleanup => cleanup());
    };
  }, [filteredAvailableCards, deckCards, handleDragStart, handleDragEnd]);

  return (
    <Form method="post" className="flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-bold mb-4">Create New Deck</h2>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block mb-2">Description</label>
          <textarea
            id="description"
            name="description"
            className="w-full border rounded p-2"
          />
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Deck</h3>
          <div className="flex gap-2 mb-2">
            <button type="button" onClick={handleSelectAll} className="bg-blue-500 text-white px-2 py-1 rounded">Select All</button>
            <button type="button" onClick={handleDeselectAll} className="bg-blue-500 text-white px-2 py-1 rounded">Deselect All</button>
            <button type="button" onClick={handleDeleteSelected} className="bg-red-500 text-white px-2 py-1 rounded">Delete Selected</button>
          </div>
          <div ref={deckRef} className="border p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
            {deckCards.map((card, index) => (
              <div key={card.id} className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded">
                <input
                  type="checkbox"
                  checked={selectedCards.has(card.id)}
                  onChange={() => handleCardSelect(card.id)}
                />
                <div className="w-10 h-10 bg-gray-300 flex items-center justify-center text-xs">
                  Image
                </div>
                <span>{card.name}</span>
                <input
                  type="text"
                  name={`cards[${index}].notes`}
                  placeholder="Notes"
                  className="flex-grow border rounded px-2 py-1"
                />
                <input
                  type="number"
                  name={`cards[${index}].rating`}
                  min="1"
                  max="5"
                  required
                  className="w-16 border rounded px-2 py-1"
                />
                <input type="hidden" name={`cards[${index}].id`} value={card.id} />
                <input type="hidden" name={`cards[${index}].name`} value={card.name} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={navigation.state === 'submitting'}>
            {navigation.state === 'submitting' ? 'Saving...' : 'Save'}
          </button>
        </div>
        {actionData?.errors && (
          <div className="mt-4 text-red-500">
            <ul>
              {Object.values(actionData.errors).map((error: any) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-bold mb-4">Available Cards</h2>
        <input
          type="text"
          placeholder="Search cards..."
          className="w-full border rounded p-2 mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div ref={availableRef} className="border p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
          {filteredAvailableCards.map((card) => (
            <div key={card.id} className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded">
              <div className="w-10 h-10 bg-gray-300 flex items-center justify-center text-xs">
                Image
              </div>
              <span>{card.name}</span>
            </div>
          ))}
        </div>
      </div>
    </Form>
  );
};

export default DeckBuilderForm;