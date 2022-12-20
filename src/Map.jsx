import { useEffect, useRef, useState } from 'react'

const Map = () => {
   const mapRef = useRef(null);
   const searchRef = useRef(null);
   const [map, setMap] = useState();
   const [marker, setMarker] = useState();
   const [location, setLocation] = useState();

   const loadGoogleMap = (position) => {
      if (!mapRef.current || !searchRef.current) return

      const center = {
         lat: position.coords.latitude,
         lng: position.coords.longitude,
      };

      const map = new window.google.maps.Map(mapRef.current, {
         zoom: 13,
         center: center,
      });

      map.addListener("bounds_changed", () => {
         searchBox.setBounds(map.getBounds());
      })

      const marker = new window.google.maps.Marker({
         map: map,
         draggable: true,
         position: center,
      });

      const searchBox = new window.google.maps.places.SearchBox(searchRef.current);

      let markers = []

      searchBox.addListener("places_changed", () => {
         const places = searchBox.getPlaces();

         if (places.length == 0) {
            return
         }

         const place = places[0]

         if (!place.geometry || !place.geometry.location) {
            console.log("Returned place contains no geometry");
            return;
         }

         const searchMarker = new google.maps.Marker({
            map,
            draggable: true,
            title: place.name,
            position: place.geometry.location,
         });

         markers.forEach((marker) => marker.setMap(null));
         markers = [searchMarker]

         const searchCenter = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
         }

         map.setOptions({
            center: searchCenter
         })

         setMap(map)
         setMarker(searchMarker)
         setLocation(searchCenter)
      })

      setMap(map)
      setMarker(marker)
      setLocation(center)
   }

   const setCurrentLocation = () => {
      if (map) {
         return
      }

      if (!navigator.geolocation) {
         handleGeolocationError(false)
         return
      }

      navigator.geolocation.getCurrentPosition(
         loadGoogleMap,
         () => handleGeolocationError(true)
      )
   }

   const addMarkerEvent = () => {
      if (!marker) return

      marker.addListener('mouseup', (event) => {
         setLocation({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
         })
      })
   }

   const handleGeolocationError = (browserHasGeolocation) => () => {
      console.log(
         browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
      )
   }

   useEffect(() => {
      return () => {
         setMap()
         setMarker()
         setLocation()
      }
   }, []);

   useEffect(() => {
      setCurrentLocation()
   }, [mapRef, map]);

   useEffect(() => {
      addMarkerEvent()
   }, [marker]);

   return (
      <div className="map-wrapper">
         <div className="d-flex py-1">
            <input
               type="text"
               ref={searchRef}
               placeholder="Search location"
               className="form-control form-control-sm mx-1"
            />
            <input
               type="text"
               disabled={true}
               value={location ? `${location.lat}, ${location.lng}` : ''}
               className="form-control form-control-sm mx-1"
            />
         </div>

         <div
            ref={mapRef}
            className="map"
         />
      </div>
   )
}

export default Map