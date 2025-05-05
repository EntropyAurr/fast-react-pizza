import { useEffect } from 'react';
import { useFetcher, useLoaderData } from 'react-router-dom';
import { getOrder } from '../../services/apiRestaurant';
import { calcMinutesLeft, formatCurrency, formatDate } from '../../utils/helpers';
import OrderItem from '../order/OrderItem';
import UpdateOrder from './UpdateOrder';

function Order() {
  const order = useLoaderData();
  const fetcher = useFetcher();

  // use fetcher when the component first-mounted
  useEffect(
    function () {
      if (!fetcher.data && fetcher.state === 'idle') fetcher.load('/menu'); // load the data and store in the fetcher object and allow to retrieve the data from there whenever we want
    },
    [fetcher],
  );
  console.log(fetcher.data);

  // Everyone can search for all orders, so for privacy reasons we're gonna gonna exclude names or address, these are only for the restaurant staff
  const { id, status, priority, priorityPrice, orderPrice, estimatedDelivery, cart } = order; // id, orderPrice, estimatedDelivery ??
  const deliveryIn = calcMinutesLeft(estimatedDelivery);

  return (
    <div className="space-y-8 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Order #{id} status</h2>
        <div className="space-x-2">
          {priority && <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-red-50">Priority</span>}
          <span className="rounded-full bg-green-500 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-green-50">{status} order</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-200 px-6 py-5">
        <p className="font-medium">{deliveryIn >= 0 ? `Only ${calcMinutesLeft(estimatedDelivery)} minutes left 😃` : 'Order should have arrived'}</p>
        <p className="text-sm text-stone-500">(Estimated delivery: {formatDate(estimatedDelivery)})</p>
      </div>

      <ul className="divide-y divide-stone-200 border-b border-t">
        {cart.map((item) => (
          <OrderItem item={item} key={item.pizzaId} isLoadingIngredients={fetcher.state === 'loading'} ingredients={fetcher?.data?.find((el) => el.id === item.pizzaId)?.ingredients ?? []} /> // if ingredients is undefined (still loading) => return an empty array []
        ))}
      </ul>

      <div className="space-y-2 bg-stone-200 px-6 py-5">
        <p className="text-sm font-medium">Price pizza: {formatCurrency(orderPrice)}</p>
        {priority && <p className="text-sm font-medium">Price priority: {formatCurrency(priorityPrice)}</p>}
        <p className="font-semibold">To pay on delivery: {formatCurrency(orderPrice + priorityPrice)}</p>
      </div>

      {!priority && <UpdateOrder order={order} />}
    </div>
  );
}

export async function loader({ params }) {
  const order = await getOrder(params.orderId);
  return order;
}

export default Order;
