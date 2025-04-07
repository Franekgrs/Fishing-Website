
import { Link } from 'react-router-dom';
export const HomePage = () => {
    return (
      <div className="home-container">
        <div className='hero'>
          <div>
            <h1>Odkryj najlepsze łowiska w Polsce!</h1>
            <p>Przeglądaj, oceniaj i dziel się swoimi połowami z innymi wędkarzami.</p>
            <Link to="/lowiska" className='lowiska-button'>Przeglądaj łowiska</Link>
            </div>
        </div>
      </div>
    );
  };