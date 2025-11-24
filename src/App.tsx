import SleeveSelector from './components/SleeveSelector';
import './App.css';

function App() {
  return (
    <div className="App">
      <SleeveSelector />
      <footer style={{
        marginTop: '2rem',
        padding: '1rem',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#666',
        borderTop: '1px solid #ddd'
      }}>
        This page is not affiliated with or endorsed by Wizards of the Coast or Scryfall LLC.
        <br />
        Magic: The Gathering is a trademark of Wizards of the Coast LLC.
        <br />
        All card images, mana symbols, expansions and art related to Magic the Gathering is a property of Wizards of the Coast LLC.
        <br />
        Card images and data are sourced from scryfall.com.
      </footer>
    </div>
  );
}

export default App;
