import Layout from "./components/main/Layout";
import IntroImg from "./components/main/IntroImg"; // tu componente con la imagen fija
import AboutMe from "./components/main/AboutMe";
import Projects from "./components/Projects";
import Photos from "./components/photos/Photos";
import Games from "./components/Games";
import Contact from "./components/Contact";

function App() {
  return (
    <Layout>
      <IntroImg />
      <AboutMe />
      <Projects />
      <Photos />
      <Games />
      <Contact />
    </Layout>
  );
}

export default App;
