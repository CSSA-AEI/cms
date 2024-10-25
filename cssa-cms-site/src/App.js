import EventForm from './EventForm';
import TestEventsButton from './GetUpcomingEvents';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className='form-upload'>
        <div>Form Upload</div>
        <EventForm />
      </div>
      
      <TestEventsButton />
    </div>
  );
}

export default App;
