import type { Order, Product } from '@/types';

const DAY = 24 * 60 * 60 * 1000;

export function sampleProducts(now = Date.now()): Product[] {
  return [
    {
      id: 'sample-1',
      title: 'Hand-painted Terracotta Pot',
      description:
        'A terracotta planter shaped on the wheel and painted by hand with traditional tribal motifs using natural colours. Sturdy enough for indoor plants and striking as a decor piece on its own.',
      highlights: ['Natural clay, hand-thrown', 'Painted with natural colours', 'Each piece is unique'],
      category: 'Home Decor',
      price: 650,
      stock: 12,
      image: 'https://images.pexels.com/photos/34144282/pexels-photo-34144282.jpeg?auto=compress&cs=tinysrgb&w=900',
      channels: ['ONDC', 'B2B'],
      status: 'published',
      costBreakdown: { material: 180, labour: 320, margin: 150 },
      createdAt: now - 6 * DAY,
    },
    {
      id: 'sample-2',
      title: 'Handwoven Cotton Saree',
      description:
        'A soft, breathable cotton saree woven on a handloom with naturally dyed yarn. Comfortable for everyday wear with a border elegant enough for festive occasions.',
      highlights: ['Handloom woven', 'Natural dyes', 'Breathable pure cotton'],
      category: 'Apparel',
      price: 2400,
      stock: 4,
      image: 'https://images.pexels.com/photos/31854096/pexels-photo-31854096.jpeg?auto=compress&cs=tinysrgb&w=900',
      channels: ['ONDC', 'GeM', 'B2B'],
      status: 'published',
      costBreakdown: { material: 900, labour: 1100, margin: 400 },
      createdAt: now - 3 * DAY,
    },
    {
      id: 'sample-3',
      title: 'Silver Filigree Earrings',
      description:
        'Lightweight earrings made with fine silver filigree, a technique passed down through generations of Cuttack artisans. Nickel-free and comfortable for long wear.',
      highlights: ['Cuttack filigree work', 'Lightweight', 'Nickel-free silver'],
      category: 'Jewellery',
      price: 1450,
      stock: 0,
      image: 'https://images.pexels.com/photos/9871565/pexels-photo-9871565.jpeg?auto=compress&cs=tinysrgb&w=900',
      channels: ['ONDC'],
      status: 'draft',
      costBreakdown: { material: 700, labour: 450, margin: 300 },
      createdAt: now - DAY,
    },
  ];
}

export function sampleOrders(now = Date.now()): Order[] {
  const [pot, saree] = sampleProducts(now);
  return [
    { id: 'KS-1042', productTitle: pot.title, image: pot.image, qty: 2, total: 1300, buyer: 'Ananya S.', city: 'Bengaluru', channel: 'ONDC', status: 'new', createdAt: now - 2 * 60 * 60 * 1000 },
    { id: 'KS-1039', productTitle: saree.title, image: saree.image, qty: 1, total: 2400, buyer: 'Craft House', city: 'Jaipur', channel: 'B2B', status: 'packed', createdAt: now - DAY },
    { id: 'KS-1031', productTitle: pot.title, image: pot.image, qty: 10, total: 6500, buyer: 'District Office', city: 'Bhubaneswar', channel: 'GeM', status: 'delivered', createdAt: now - 4 * DAY },
  ];
}

/** Sample rows carry fixed ids so the Settings switch can take them back out again. */
export const isSampleProduct = (id: string) => id.startsWith('sample-');
export const isSampleOrder = (id: string) => sampleOrders(0).some((o) => o.id === id);
