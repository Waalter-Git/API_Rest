import { cookies } from 'next/headers';
import { AUTH_TOKEN_KEY } from '@/types/auth';
import type { AssetListResponse } from '@/types/dashboard';
import { AssetsDashboard } from '@/components/features/assets/assets-dashboard';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const emptyAssetsResponse = (): AssetListResponse => ({
  data: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
});

const loadAssets = async (): Promise<AssetListResponse> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_KEY)?.value;

  try {
    const response = await fetch(`${apiBaseUrl}/api/assets?page=1&limit=25`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: 'no-store',
    });

    if (!response.ok) {
      return emptyAssetsResponse();
    }

    return (await response.json()) as AssetListResponse;
  } catch {
    return emptyAssetsResponse();
  }
};

export default async function AssetsPage() {
  const initialData = await loadAssets();

  return <AssetsDashboard initialData={initialData} />;
}
