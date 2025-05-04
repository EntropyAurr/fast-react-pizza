import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import { createOrder } from '../../services/apiRestaurant';
import { clearCart, getCart, getTotalCartPrice } from '../cart/cartSlice';
import { fetchAddress, getUser } from '../user/userSlice';
import { formatCurrency } from '../../utils/helpers';
import store from '../../store.jsx';

import Button from '../../ui/Button';
import EmptyCart from '../cart/EmptyCart';

// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) => /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(str);

function CreateOrder() {
  const [withPriority, setWithPriority] = useState(false);

  const cart = useSelector(getCart);
  const totalCartPrice = useSelector(getTotalCartPrice);
  const { username, status: addressStatus, position, address, error: errorAddress } = useSelector(getUser);
  const isLoadingAddress = addressStatus === 'loading';

  const priorityPrice = withPriority ? totalCartPrice * 0.2 : 0;
  const totalPrice = totalCartPrice + priorityPrice;

  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const formErrors = useActionData();
  const dispatch = useDispatch();

  if (!cart.length) return <EmptyCart />;

  return (
    <div className="px-4 py-6">
      <h2 className="mb-8 text-xl font-semibold">Ready to order? Let's go!</h2>

      <Form method="POST" action="">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="name" className="sm:basis-40">
            First Name
          </label>
          <input className="input flex-grow" id="name" type="text" name="customer" required placeholder="Enter your name..." defaultValue={username} />
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="phone" className="sm:basis-40">
            Phone number
          </label>
          <div className="flex-grow">
            <input className="input w-full" id="phone" type="tel" name="phone" required placeholder="Enter your phone number..." />
            {formErrors?.phone && <p className="mt-2 rounded-full bg-red-100 p-2 pl-5 text-xs text-red-700">{formErrors.phone}</p>}
          </div>
        </div>

        <div className="relative mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="address" className="sm:basis-40">
            Address
          </label>
          <div className="flex-grow">
            <input className="input w-full" id="address" type="text" name="address" required placeholder="Enter your address" disabled={isLoadingAddress} defaultValue={address} />
            {addressStatus === 'error' && <p className="mt-2 rounded-full bg-red-100 p-2 pl-5 text-xs text-red-700">{errorAddress}</p>}
          </div>

          {!position.latitude && !position.longitude && (
            <span className="absolute right-[3px] top-[32px] z-50 sm:top-[1px] md:top-[2.5px]">
              <Button
                type="small"
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(fetchAddress());
                }}
                disabled={isLoadingAddress}>
                Get position
              </Button>
            </span>
          )}
        </div>

        <div className="mb-12 flex items-center gap-5">
          <input className="h-6 w-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2" type="checkbox" name="priority" id="priority" checked={withPriority} onChange={(e) => setWithPriority(e.target.checked)} />
          <label htmlFor="priority" className="font-medium">
            Want to yo give your order priority?
          </label>
        </div>

        <div>
          <input type="hidden" name="cart" value={JSON.stringify(cart)} />
          <input type="hidden" name="position" value={position.latitude && position.longitude ? `${position.latitude}, ${position.longitude}` : ''} />

          <Button disabled={isSubmitting || isLoadingAddress} type="primary">
            {isSubmitting ? 'Placing order...' : `Order now ${formatCurrency(totalPrice)}`}
          </Button>
        </div>
      </Form>
    </div>
  );
}

// Write/Mutate data using action. When the Form is submitted, it will then create a request that will intercepted by the action function that is connected with React Router
export async function action({ request }) {
  const formData = await request.formData(); // request.formData() is an async method that reading form submission and returns a FormData object
  const data = Object.fromEntries(formData); // convert to an object

  const order = {
    ...data,
    cart: JSON.parse(data.cart),
    priority: data.priority === 'true',
  };

  const errors = {};
  if (!isValidPhone(order.phone)) errors.phone = 'Please give us your correct phone number.';
  if (Object.keys(errors).length > 0) return errors;

  const newOrder = await createOrder(order);
  console.log(newOrder); // use to find the id of the order
  // when newOrder is created (Form is submitted) => hidden information in json file will be added to this new order: id, estimatedDelivery,...

  store.dispatch(clearCart());

  return redirect(`/order/${newOrder.id}`); // where does the id come from?
}

export default CreateOrder;
