import Hero from "../components/hero";
import History from "../components/History";
import Trending from "../components/Trending";
import FAC from "../components/FAC";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="home-page">
      <Hero />
      <Trending />
      <History />
      <FAC />
      <Footer />
    </div>
  );
};

export default Home;
