import { Empty } from 'antd';
import { PageBody } from '@app/shared/components/Page';
import { DealsHeader } from './components/DealsHeader';
import { DealsTable } from './components/DealsTable';
import { useDealsFilters } from './useDealsFilters';

/** Реестр сделок */
export default function Deals() {
  const { filters, update, apiParams, hasFilters } = useDealsFilters();

  return (
    <>
      <DealsHeader filters={filters} hasFilters={hasFilters} onChange={update} />
      <PageBody wide>
        {filters.view === 'list' ? (
          <DealsTable params={apiParams} onPageChange={(page) => update({ page })} />
        ) : (
          <Empty description="Канбан — в разработке" />
        )}
      </PageBody>
    </>
  );
}
