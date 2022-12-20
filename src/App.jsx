import { Wrapper } from "@googlemaps/react-wrapper";
import Map from './Map'
import './app.css'

const App = () => {
  const render = (status) => {
    return <h1>{status}</h1>;
  };

  return (
    <Wrapper
      render={render}
      libraries={['places']}
      apiKey={"AIzaSyDrvk6bbmmOnipvYEUMUicbgMvU5_kCgTs"}
    >
      <Map />
    </Wrapper>
  )
}

export default App