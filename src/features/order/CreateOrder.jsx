import { useState } from 'react';
import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import { createOrder } from '../../services/apiRestaurant';
import Button from '../../ui/Button';

// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) => /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(str);

const fakeCart = [
  {
    pizzaId: 12,
    name: 'Mediterranean',
    quantity: 2,
    unitPrice: 16,
    totalPrice: 32,
  },
  {
    pizzaId: 6,
    name: 'Vegetale',
    quantity: 1,
    unitPrice: 13,
    totalPrice: 13,
  },
  {
    pizzaId: 11,
    name: 'Spinach and Mushroom',
    quantity: 1,
    unitPrice: 15,
    totalPrice: 15,
  },
];

function CreateOrder() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const formErrors = useActionData();
  // const [withPriority, setWithPriority] = useState(false);
  const cart = fakeCart;

  return (
    <div>
      <h2>Ready to order? Let's go!</h2>

      <Form method="POST" action="">
        <div>
          <label>First Name</label>
          <input className="input" type="text" name="customer" required />
        </div>

        <div>
          <label>Phone number</label>
          <div>
            <input className="input" type="tel" name="phone" required />
          </div>
          {formErrors?.phone && <p>{formErrors.phone}</p>}
        </div>

        <div>
          <label>Address</label>
          <div>
            <input className="input" type="" name="address" placeholder="Enter your address..." required />
          </div>
        </div>

        <div>
          <input
            type="checkbox"
            name="priority"
            id="priority"
            className="h-6 w-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2"
            // value={withPriority}
            // onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label htmlFor="priority">Want to yo give your order priority?</label>
        </div>

        <div>
          <input type="hidden" name="cart" value={JSON.stringify(cart)} /> {/* convert cart object into a string (because form fields can only send text) */}
          <Button disabled={isSubmitting}>{isSubmitting ? 'Placing order...' : 'Order now'}</Button>
        </div>
      </Form>
    </div>
  );
}

// Write/Mutate data using action. When the Form is submitted, it will then create a request that will intercepted by the action function that is connected with React Router
export async function action({ request }) {
  const formData = await request.formData();
  // extracts the form data from the incoming request (usually a POST request) and returns FormData object that holds all the fields and values from the form
  const data = Object.fromEntries(formData);
  // convert FormData object into a plain JS object

  const order = {
    ...data,
    cart: JSON.parse(data.cart),
    priority: data.priority === 'on',
  };

  // Handling error when submitting the form
  const errors = {};
  if (!isValidPhone(order.phone)) errors.phone = 'Please give us correct phone number.';

  if (Object.keys(errors).length > 0) return errors;

  // If no error happens
  const newOrder = await createOrder(order); // return an object that coming back from the API as the response when calling the createOrder function

  // because cannot useNavigate hook inside a function => use redirect function instead to display the order status that using the getOrder function called from the API
  return redirect(`/order/${newOrder.id}`);
  // the newOrder object already contain the id and will be passed into the URL => fetch new order from the server and display using the getOrder function from the API
}

export default CreateOrder;
