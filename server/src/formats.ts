import type { CatalogItem } from './products.ts';

/** Home decor, art and crafts → ONDC Home & Kitchen; wearables → Fashion. */
function ondcDomain(category: string) {
  return /apparel|saree|stole|dupatta|shawl|textile|fashion|jewel|bag|footwear/i.test(category) ? 'ONDC:RET12' : 'ONDC:RET16';
}

/**
 * ONDC retail (v1.2) `on_search` catalogue shape, grouped by artisan as provider.
 * A seller-side network participant can relay this directly; field mapping should be
 * validated against the NP's category-specific attribute requirements before go-live.
 */
export function toOndcCatalog(items: CatalogItem[], bppName = 'KarigarSetu') {
  const providers = new Map<string, { artisan: CatalogItem['artisan']; items: CatalogItem[] }>();
  for (const item of items) {
    const entry = providers.get(item.artisan.id) ?? { artisan: item.artisan, items: [] };
    entry.items.push(item);
    providers.set(item.artisan.id, entry);
  }

  return {
    'bpp/descriptor': { name: bppName, short_desc: 'Handmade products by government-supported artisans' },
    'bpp/providers': [...providers.values()].map(({ artisan, items: providerItems }) => {
      const locationId = `${artisan.id}-loc`;
      return {
        id: artisan.id,
        descriptor: { name: artisan.name, short_desc: artisan.craft, long_desc: `${artisan.craft} artisan from ${[artisan.district, artisan.state].filter(Boolean).join(', ')}` },
        locations: [{ id: locationId, address: { city: artisan.district ?? '', state: artisan.state ?? '', area_code: artisan.pincode ?? '' } }],
        items: providerItems.map((item) => ({
          id: item.id,
          descriptor: {
            name: item.title.en,
            code: item.hsnCode ? `4:${item.hsnCode}` : undefined,
            short_desc: item.highlights.join('. '),
            long_desc: item.description.en,
            images: item.images,
          },
          quantity: { available: { count: String(item.stock) }, maximum: { count: String(item.stock) } },
          price: { currency: 'INR', value: String(item.price.value), maximum_value: String(item.price.mrp) },
          category_id: item.category,
          location_id: locationId,
          '@ondc/org/returnable': false,
          '@ondc/org/cancellable': true,
          '@ondc/org/available_on_cod': false,
          '@ondc/org/time_to_ship': 'P5D',
          '@ondc/org/statutory_reqs_packaged_commodities': {
            manufacturer_or_packer_name: artisan.name,
            manufacturer_or_packer_address: [artisan.district, artisan.state, artisan.pincode].filter(Boolean).join(', '),
            common_or_generic_name_of_commodity: item.category,
            month_year_of_manufacture_packing_import: item.createdAt.slice(0, 7),
          },
          tags: [
            { code: 'origin', list: [{ code: 'country', value: 'IND' }] },
            { code: 'domain', list: [{ code: 'id', value: ondcDomain(item.category) }] },
            { code: 'attributes', list: [{ code: 'handmade', value: 'yes' }, { code: 'material', value: item.materials ?? '' }] },
          ],
        })),
      };
    }),
  };
}

const CSV_COLUMNS: [string, (item: CatalogItem) => string | number | null | undefined][] = [
  ['sku', (i) => i.sku],
  ['product_id', (i) => i.id],
  ['title_en', (i) => i.title.en],
  ['title_hi', (i) => i.title.hi],
  ['description_en', (i) => i.description.en],
  ['description_hi', (i) => i.description.hi],
  ['category', (i) => i.category],
  ['hsn_code', (i) => i.hsnCode],
  ['materials', (i) => i.materials],
  ['price_inr', (i) => i.price.value],
  ['mrp_inr', (i) => i.price.mrp],
  ['stock', (i) => i.stock],
  ['image_1', (i) => i.images[0]],
  ['image_2', (i) => i.images[1]],
  ['image_3', (i) => i.images[2]],
  ['artisan_name', (i) => i.artisan.name],
  ['craft', (i) => i.artisan.craft],
  ['state', (i) => i.artisan.state],
  ['district', (i) => i.artisan.district],
  ['pincode', (i) => i.artisan.pincode],
  ['udyam_number', (i) => i.artisan.udyamNumber],
  ['country_of_origin', () => 'India'],
  ['updated_at', (i) => i.updatedAt],
];

const csvCell = (value: string | number | null | undefined) => {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Flat sheet for bulk-upload portals (GeM seller catalogue, India Handmade Bazaar, B2B buyers). */
export function toCsv(items: CatalogItem[]) {
  const header = CSV_COLUMNS.map(([name]) => name).join(',');
  const rows = items.map((item) => CSV_COLUMNS.map(([, get]) => csvCell(get(item))).join(','));
  return [header, ...rows].join('\n');
}
