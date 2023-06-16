import styles from "../style/Hotel.module.css";
import Navbar from "@/components/Navbar/navbar";
import MailList from "@/components/MailList/mailList";
import Footer from "@/components/Footer/footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleArrowLeft,
  faCircleArrowRight,
  faCircleXmark,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { useCookies } from "react-cookie";
import { useRouter } from "next/router";

const Map = dynamic(() => import("components/Map/map"), {
  loading: () => <p>loading...</p>,
  ssr: false,
});

export async function getStaticPaths() {
  const data = await axios.get("http://localhost:8900/api/estates");
  const estates = await data.data;

  const paths = estates.map((estate) => ({
    params: { id: estate._id.toString() },
  }));

  return {
    paths: paths,
    fallback: false,
  };
}

export async function getStaticProps(context) {
  const { params } = context;

  const response = await axios.get(
    `http://localhost:8900/api/estates/${params.id}`
  );
  const data = await response.data;

  return {
    props: {
      estate: data,
    },
  };
}

const Hotel = ({ estate }) => {
  const router = useRouter();
  const [slideNumber, setSlideNumber] = useState(0);
  const [open, setOpen] = useState(false);
  const [cookie] = useCookies(["token"]);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    const fetchPrishtinaCoordinates = async () => {
      try {
        calculateDistance(42.6629138, 21.1655028);
      } catch (error) {
        console.log("Error calculating distance:", error);
      }
    };
    fetchPrishtinaCoordinates();
  }, []);

  const calculateDistance = (prishtinaLat, prishtinaLon) => {
    const radianFactor = Math.PI / 180;
    const earthRadiusKm = 6371.071; // Radius of the Earth in kilometers

    const lat1 = prishtinaLat * radianFactor;
    const lon1 = prishtinaLon * radianFactor;
    const lat2 = estate.latitude * radianFactor;
    const lon2 = estate.longitude * radianFactor;

    const diffLat = lat2 - lat1;
    const diffLon = lon2 - lon1;

    const a =
      Math.sin(diffLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(diffLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distanceInKm = earthRadiusKm * c;

    setDistance(distanceInKm.toFixed(2));
  };

  const photos = estate.photos.map((photo) => ({
    src: `${photo}`,
  }));

  const handleReservation = async () => {
    if (cookie.token) {
      try {
        const res = await axios.post(
          "http://localhost:8900/api/reservation",
          {
            startDate: "2023-05-16",
            endDate: "2023-05-18",
            estateId: estate?._id,
            paymentMethod: "Cash",
          },
          {
            headers: {
              Authorization: `Bearer ${cookie.token}`,
            },
          }
        );
        router.push({
          pathname: "/PaymentPage",
          query: { id: res.data.reservation.id },
        });
      } catch (error) {
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  };

  const handleChangeMessage = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.post(
        `http://localhost:8900/api/users/send-email/${estate?._id}`,
        { message },
        {
          headers: {
            Authorization: `Bearer ${cookie.token}`,
          },
        }
      );

      setSuccessMessage(response.data.message);
      setMessage('');

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Something went wrong while sending the message.');
      }

      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
  };

  const handleOpen = (i) => {
    setSlideNumber(i);
    setOpen(true);
  };

  const handleMove = (direction) => {
    let newSlideNumber;

    if (direction === "l") {
      newSlideNumber = slideNumber === 0 ? 5 : slideNumber - 1;
    } else {
      newSlideNumber = slideNumber === 5 ? 0 : slideNumber + 1;
    }

    setSlideNumber(newSlideNumber);
  };

  return (
    <div>
      <Navbar />
      <div className={styles.cont}>
        <div className={styles.hotelContainer}>
          {open && (
            <div className={styles.slider}>
              <FontAwesomeIcon
                icon={faCircleXmark}
                className={styles.close}
                onClick={() => setOpen(false)}
              />
              <FontAwesomeIcon
                icon={faCircleArrowLeft}
                className={styles.arrow}
                onClick={() => handleMove("l")}
              />
              <div className={styles.sliderWrapper}>
                <img
                  src={photos[slideNumber].src}
                  alt=""
                  className={styles.sliderImg}
                />
              </div>
              <FontAwesomeIcon
                icon={faCircleArrowRight}
                className={styles.arrow}
                onClick={() => handleMove("r")}
              />
            </div>
          )}
          <div className={styles.hotelWrapper}>
            <h1 className={styles.hotelTitle}>~{estate?.name}~</h1>
            <div className={styles.hotelImages}>
              {photos.map((photo, i) => (
                <div className={styles.hotelImgWrapper} key={i}>
                  <img
                    onClick={() => handleOpen(i)}
                    src={photo.src}
                    alt=""
                    className={styles.hotelImg}
                  />
                </div>
              ))}
            </div>
            <span className={styles.hotelPriceHighlight}>
              Book the estate for just <b>{estate.cheapestPrice}€</b> a month!
              <button
                onClick={handleReservation}
                className={`${styles.reserveButton} hover:bg-blue-700`}
              >
                Reserve or Book Now!
              </button>
            </span>
            <div className={styles.charLife}>
              <div className={styles.characteristics}>
                <h3>Characteristics:</h3>
                <p>
                  Number of rooms:{" "}
                  <span className={styles.red}>
                    {estate.characteristics.rooms}
                  </span>
                </p>
                <p>
                  Number of bathrooms:{" "}
                  <span className={styles.red}>
                    {estate.characteristics.bathrooms}
                  </span>
                </p>
                <p>
                  Parking available:{" "}
                  <span className={styles.red}>
                    {estate.characteristics.parking ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  Balcony available:{" "}
                  <span className={styles.red}>
                    {estate.characteristics.balcony ? "Yes" : "No"}
                  </span>
                </p>
              </div>
              <div className={styles.lifestyle}>
                <h3>Lifestyle:</h3>
                <p>
                  Smoking allowed:{" "}
                  <span className={styles.red}>
                    {estate.lifestyle.smoking ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  Student friendly:{" "}
                  <span className={styles.red}>
                    {estate.lifestyle.studentFriendly ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  Family friendly:{" "}
                  <span className={styles.red}>
                    {estate.lifestyle.familyFriendly ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  Pets allowed:{" "}
                  <span className={styles.red}>
                    {estate.lifestyle.petsAllowed ? "Yes" : "No"}
                  </span>
                </p>
                <div>
                  <div>
                    <h4>
                      Age Restrictions:{" "}
                      {estate.lifestyle.ageRestrictions &&
                      estate.lifestyle.ageRestrictions.length > 0 ? (
                        ""
                      ) : (
                        <span className={styles.red}>No</span>
                      )}
                    </h4>
                    {estate.lifestyle.ageRestrictions &&
                    estate.lifestyle.ageRestrictions.length > 0
                      ? estate.lifestyle.ageRestrictions.map((age, i) => (
                          <p key={i}>
                            <span className={styles.red}>{age}</span>
                          </p>
                        ))
                      : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Map latitude={estate.latitude} longitude={estate.longitude} />
          <div className={styles.hotelAddress}>
            <FontAwesomeIcon icon={faLocationDot} />
            <span>
              {estate.city} <br />
              {distance !== null
                ? `•Distance from Prishtina to ${estate.city} – ${distance}km`
                : ""}
            </span>
            <form
              className="max-w-md mx-auto p-4 shadow-md bg-white rounded-lg mt-5"
              onSubmit={handleSubmitEmail}
            >
              <div className="mb-4">
                <label
                  htmlFor="message"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                  rows="4"
                  value={message}
                  onChange={handleChangeMessage}
                  required
                />
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && (
              <p className="success-message">{successMessage}</p>
            )}
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <MailList />
      <Footer />
    </div>
  );
};

export default Hotel;
