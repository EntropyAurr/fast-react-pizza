import { useRouteError } from 'react-router-dom';
import LinkButton from './LinkButton';

function Error() {
  const error = useRouteError();

  return (
    <div>
      <h1>Something went wrong 😢</h1>
      <p>{error.data || error.message}</p> {/* if no data for fetching => show the error's message */}
      <LinkButton to="-1">&larr; Go back</LinkButton>
    </div>
  );
}

export default Error;
