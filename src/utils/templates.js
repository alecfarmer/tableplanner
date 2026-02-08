/**
 * Pre-built seating chart templates.
 */
export const SEATING_TEMPLATES = [
  {
    id: 'intimate-dinner',
    name: 'Intimate Dinner',
    description: '30 guests, 4 round tables + sweetheart',
    guests: 30,
    tables: [
      { label: 'Sweetheart Table', seats: 2, shape: 'sweetheart', x: 450, y: 40 },
      { label: 'Table 1', seats: 8, shape: 'round', x: 150, y: 280 },
      { label: 'Table 2', seats: 8, shape: 'round', x: 450, y: 280 },
      { label: 'Table 3', seats: 8, shape: 'round', x: 750, y: 280 },
      { label: 'Table 4', seats: 8, shape: 'round', x: 450, y: 530 },
    ],
  },
  {
    id: 'classic-wedding',
    name: 'Classic Wedding',
    description: '100 guests, 12 round tables + sweetheart',
    guests: 100,
    tables: [
      { label: 'Sweetheart Table', seats: 2, shape: 'sweetheart', x: 450, y: 40 },
      ...Array.from({ length: 12 }, (_, i) => ({
        label: `Table ${i + 1}`,
        seats: 8,
        shape: 'round',
        x: 80 + (i % 4) * 280,
        y: 260 + Math.floor(i / 4) * 260,
      })),
    ],
  },
  {
    id: 'banquet-hall',
    name: 'Banquet Hall',
    description: '80 guests, 8 long rectangular tables',
    guests: 80,
    tables: [
      { label: 'Sweetheart Table', seats: 2, shape: 'sweetheart', x: 400, y: 40 },
      ...Array.from({ length: 8 }, (_, i) => ({
        label: `Table ${i + 1}`,
        seats: 10,
        shape: 'rectangular',
        x: 100 + (i % 2) * 440,
        y: 250 + Math.floor(i / 2) * 220,
      })),
    ],
  },
  {
    id: 'garden-party',
    name: 'Garden Party',
    description: '60 guests, mixed round & rectangular',
    guests: 60,
    tables: [
      { label: 'Sweetheart Table', seats: 2, shape: 'sweetheart', x: 400, y: 40 },
      { label: 'Table 1', seats: 8, shape: 'round', x: 120, y: 280 },
      { label: 'Table 2', seats: 8, shape: 'round', x: 400, y: 280 },
      { label: 'Table 3', seats: 8, shape: 'round', x: 680, y: 280 },
      { label: 'Table 4', seats: 10, shape: 'rectangular', x: 200, y: 530 },
      { label: 'Table 5', seats: 10, shape: 'rectangular', x: 520, y: 530 },
      { label: 'Table 6', seats: 8, shape: 'round', x: 120, y: 750 },
      { label: 'Table 7', seats: 8, shape: 'round', x: 680, y: 750 },
    ],
  },
];

export function applyTemplate(templateId) {
  const template = SEATING_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return null;
  return template.tables.map((t) => ({
    id: crypto.randomUUID(),
    ...t,
  }));
}
