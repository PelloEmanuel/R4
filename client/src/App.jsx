import useFetch from './hooks/useFetch';
import useTheme from './hooks/useTheme';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Achievements from './components/Achievements';
import Projects from './components/Projects';
import Contact from './components/Contact';

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const { data, loading, error, retry } = useFetch('/api/r4');

  return (
    <>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main>
        {loading && <p className="state">Cargando R4…</p>}
        {error && (
          <div className="state">
            <p>{error}. Revisá tu conexión e intentá otra vez.</p>
            <button className="btn" onClick={retry}>Reintentar</button>
          </div>
        )}
        {data && data.profile && (
          <>
            <Hero profile={data.profile} />
            <About profile={data.profile} />
            <Skills skills={data.skills} />
            <Experience items={data.experience} />
            <Achievements items={data.achievements} />
            <Projects projects={data.projects} />
            <Contact />
          </>
        )}
      </main>
      <footer className="footer">© {new Date().getFullYear()} {data && data.profile ? data.profile.full_name : ''}</footer>
    </>
  );
}
