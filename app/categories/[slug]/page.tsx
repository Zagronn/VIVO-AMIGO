import { CategoryShowcase } from '@/components/CategoryShowcase';

export const dynamicParams = true;

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return <CategoryShowcase slug={params.slug} />;
}
