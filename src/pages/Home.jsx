import Hero from "../components/hero";
import History from "../components/History";
import Navbar from "../components/Navbar";
import Trending from "../components/Trending";
import FAC from "../components/FAC";

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />
      <Hero />
      <Trending />
      <History />
      <FAC />
    </div>
  );
};

export default Home;
