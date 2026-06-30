import { useState } from 'react';
import './App.css';

import avatar from './assets/avatar.png';
import avatar3 from './assets/avatar3.png';
import profilo from './assets/profilo.png';
import { FaSearch } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { BsGrid3X3Gap } from "react-icons/bs";

const ruoli = [
  "Project Manager",
  "Ux Designer",
  "UI Designer",
  "Hr Manager",
  "Troll",
  "Data Analyst",
  "Dog Sitter",
 
]

function App() {
  const [dato, setDato] = useState(1);
  const [ruoloSelezionato, setRuoloSelezionato] = useState(null);
  const poi = [
    "Proiect manager", 
    "Hr Manager", 
    "Dog Sitter"

  ]

  

  return (
    <div className="App">
      
      {/* Step 1 */}
      {dato === 1 && (
        <div className = "container-sfondo">
        <div className="Step">
          <div className="logo">Flowlee</div>
          <h1>Benvenuto!<br />Raccontaci chi sei.</h1>
          <div className="input-group">
            <label>Nome</label>
            <input type="text" placeholder="Nome" />
          </div>
          <div className="input-group">
            <label>Cognome</label>
            <input type="text" placeholder="Cognome" />
          </div>
          <div className="input-group">
            <label>Genere</label>
            <select>
              <option>Maschile</option>
              <option>Femminile</option>
            </select>
          </div>
          <div className="input-group">
            <label>Data di nascita</label>
            <input type="text" placeholder="01/01/1999" />
          </div>
          <button className = "de" onClick = {() => setDato(2)}>
            successivo
          </button>

        
          </div>
          </div>
      )}

      {/* Step 2 */}
      {dato === 2 && (
        <div className = "container-sfondo">
        <div className="Step">
          <div className="logo">Flowlee</div>
          <h1>Ciao Marco!<br />Creiamo l'account.</h1>
          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="Email" />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Password" />
          </div>
          <div className="input-group">
            <label>Conferma password</label>
            <input type="password" placeholder="Conferma password" />
          </div>
          <button className="de" onClick={() => setDato(3)}>
            Successivo
            </button>

            
        </div>
        </div>
      )}

      {/* Step 3 */}
      {dato === 3 && (
        <div className = "container-sfondo">
        <div className="Step">
          <div className="logo">Flowlee</div>
          <img src={avatar} alt="avatar" className="avatar" />
          <h1>Sto inviando<br />il codice di verifica.</h1>
          <button className="de" onClick={() => setDato(4)}>Successivo</button>
        </div>
        </div>
      )}

      {/* Step 4 */} 
      {dato === 4 && (
        <div className = "container-sfondo">
        <div className="Step">
          <div className="logo">Flowlee</div>
          <h1>Inserisci il codice<br />che trovi sulla mail!</h1>
          <p style={{marginBottom: '20px', color: '#666', fontSize: '14px'}}>mariorossi@gmail.com</p>
          <div className="input-group">
            <label>Codice</label>
            <input type="text" placeholder="Inserisci codice"/>
          </div>
          <button className="WE">Invia di nuovo</button>
          <button className="era" onClick={() => setDato(5)}>Conferma</button>
        </div>
        </div>
      )}

      {/* Step 5 */}
      {dato === 5 && (
        <div className="Step">
          <img src={avatar3} alt="avatar3" className="avatar3" />
          <div>
            <h1>Piacere Flowlee! <br />Benvenuto. Creiamo il tuo profilo?</h1>
          </div>
          <div className="hey">
            <button className="wr" onClick={() => setDato(6)}>Crea profilo</button>

           
          </div>
        </div>

        
      )}

      {/* Step 6 */}
      {dato === 6 && (
        <div className = "container-sfondo">
        <div className="Step step-header-layout">
          <div className="top-navigation">
            <div className="arrows-container">
              <IoIosArrowDown className="top-icon" />
              <IoIosArrowUp className="top-icon" />
            </div>
            <div className="logo-center">Flowlee</div>
            <div className="right-icons">
              <BsGrid3X3Gap className="top-icon" />
              <HiOutlineUserCircle className="top-icon" />
            </div>
          </div>


          <h1>Benvenuto!<br />Raccontaci chi sei</h1>

          <div className="search-container">
            <span className="search-icon"><FaSearch /></span>
            <input type="text" placeholder="Cerca un ruolo" className="search-input" />
          </div>

          <div className="ruoli-container">
            {ruoli.map((ruolo) => (
              <button 
                key={ruolo} 
                type="button" 
                className={`ruolo-tag ${ruoloSelezionato === ruolo ? 'active' : ''}`}
                onClick={() => setRuoloSelezionato(ruolo)}
              >
                {ruolo}
              </button>
            ))}
          </div>

          <button 
            className="procedi-btn" 
            disabled={!ruoloSelezionato}
            onClick={() => setDato(7)}>
            Procedi
          </button>
        </div>
        </div>
      )}

   


      {/* Step 7 */}
      {dato === 7 && (
        <div className = "container-sfondo">
        <div className="Step step-header-layout">
          <div className="top-navigation">
            <div className="nav-left">
              <div className="arrows-container">
                <IoIosArrowDown className="top-icon" />
                <IoIosArrowUp className="top-icon" />
              </div>
              <div className="profilo-lavoro-container">
                <span>Profilo/Lavoro</span>
              </div>
            </div>

            <div className="nav-center">
              Flowlee
            </div>
         
            <div className="right-icons">
              <BsGrid3X3Gap className="top-icon" />
              <HiOutlineUserCircle className="top-icon" />
            </div>
          </div>
          
          <h1>Che lavoro fai?</h1>
          
          <div className="search-container">
            <span className="search-icon"><FaSearch /></span>
            <input type="text" placeholder="Cerca un ruolo" className="search-input" />
          </div>

          <div className="ruoli-container">
            {ruoli.map((ruolo) => (
              <button 
                key={ruolo} 
                type="button" 
                className={`ruolo-tag ${ruoloSelezionato === ruolo ? 'active' : ''}`}
                onClick={() => setRuoloSelezionato(ruolo)}
              >
                {ruolo}
              </button>
            ))}
          </div>

          
          <img 
            src={avatar3}
            alt="avatar" 
            className="avatar-decorativo" 
          />

          <button className="tr" onClick={() => setDato(8)}>
            Procedi
          </button>
        </div>
        </div>
      )}

      {/* Step 8 */}
      {dato === 8 && (
        <div className = "container-sfondo">
        <div className="Step step-header-layout">
          <div className="top-navigation">
            <div className="nav-left">
              <div className="poi">
                <IoIosArrowDown className="top-icon" />
                <IoIosArrowUp className="top-icon" />
              </div>
              <div className="profilo-lavoro-container">
                <span>Profilo/Foto</span>
              </div>
            </div>

            <div className="nav-center">
              Flowlee
            </div>

            <div className="right-icons">
              <BsGrid3X3Gap className="top-icon" />
              <HiOutlineUserCircle className="top-icon" />
            </div>
          </div>

          <div className="we">
            <h1>Carica una foto!</h1>

            <div className="profile-upload-container">
              <div className="profile-circle">
                <span>+</span>
              </div>
            </div>

            <div className="nome">
              <h1>Mario Rossi</h1>
              <span className="VE">@mariorossi@gmail.com</span>
            </div>

            <div className="button-container">
              {poi.map((sole, index) => (
                <button key={index} type="button" className="step">
                  {sole}
                </button>
              ))}
            </div>
            <img 
            src={avatar3}
            alt="avatar" 
            className="avatar-decorativo" 
          />


            <div className="rt">
            <button className = "qa btn-bianco" onClick = {() => setDato(9)}>
             Inizia
            </button>
           


            </div>
          </div>
        </div>
        </div>
      )}

      {/* Step 9 */}
      {dato === 9 && (
        <div className = "container-sfondo">
        <div className="Step step-header-layout">
          <div className="top-navigation">
            <div className="nav-left">
              <div className="poi">
                <IoIosArrowDown className="top-icon" />
                <IoIosArrowUp className="top-icon" />
              </div>
              <div className="profilo-lavoro-container">
                <span>Profilo/Foto</span>
              </div>
            </div>

            <div className="nav-center">
              Flowlee
            </div>

            <div className="right-icons">
              <BsGrid3X3Gap className="top-icon" />
              <HiOutlineUserCircle className="top-icon" />
            </div>
          </div>

          <div className="we">
            <h1>Carica una foto!</h1>

           <div className="profile-upload-container">
        <div className="profile-circle">
          
          <img src={profilo} alt="Profilo" className="profile-img" />
        </div>
      </div>
            <div className="nome">
              <h1>Mario Rossi</h1>
              <span className="VE">@mariorossi@gmail.com</span>
            </div>

            <div className="button-container">
              {poi.map((sole, index) => (
                <button key={index} type="button" className="step">
                  {sole}
                </button>
              ))}
            </div>
            <img 
            src={avatar3}
            alt="avatar" 
            className="avatar-decorativo" 
          />


            <div className="rt">
            <button className = "qa" onClick = {() => setDato(10)}>
             Inizia
            </button>
           


            </div>
          </div>
        </div>
        </div>
      )}




       
       
            
            

           
              
      
      

    
      
      


      
    </div>
  );
}

export default App;