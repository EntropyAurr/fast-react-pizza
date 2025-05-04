import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import { createOrder } from '../../services/apiRestaurant';
import { clearCart, getCart, getTotalCartPrice } from '../cart/cartSlice';
import { getUser } from '../user/userSlice';
import { formatCurrency } from '../../utils/helpers';
import store from '../../store.jsx';

import Button from '../../ui/Button';
import EmptyCart from '../cart/EmptyCart';

// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) => /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(str);

function CreateOrder() {
  const [withPriority, setWithPriority] = useState(false);

  const username = useSelector(getUser);
  const cart = useSelector(getCart);
  const totalCartPrice = useSelector(getTotalCartPrice);

  const priorityPrice = withPriority ? totalCartPrice * 0.2 : 0;
  const totalPrice = totalCartPrice + priorityPrice;

  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const formErrors = useActionData();

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

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="address" className="sm:basis-40">
            Address
          </label>
          <div className="flex-grow">
            <input className="input w-full" id="address" type="text" name="address" required placeholder="Enter your address" />
          </div>
        </div>

        <div className="mb-12 flex items-center gap-5">
          <input className="h-6 w-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2" type="checkbox" name="priority" id="priority" checked={withPriority} onChange={(e) => setWithPriority(e.target.checked)} />
          <label htmlFor="priority" className="font-medium">
            Want to yo give your order priority?
          </label>
        </div>

        <div>
          <input type="hidden" name="cart" value={JSON.stringify(cart)} />

          <Button disabled={isSubmitting} type="primary">
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

  const newOrder = await createOrder(order);

  const errors = {};
  if (!isValidPhone(order.phone)) errors.phone = 'Please give us your correct phone number.';

  if (Object.keys(errors).length > 0) return errors;

  store.dispatch(clearCart());

  return redirect(`/order/${newOrder.id}`);
}

export default CreateOrder;
