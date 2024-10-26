import { useRef, useState, useEffect, useCallback } from "react";

import Places from "./components/Places";
import { AVAILABLE_PLACES } from "./data";
import Modal from "./components/Modal";
import DeleteConfirmation from "./components/DeleteConfirmation";
import logoImg from "./assets/logo.png";
import { sortPlacesByDistance } from "./loc";

const storedIds = JSON.parse(localStorage.getItem("selectedPlaces")) || [];
const storedPlaces = storedIds.map((id) => {
  return AVAILABLE_PLACES.find((place) => place.id === id);
});

function App() {
  const selectedPlace = useRef();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [availiblePlaces, setAvailiblePlaces] = useState([]);
  const [pickedPlaces, setPickedPlaces] = useState(storedPlaces);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const sortedPlacesArray = sortPlacesByDistance(
        AVAILABLE_PLACES,
        position.coords.latitude,
        position.coords.longitude
      );
      setAvailiblePlaces(sortedPlacesArray);
    });
  }, []);

  function handleStartRemovePlace(id) {
    setModalIsOpen(true);
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  function handleSelectPlace(id) {
    setPickedPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === id)) {
        return prevPickedPlaces;
      }
      const place = AVAILABLE_PLACES.find((place) => place.id === id);
      return [place, ...prevPickedPlaces];
    });
    const storedIds = JSON.parse(localStorage.getItem("selectedPlaces")) || [];
    if (storedIds.indexOf(id) === -1) {
      localStorage.setItem(
        "selectedPlaces",
        JSON.stringify([id, ...storedIds])
      );
    }
  }
  const handleRemovePlace = useCallback(function () {
    setPickedPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
    );
    setModalIsOpen(false);
    const storedIds = JSON.parse(localStorage.getItem("selectedPlaces")) || [];
    localStorage.setItem(
      "selectedPlaces",
      JSON.stringify(storedIds.filter((id) => selectedPlace.current !== id))
    );
  }, []);

  return (
    <>
      <Modal open={modalIsOpen}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText={"Select the places you would like to visit below."}
          places={pickedPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <Places
          title="Available Places"
          places={availiblePlaces}
          fallbackText="Sorting places by distance..."
          onSelectPlace={handleSelectPlace}
        />
      </main>
    </>
  );
}

export default App;
