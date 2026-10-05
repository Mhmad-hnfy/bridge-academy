import Hero from "../Components/Hero";
import Team from "../Components/Team";
import Courses from "../Components/Courses";
import LearningJourney from "../Components/LearningJourney";
import NotificationsDisplay from "../Components/NotificationsDisplay";
import Footer from "../Components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <NotificationsDisplay />
      <Courses />
      <Team />
      <LearningJourney />
      <Footer />
    </>
  
  );
}
