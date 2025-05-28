import Layout from "./components/Layout";
import IntroImg from "./components/IntroImg"; // tu componente con la imagen fija
import AboutMe from "./components/AboutMe";
import Projects from "./components/Projects";
import Photos from "./components/Photos";

function App() {
  return (
    <Layout>
      <IntroImg />
      <AboutMe />
      <Projects />
      <Photos />
    </Layout>
  );
}

export default App;
