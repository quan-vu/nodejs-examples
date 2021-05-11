import './App.css';
import Header from 'src/components/Layout/Header';
import Home from 'src/components/Home';


function App() {
  return (
    <div className="App">
      <Header/>
      <main>
        <Home/>
      </main>
    </div>
  );
}

export default App;
