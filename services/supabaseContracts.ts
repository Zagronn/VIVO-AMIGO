export interface SupabaseAuthPort {
  getUser: () => Promise<{ id: string } | null>;
}

export interface SupabaseListingPort {
  createListing: (input: { title: string; category: 'ELECTRONICS' | 'VEHICLES' | 'REAL_ESTATE'; priceGTQ: number; imagePath?: string }) => Promise<{ id: string }>;
  subscribeToListings: (onChange: (event: unknown) => void) => () => void;
}

export interface SupabaseStoragePort {
  uploadListingImage: (file: Blob, path: string) => Promise<{ publicPath: string }>;
}

export interface SupabaseServicePorts {
  auth: SupabaseAuthPort;
  listings: SupabaseListingPort;
  storage: SupabaseStoragePort;
}

export function requireSupabasePorts(ports: SupabaseServicePorts | undefined): SupabaseServicePorts {
  if (!ports) throw new Error('Supabase auth, realtime, and storage adapters are not configured');
  return ports;
}