import { createRoot } from 'react-dom/client';
import { App } from './App';
import '../../../styles/gallery.css';

document.body.dataset.app = 'field-service';
createRoot(document.getElementById('root')!).render(<App />);
