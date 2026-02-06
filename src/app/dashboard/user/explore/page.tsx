import { createClient } from '@/utils/supabase/server';
import { ExploreClient } from '@/components/dashboard/user/ExploreClient';

// Force dynamic because we use searchParams
export const dynamic = 'force-dynamic';

// 1. Update Props Type to use Promise
interface ExplorePageProps {
  searchParams: Promise<{ query?: string; sort?: string }>;
}

export default async function ExplorePage(props: ExplorePageProps) {
  const supabase = await createClient();
  
  // 2. Await the searchParams before using them
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const sort = searchParams?.sort || 'newest';

  // 3. Build Query
  let dbQuery = supabase
    .from('vehicles')
    .select(`
      *,
      saccos ( name, logo_url )
    `)
    .eq('is_available', true);

  // 4. Apply Filters
  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,plate_number.ilike.%${query}%`);
  }

  // 5. Apply Sort
  switch (sort) {
    case 'price_asc': dbQuery = dbQuery.order('rate_per_hour', { ascending: true }); break;
    case 'price_desc': dbQuery = dbQuery.order('rate_per_hour', { ascending: false }); break;
    case 'capacity_desc': dbQuery = dbQuery.order('capacity', { ascending: false }); break;
    default: dbQuery = dbQuery.order('created_at', { ascending: false });
  }

  const { data: vehicles } = await dbQuery;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Explore Fleet</h1>
        <p className="text-muted-foreground">Find the perfect Nganya for your next trip.</p>
      </div>

      <ExploreClient 
        vehicles={vehicles || []} 
        searchQuery={query} 
      />
    </div>
  );
}