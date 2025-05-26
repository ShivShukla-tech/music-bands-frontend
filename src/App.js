import React, { useEffect, useState } from "react";
import axios from "axios";
import { CiLocationOn } from "react-icons/ci";
import { MdDateRange } from "react-icons/md";

function App() {
  const [city, setCity] = useState("");
  const [searchedCity, setSearchedCity] = useState("");
  const [bands, setBands] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentLocatiom();
  }, []);

  const getCurrentLocatiom = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(position, "position");
          getCityFromCoords(
            position.coords.latitude,
            position.coords.longitude
          ).then((city) => {
            console.log("City from coordinates:", city);
            setCity(city);
          });
        },
        (error) => {
          getUserCity();
        }
      );
    } else {
      getUserCity();
    }
  };

  const getCityFromCoords = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            "User-Agent": "YourAppName/1.0", // required
          },
        }
      );
      const data = await response.json();
      return (
        data.address.city ||
        data.address.town ||
        data.address.village ||
        "Unknown"
      );
    } catch (error) {
      console.error("Error fetching city:", error);
      return "Error";
    }
  };

  const getUserCity = async () => {
    try {
      const res = await axios.get("https://get.geojs.io/v1/ip/geo.json");
      const userCity = res.data.city;
      setCity(userCity);
    } catch (error) {
      console.error("Error fetching user city:", error);
    }
  };

  const fetchBands = async (searchCity) => {
    try {
      setLoading(true);
      setIsSearch(false);
      setBands([]);
      // Fetch bands from the API based on the city
      const res = await axios.get(`http://[::1]:3001/api/bands/index`, {
        params: { city: searchCity.toLowerCase() },
      });
      setBands(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearch(true);
      setLoading(false);
      setSearchedCity(city);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city) {
      alert("Please enter a city.");
      return;
    }
    fetchBands(city);
  };

  return (
    <>
      <header>
        <h1 class="main-heading">Find Bands by City</h1>
      </header>

      <form class="search-form" onSubmit={handleSubmit}>
        <label for="default-search" class="sr-only">
          Search
        </label>
        <div class="search-container">
          <div class="icon-wrapper" aria-hidden="true">
            <svg
              class="search-icon"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M19 19l-4-4m0-7A7 7 0 111 8a7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            id="default-search"
            class="search-input"
            required
            value={city}
            onChange={(e) => {
              setIsSearch(false)
              setCity(e.target.value)
            }}
            placeholder="Enter city"
          />
          <button type="submit" class="search-button">
            Search
          </button>
        </div>
      </form>

      {bands.length > 0 ? (
        <>
          <p className="location-text-center">
            <CiLocationOn className="clr"/>
            Showing results for {searchedCity}
          </p>
          <div className="bands-grid">
            {bands.map((band, i) => (
              <div key={i} className="band-card">
                <h1 className="band-name">{band?.name}</h1>
                <p className="band-location">
                  <span className="bold-text">Location:</span>
                  <span className="location-text">
                  <CiLocationOn className="me-2 clr" />
                  {band?.location}
                  </span>
                </p>
                {/* <p className="band-date">
                  <span className="bold-text">Founded:</span>{" "}
                  <MdDateRange className="me-2" />
                  {band?.begin_date}
                </p> */}
                <p className="band-location">
                  <span className="bold-text">Founded:</span>
                  <span className="location-text">
                  <MdDateRange className="me-2 clr" />
                  {band?.begin_date}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </>
      ) : loading ? (
        <p class="loading-text">Loading...</p>
      ) : isSearch && !loading ? (
        <p class="no-results-text">
          <CiLocationOn className="clr"/> No bands found in&nbsp;{searchedCity}.
        </p>
      ) : (
        ""
      )}
    </>
  );
}

export default App;
