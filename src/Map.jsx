import { useEffect, useRef, useState } from 'react'

const Map = () => {
   const mapRef = useRef(null);
   const searchRef = useRef(null);
   const [loaded, setLoaded] = useState();
   const [map, setMap] = useState();
   const [marker, setMarker] = useState();
   const [location, setLocation] = useState();
   const [city, setCity] = useState();
   const [myCity, setMyCity] = useState();
   const [myLocation, setMyLocation] = useState();

   const setSearchFocus = () => {
      if (!searchRef.current) {
         return
      }

      searchRef.current.focus()
   }

   const setCurrentLocation = () => {
      if (!navigator.geolocation) {
         handleGeolocationError(false)
         return
      }

      navigator.geolocation.getCurrentPosition(
         (position) => {
            setLocation({
               lat: position.coords.latitude,
               lng: position.coords.longitude,
            })
            setMyLocation({
               lat: position.coords.latitude,
               lng: position.coords.longitude,
            })
         },
         () => handleGeolocationError(true)
      )
   }

   const setCurrentCity = () => {
      if (!location || city) return

      const { lat, lng } = location
      const latlng = new window.google.maps.LatLng(lat, lng);

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ 'latLng': latlng }, (results, status) => {
         if (status !== google.maps.GeocoderStatus.OK || results.length <= 0) {
            setCity()
            return
         }

         const addresses = results[0].address_components
         const address = addresses.find(result => result.types.some(type => type === 'locality'))
         const city = address?.long_name ?? ''

         setCity(city)
         setMyCity(city)
      })
   }

   const initializeMap = async () => {
      if (loaded || map || !location || !city || !mapRef.current || !searchRef.current) {
         return
      }

      const newMap = new window.google.maps.Map(mapRef.current, {
         zoom: 12,
         center: location,
      });

      const marker = new window.google.maps.Marker({
         map: newMap,
         title: city,
         draggable: true,
         position: location,
      });

      const searchBox = new window.google.maps.places.SearchBox(searchRef.current);

      newMap.addListener("bounds_changed", () => {
         searchBox.setBounds(newMap.getBounds());
      })

      let markers = [marker]
      searchBox.addListener("places_changed", () => {
         const places = searchBox.getPlaces();

         if (places.length <= 0) {
            return
         }

         const place = places[0]

         if (!place.geometry || !place.geometry.location) {
            console.log("Returned place contains no geometry");
            return;
         }

         const searchCity = place.name
         const searchLocation = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
         }

         const searchMarker = new window.google.maps.Marker({
            map: newMap,
            draggable: true,
            title: searchCity,
            position: searchLocation,
         });

         markers.forEach((marker) => marker.setMap(null));
         markers = [searchMarker]

         newMap.setOptions({
            center: searchLocation,
         })

         setMap(newMap)
         setMarker(searchMarker)
         setLocation(searchLocation)
         setCity(searchCity)
      })

      setMap(newMap)
      setMarker(marker)
      setLoaded(true)
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

   const getDistanceFromMyLocation = () => {
      if (!location || !city || !myLocation || !myCity) {
         return
      }

      const { lat: lat1, lng: lng1 } = location
      const { lat: lat2, lng: lng2 } = myLocation

      if (lat1 === lat2 && lng1 === lng2) {
         return
      }

      const latlng1 = new window.google.maps.LatLng(lat1, lng1);
      const latlng2 = new window.google.maps.LatLng(lat2, lng2);

      // const earthRadioMt = 6371000
      // const distance = window.google.maps.geometry.spherical.computeDistanceBetween(latlng1, latlng2, earthRadioMt);
      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(latlng1, latlng2);

      console.log(`Distance from ${myCity} to ${city} es ${Math.round(distance / 100)} km.`)
   }

   const handleGeolocationError = (browserHasGeolocation) => () => {
      console.log(
         browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
      )
   }

   useEffect(() => {
      setCurrentLocation()

      return () => {
         setCity()
         setMap()
         setMarker()
         setLocation()
      }
   }, []);

   useEffect(() => {
      setSearchFocus()
   }, [searchRef]);

   useEffect(() => {
      setCurrentCity()
   }, [location]);

   useEffect(() => {
      initializeMap()
   }, [loaded, map, location, city, mapRef, searchRef]);

   useEffect(() => {
      addMarkerEvent()
   }, [marker]);

   useEffect(() => {
      getDistanceFromMyLocation()
   }, [location, city, myLocation, myCity]);

   return (
      <div className="map-wrapper">
         <div className="d-flex py-1">
            <input
               type="text"
               ref={searchRef}
               placeholder="Search location"
               className="form-control form-control-sm mx-1"
            />

            <span className="mx-1">
               City:
            </span>

            <input
               type="text"
               disabled={true}
               value={city ?? ''}
               className="form-control form-control-sm mx-1"
            />
            <span className="mx-1">
               Location:
            </span>

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