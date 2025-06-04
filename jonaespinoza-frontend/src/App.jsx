import Layout from "./components/main/Layout";
import IntroImg from "./components/main/IntroImg"; // tu componente con la imagen fija
import AboutMe from "./components/main/AboutMe";
import Projects from "./components/Projects";
import Photos from "./components/photos/Photos";

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
