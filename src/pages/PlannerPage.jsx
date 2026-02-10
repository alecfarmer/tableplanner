import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import App from '../App.jsx';

export default function PlannerPage({ findSeatMode }) {
  const { eventId } = useParams();

  useEffect(() => {
    document.title = eventId ? 'Event Planner — TablePlanner' : 'Seating Planner — TablePlanner';
  }, [eventId]);

  return <App eventId={eventId || null} findSeatMode={findSeatMode} />;
}
